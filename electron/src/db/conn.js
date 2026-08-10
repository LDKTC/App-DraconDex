'use strict';
const { Database: _RawDatabase } = require('node-sqlite3-wasm');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { app } = require('electron');

// Boot/query profiling, off unless DDX_PERF is set in the environment. The whole
// data layer runs synchronously in the main process before the first paint, so
// "how long did initDB take" is only answerable from in here.
//   DDX_PERF=1 node .claude/skills/run-dracondex/driver.mjs --fresh "evalmain 1"
// Recorded as well as logged: main-process stdout isn't forwarded by the
// run-dracondex driver, so `evalmain require('./src/db/core').perfLog()` is how
// a boot profile is actually read back.
const PERF = !!process.env.DDX_PERF;
const _perfLog = [];
const _now = () => (PERF ? performance.now() : 0);
const _t = PERF
  ? (label, t0) => {
      const ms = +(performance.now() - t0).toFixed(1);
      _perfLog.push({ label, ms });
      console.log(`[perf] ${label.padEnd(28)} ${ms}ms`);
    }
  : () => {};
const perfLog = () => _perfLog;

const STMT_CACHE_MAX = 256;

function adaptDb(rawDb) {
  const origPrepare = rawDb.prepare.bind(rawDb);
  const origExec = rawDb.exec.bind(rawDb);
  const origClose = typeof rawDb.close === 'function' ? rawDb.close.bind(rawDb) : null;

  // WHY THIS IS SAFE TO CACHE (it previously wasn't).
  // The original adapter prepared-and-finalized on every call because a
  // statement left open holds a schema read-lock, which made later DDL
  // (DROP/ALTER) fail with SQLITE_LOCKED "database table is locked" and
  // silently broke the Navigator migration. The precise cause is that
  // node-sqlite3-wasm's get() pulls one row from its internal generator and
  // then abandons it, so the statement stays mid-scan with a live cursor.
  // Statement._reset() (clear_bindings + sqlite3_reset) closes that cursor and
  // ends the implicit read transaction just as decisively as finalize() does —
  // so resetting in a finally is exactly as DDL-safe, without paying a full
  // sqlite3_prepare_v2 compile on every single query.
  // Load-bearing rule: never expose iterate(). It returns a suspended
  // generator; caching one would let two callers share a cursor and silently
  // truncate results. all() materialises before returning and get() resets in
  // finally, so no cached statement ever holds state between calls — which is
  // also why re-entrant use of the same SQL (recursion, or a query inside a
  // loop over another query's rows) cannot interleave.
  const cache = new Map();    // sql -> Statement          (Map order = LRU)
  const handles = new Map();  // sql -> {all,get,run}      (stable identity)
  let cacheOn = false;        // off until initDB() has finished — see getDB()
  let resetOk = null;         // feature check, resolved on first prepare

  const flush = () => {
    for (const s of cache.values()) {
      try { if (!s.isFinalized) s.finalize(); } catch (_) {}
    }
    cache.clear();
  };

  // Never cache DDL/PRAGMA: a statement compiled against a table a later DROP
  // removed would fail at step time, and PRAGMA compiles specially. Both are
  // rare, so bypassing costs nothing. This is belt-and-braces for any FUTURE
  // runtime DDL added outside initDB — the cacheOn gate already covers today's.
  const NO_CACHE_RE = /^\s*(?:--[^\n]*\n|\/\*[\s\S]*?\*\/|\s)*(CREATE|ALTER|DROP|REINDEX|VACUUM|ATTACH|DETACH|PRAGMA)\b/i;

  const acquire = (sql) => {
    const hit = cache.get(sql);
    if (hit) { cache.delete(sql); cache.set(sql, hit); return hit; }  // LRU touch
    const stmt = origPrepare(sql);
    if (resetOk === null) resetOk = typeof stmt._reset === 'function';
    if (!resetOk) return stmt;                                        // caller finalizes
    cache.set(sql, stmt);
    if (cache.size > STMT_CACHE_MAX) {
      const oldest = cache.keys().next().value;
      const victim = cache.get(oldest);
      cache.delete(oldest);
      try { victim.finalize(); } catch (_) {}
    }
    return stmt;
  };

  rawDb.prepare = (sql) => {
    const existing = handles.get(sql);
    if (existing) return existing;
    const exec = (method, args, transform) => {
      const uncacheable = !cacheOn || resetOk === false || NO_CACHE_RE.test(sql);
      if (uncacheable) {
        if (NO_CACHE_RE.test(sql)) flush();   // DDL issued via prepare().run()
        const stmt = origPrepare(sql);
        try {
          const r = stmt[method](args);
          return transform ? transform(r) : r;
        } finally { stmt.finalize(); }
      }
      const stmt = acquire(sql);
      if (!cache.has(sql)) {                  // resetOk === false fallback
        try {
          const r = stmt[method](args);
          return transform ? transform(r) : r;
        } finally { stmt.finalize(); }
      }
      try {
        const r = stmt[method](args);
        return transform ? transform(r) : r;
      } finally {
        // Reset frees the cursor. If it ever fails, drop this one from the
        // cache rather than leaving a half-live statement in it.
        try { stmt._reset(); }
        catch (_) { cache.delete(sql); try { stmt.finalize(); } catch (__) {} }
      }
    };
    const handle = {
      all: (...args) => exec('all', args),
      get: (...args) => exec('get', args, (r) => (r === null ? undefined : r)),
      run: (...args) => exec('run', args),
    };
    // Stable identity per SQL string is what keeps the ~140 hoisted
    // `const ins = db.prepare(...)` call sites working unchanged — and turns
    // them into genuine compile-once/execute-many statements for the first time.
    if (handles.size < STMT_CACHE_MAX * 4) handles.set(sql, handle);
    return handle;
  };

  // Every DDL/PRAGMA that goes through exec() originates in this file (verified:
  // no other src/db module calls .exec). Flushing on everything except the
  // transaction verbs needs no SQL classification.
  rawDb.exec = (sql) => {
    const head = String(sql).trimStart().slice(0, 9).toUpperCase();
    if (!(head.startsWith('BEGIN') || head.startsWith('COMMIT') || head.startsWith('ROLLBACK'))) flush();
    return origExec(sql);
  };

  // close() does NOT finalize pending statements in this library, so without
  // this the cached ones leak — importDatabaseMerge closes its source DB.
  if (origClose) rawDb.close = (...a) => { flush(); handles.clear(); return origClose(...a); };

  // initDB() issues ~30 ALTER TABLE and a DROP via prepare().run() rather than
  // exec(), so intercepting exec alone would NOT be enough. The gate simply
  // keeps the cache off for all of initDB, with no SQL classification at all.
  rawDb.setStatementCache = (on) => { if (!on) flush(); cacheOn = !!on; };
  rawDb.statementCacheSize = () => cache.size;

  // MEASURED, and by far the biggest single lever in this data layer: a
  // statement executed outside an explicit transaction costs ~2.5ms, while the
  // same statement inside one costs ~6µs — a ~400x difference. Under
  // journal_mode=DELETE every bare statement opens and closes its own implicit
  // read transaction, which on Windows means real file-locking syscalls; the
  // actual SQL work and the statement compile are noise next to it (compile
  // measured at ~1% of total).
  //
  // readTx wraps a multi-statement READ so all of its queries share one lock
  // acquisition. It is just db.transaction with an intention-revealing name —
  // reentrant, so nesting inside a write transaction is a no-op join.
  //
  // Only for SYNCHRONOUS functions: transaction() issues COMMIT as soon as fn
  // returns, so handing it an async fn would commit before the awaited work ran.
  rawDb.readTx = (fn) => rawDb.transaction(fn);
  // Reentrant: a transaction opened inside another (e.g. the Phase 24
  // migration calling save paths that reindex wikilinks transactionally)
  // joins the outer one instead of issuing a nested BEGIN.
  let txDepth = 0;
  rawDb.transaction = (fn) => (...args) => {
    if (txDepth > 0) return fn(...args);
    txDepth++;
    rawDb.exec('BEGIN');
    try {
      const result = fn(...args);
      rawDb.exec('COMMIT');
      return result;
    } catch (e) {
      try { rawDb.exec('ROLLBACK'); } catch (_) {}
      throw e;
    } finally {
      txDepth--;
    }
  };
  return rawDb;
}

let db;

// A sqlite file's header can declare WAL journal mode (bytes 18-19 = 2,2)
// with no accompanying -wal sidecar on disk — a shape node-sqlite3-wasm
// aborts hard trying to open, rather than throwing a catchable error. Forces
// the header back to legacy rollback-journal mode (1,1) in that case, which
// is safe since without a -wal file there's nothing WAL-specific to lose.
function forceLegacyJournalMode(filePath) {
  try {
    const hdr = Buffer.alloc(2);
    const hfd = fs.openSync(filePath, 'r+');
    fs.readSync(hfd, hdr, 0, 2, 18);
    if (hdr[0] === 2 || hdr[1] === 2) {
      hdr[0] = 1; hdr[1] = 1;
      fs.writeSync(hfd, hdr, 0, 2, 18);
      fs.fsyncSync(hfd);
    }
    fs.closeSync(hfd);
  } catch (_) {}
}

function getDB() {
  if (!db) {
    const dbDir = path.dirname(app.getPath('userData'));
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    const dbPath = path.join(dbDir, 'novel-manager.ddx');
    const legacyDbPath = path.join(dbDir, 'novel-manager.db');
    if (!fs.existsSync(dbPath) && fs.existsSync(legacyDbPath)) {
      // v.3.11+: the app's own working file is renamed .db -> .ddx once, in
      // place (same file, no data copy) — non-destructive, no-op on every
      // later launch since dbPath already exists after the first rename.
      try {
        fs.renameSync(legacyDbPath, dbPath);
        if (fs.existsSync(legacyDbPath + '-wal')) fs.renameSync(legacyDbPath + '-wal', dbPath + '-wal');
        if (fs.existsSync(legacyDbPath + '-shm')) fs.renameSync(legacyDbPath + '-shm', dbPath + '-shm');
      } catch (_) {}
    }
    if (fs.existsSync(dbPath) && !fs.existsSync(dbPath + '-wal')) forceLegacyJournalMode(dbPath);
    try { fs.rmSync(dbPath + '.lock', { recursive: true, force: true }); } catch (_) {}
    const tOpen = _now();
    db = adaptDb(new _RawDatabase(dbPath));
    _t('open database', tOpen);
    const tPragma = _now();
    db.exec("PRAGMA busy_timeout = 5000");
    // journal_mode stays DELETE — see forceLegacyJournalMode above; WAL makes
    // node-sqlite3-wasm hard-abort (not throw) when the -wal sidecar is missing.
    db.exec("PRAGMA journal_mode = DELETE");
    db.exec("PRAGMA foreign_keys = ON");
    // 8 MB page cache (default 2 MB) and in-memory temp tables for GROUP BY /
    // ORDER BY spills. Both are pure runtime tuning: no on-disk format change,
    // no durability trade. Deliberately NOT setting synchronous=NORMAL — under
    // rollback-journal mode that admits corruption on power loss, not just lost
    // transactions, and wrapping writes in transactions gets the same win safely.
    db.exec("PRAGMA cache_size = -8000");
    db.exec("PRAGMA temp_store = MEMORY");
    _t('pragmas', tPragma);
    const tInit = _now();
    // Required lazily: schema/init.js requires this file back (for _t/_now and
    // the has*() probes), so a top-level require here would be a load-time
    // cycle. Same pattern initDB itself uses for require('./wiki').
    require('./schema/init').initDB(db);
    _t('initDB (total)', tInit);
    // Only now — initDB is the one code path that issues DDL via prepare().run().
    db.setStatementCache(true);
  }
  return db;
}

function hasTable(conn, tableName) {
  return !!conn.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(tableName);
}

function hasColumn(conn, tableName, columnName) {
  if (!hasTable(conn, tableName)) return false;
  return conn.prepare(`PRAGMA table_info(${tableName})`).all().some((c) => c.name === columnName);
}

function hasAnyMissingColumns(conn, specs) {
  return specs.some(([tableName, columnNames]) =>
    hasTable(conn, tableName) && columnNames.some((columnName) => !hasColumn(conn, tableName, columnName))
  );
}



// Exported for the schema/ files, which were carved out of this one: they still
// call _now()/_t() for boot profiling and the has*() probes for their guards.
module.exports = {
  adaptDb, getDB, perfLog, forceLegacyJournalMode,
  hasTable, hasColumn, hasAnyMissingColumns, _now, _t,
};
