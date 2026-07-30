'use strict';
// Preload for extension windows ONLY — never used by the main app window
// (that's preload.js). This is the entire capability an installed GitHub
// extension gets: no window.api, no Node, no filesystem — just a table
// scoped to its own manifest-declared schema. Every extapi:table:* handler
// (main.js) resolves the calling extension's identity from the WINDOW
// itself (BrowserWindow.fromWebContents), never from anything this preload
// sends, so a compromised extension page cannot claim to be a different
// extension by forging an argument. See docs/EXTENSIONS.md.
const { contextBridge, ipcRenderer } = require('electron');

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld('extApi', {
  table: {
    getSchema: (localName)          => invoke('extapi:table:getSchema', localName),
    query:     (localName, filter)  => invoke('extapi:table:query', localName, filter),
    insert:    (localName, row)     => invoke('extapi:table:insert', localName, row),
    update:    (localName, id, row) => invoke('extapi:table:update', localName, id, row),
    delete:    (localName, id)      => invoke('extapi:table:delete', localName, id),
  },
});
