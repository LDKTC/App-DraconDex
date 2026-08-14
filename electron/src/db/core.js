'use strict';
// Façade. This file used to be 2532 lines: the connection adapter, ~1100 lines
// of DDL/index/seed data, seven migrations and a 727-line import-merge. Plan
// part1 split those into conn.js, schema/* and import-merge.js — but ~29 files
// in src/db (and database.js) do `require('./core')`, so the public surface
// stays exactly what it was.
//
//   conn.js               open/adapt connections, statement cache, has*() probes
//   vault-context.js      which vault the current IPC call belongs to
//   schema/ddl.js         CREATE TABLE …           (data)
//   schema/indexes.js     CREATE INDEX …           (data)
//   schema/seed.js        first-run seed rows      (data)
//   schema/init.js        schema stamps + initAppDB/initVaultDB/initDB
//   schema/migrations.js  additive migrations + ensureIndexes()
//   import-merge.js       export a copy / merge an external database in
const { getDB, getAppDB, getVaultDB, createVaultDB, closeVault, closeAllVaults, pinVault, unpinVault, adaptDb, perfLog } = require('./conn');
const { exportDatabaseTo, importDatabaseMerge } = require('./import-merge');

module.exports = {
  getDB, getAppDB, getVaultDB, createVaultDB,
  closeVault, closeAllVaults, pinVault, unpinVault,
  adaptDb, exportDatabaseTo, importDatabaseMerge, perfLog,
};
