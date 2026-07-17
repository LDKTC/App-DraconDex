'use strict';
// Cloud Sync modal (Supabase prototype). One surface for everything:
// server config (Supabase URL + anon key), first push (generates the owner
// access key, shown ONCE), linking with an existing key, push/pull, and
// read-only key creation. All network work happens in the main process via
// api.sync.* — this file only renders and dispatches.

const SYNC_KEY_RE = /^[A-Za-z0-9]{4}(-[A-Za-z0-9]{4}){3}$/;

function syncErrToast(r) {
  const map = {
    no_config: 'syncErrNoConfig',
    not_linked: 'syncErrBadKey',
    already_linked: 'syncErrAlreadyLinked',
    bad_key_format: 'syncErrBadKeyFormat',
    bad_key: 'syncErrBadKey',
    not_owner: 'syncErrNotOwner',
    too_large: 'syncErrTooLarge',
    network: 'syncErrNetwork',
    auth: 'syncErrAuth',
    bad_snapshot: 'syncErrServer',
  };
  toast(t(map[r?.code] || 'syncErrServer'), 'error');
}

function syncFmtTime(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString(); } catch (_) { return iso; }
}

function syncMaskKey(key) {
  if (!key) return '';
  return `${key.split('-')[0]}-••••-••••-••••`;
}

// One-time key panel (first push / new read key) — the only place the
// plaintext ever appears.
function syncKeyPanelHtml(key, labelKey) {
  return `
    <div class="fg"><label>${t(labelKey)}</label>
      <div class="sync-key-row">
        <code class="sync-key-code" id="sync-shown-key">${x(key)}</code>
        <button class="btn btn-s btn-sm" onclick="syncCopyKey()">${t('syncCopy')}</button>
      </div>
    </div>
    <div class="modal-hint">${I.info}<span>${t('syncKeyShownOnce')}</span></div>`;
}

async function openSyncModal() {
  if (!S.nexus) return;
  const st = await api.sync.status(S.nexus.id);
  if (!st.dev && !st.configured) return syncRenderConfig();
  if (!st.linked) return syncRenderUnlinked(st);
  return syncRenderLinked(st);
}

// Dev runs are pinned to the local prototype server — no Supabase config.
function syncDevHintHtml(st) {
  return st.dev ? `<div class="modal-hint">${I.info}<span>${t('syncDevServer')}</span></div>` : '';
}

// --- state 1: server not configured (also reachable from the other states)
async function syncRenderConfig() {
  const cfg = await api.sync.getConfig();
  openModal(`☁ ${t('syncTitle')} — ${t('syncServerSettings')}`, `
    <div class="modal-hint">${I.info}<span>${t('syncConfigHint')}</span></div>
    <div class="fg"><label>${t('syncUrl')}</label><input id="sync-url" placeholder="https://xxxx.supabase.co" value="${x(cfg.url || '')}"></div>
    <div class="fg"><label>${t('syncAnonKey')}</label><input id="sync-anon-key" type="password" value="${x(cfg.anonKey || '')}"></div>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="syncSaveConfig()">${t('save')}</button>
    </div>`);
  setTimeout(() => q('#sync-url')?.focus(), 60);
}

async function syncSaveConfig() {
  const url = q('#sync-url').value.trim();
  const key = q('#sync-anon-key').value.trim();
  if (!url || !key) return;
  await api.sync.setConfig(url, key);
  toast(t('syncConfigSaved'), 'ok');
  openSyncModal();
}

// --- state 2: configured, vault not linked yet
function syncRenderUnlinked(st = {}) {
  openModal(`☁ ${t('syncTitle')}`, `
    ${syncDevHintHtml(st)}
    <div class="modal-hint">${I.info}<span>${t('syncNotLinked')}</span></div>
    <div class="fg"><label>${t('syncPush')}</label>
      <div class="sync-hint">${t('syncPushNewHint')}</div>
      <button class="btn btn-p" id="sync-push-btn" onclick="syncPushNow()">☁ ${t('syncPush')}</button>
    </div>
    <div class="fg"><label>${t('syncLinkTitle')}</label>
      <div class="sync-key-row">
        <input id="sync-link-key" placeholder="Xxxx-Xxxx-Xxxx-Xxxx" spellcheck="false">
        <button class="btn btn-s" id="sync-link-btn" onclick="syncLinkSubmit()">${t('syncLinkBtn')}</button>
      </div>
    </div>
    <div class="mfoot">
      ${st.dev ? '' : `<button class="btn btn-s" onclick="syncRenderConfig()">${t('syncServerSettings')}</button>`}
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
    </div>`);
}

// --- state 3: linked
function syncRenderLinked(st) {
  const owner = st.role === 'owner';
  const rows = [
    [t('syncRole'), owner ? t('syncRoleOwner') : t('syncRoleRead')],
    [t('syncCloudName'), x(st.remote?.name ?? st.cloudName ?? '—')],
    [t('syncLastPush'), syncFmtTime(st.lastPushAt)],
    [t('syncLastPull'), syncFmtTime(st.lastPullAt)],
    [t('syncRemoteUpdated'), st.remote ? syncFmtTime(st.remote.snapshotAt) : (st.remoteError ? t('syncErrNetwork') : '—')],
  ].map(([k, v]) => `<div class="sync-status-row"><span>${k}</span><b>${v}</b></div>`).join('');

  openModal(`☁ ${t('syncTitle')}`, `
    ${syncDevHintHtml(st)}
    ${rows}
    <div class="fg"><label>${t('syncAccessKey')}</label>
      <div class="sync-key-row">
        <code class="sync-key-code">${x(syncMaskKey(st.accessKey))}</code>
        <button class="btn btn-s btn-sm" onclick="syncCopyKey('${x(st.accessKey)}')">${t('syncCopy')}</button>
      </div>
    </div>
    <div id="sync-newkey-area"></div>
    <div class="mfoot">
      <button class="btn btn-d" onclick="syncUnlinkNow()">${t('syncUnlink')}</button>
      ${owner ? `<button class="btn btn-s" id="sync-readkey-btn" onclick="syncCreateReadKeyNow()">${t('syncReadKeyBtn')}</button>` : ''}
      <button class="btn btn-s" id="sync-pull-btn" onclick="syncPullNow()">${t('syncPull')}</button>
      ${owner ? `<button class="btn btn-p" id="sync-push-btn" onclick="syncPushNow()">${t('syncPush')}</button>` : ''}
    </div>`);
}

function syncBtnBusy(id, busy) {
  const b = q(id);
  if (!b) return;
  b.disabled = busy;
  if (busy) { b.dataset.label = b.textContent; b.textContent = t('syncWorking'); }
  else if (b.dataset.label) b.textContent = b.dataset.label;
}

async function syncPushNow() {
  syncBtnBusy('#sync-push-btn', true);
  const r = await api.sync.push(S.nexus.id);
  syncBtnBusy('#sync-push-btn', false);
  if (!r.ok) return syncErrToast(r);
  if (r.created) {
    // First push: the owner key exists only here — show it once.
    openModal(`☁ ${t('syncTitle')} — ${t('syncPushed')}`, `
      ${syncKeyPanelHtml(r.accessKey, 'syncAccessKey')}
      <div class="mfoot">
        <button class="btn btn-p" onclick="openSyncModal()">OK</button>
      </div>`);
    toast(t('syncPushed'), 'ok');
    return;
  }
  toast(t('syncPushed'), 'ok');
  openSyncModal();
}

async function syncPullNow() {
  if (!(await uiConfirm(t('syncPullConfirm')))) return;
  syncBtnBusy('#sync-pull-btn', true);
  const r = await api.sync.pull(S.nexus.id);
  syncBtnBusy('#sync-pull-btn', false);
  if (!r.ok) return syncErrToast(r);
  closeModal();
  toast(t('syncPulled'), 'ok');
  renderNexusHome();
}

async function syncLinkSubmit() {
  const key = q('#sync-link-key').value.trim();
  if (!SYNC_KEY_RE.test(key)) return toast(t('syncErrBadKeyFormat'), 'error');
  syncBtnBusy('#sync-link-btn', true);
  const r = await api.sync.link(S.nexus.id, key);
  syncBtnBusy('#sync-link-btn', false);
  if (!r.ok) return syncErrToast(r);
  toast(t('syncLinked'), 'ok');
  openSyncModal();
}

async function syncCreateReadKeyNow() {
  syncBtnBusy('#sync-readkey-btn', true);
  const r = await api.sync.createReadKey(S.nexus.id);
  syncBtnBusy('#sync-readkey-btn', false);
  if (!r.ok) return syncErrToast(r);
  const area = q('#sync-newkey-area');
  if (area) area.innerHTML = syncKeyPanelHtml(r.readKey, 'syncReadKeyBtn');
}

function syncCopyKey(key) {
  const v = key || q('#sync-shown-key')?.textContent || '';
  if (!v) return;
  navigator.clipboard.writeText(v).then(() => toast(t('syncKeyCopied'), 'ok'));
}

async function syncUnlinkNow() {
  if (!(await uiConfirm(t('syncUnlinkConfirm')))) return;
  await api.sync.unlink(S.nexus.id);
  toast(t('syncUnlinked'), 'ok');
  openSyncModal();
}
