'use strict';
// Preload for plugin windows ONLY — never used by the main app window
// (that's preload.js). This is the entire capability an installed plugin
// gets: no window.api, no Node, no filesystem — just a table scoped to its
// own manifest-declared schema. Every pluginapi:table:* handler (main.js)
// resolves the calling plugin's identity from the WINDOW itself
// (BrowserWindow.fromWebContents), never from anything this preload sends,
// so a compromised plugin page cannot claim to be a different plugin by
// forging an argument. See docs/PLUGINS.md.
const { contextBridge, ipcRenderer } = require('electron');

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

const pluginApi = {
  table: {
    getSchema: (localName)          => invoke('pluginapi:table:getSchema', localName),
    query:     (localName, filter)  => invoke('pluginapi:table:query', localName, filter),
    insert:    (localName, row)     => invoke('pluginapi:table:insert', localName, row),
    update:    (localName, id, row) => invoke('pluginapi:table:update', localName, id, row),
    delete:    (localName, id)      => invoke('pluginapi:table:delete', localName, id),
  },
};

contextBridge.exposeInMainWorld('pluginApi', pluginApi);
// Backward compatibility for plugins written against the pre-v4.2.0
// "extension" naming — the same capability under its old name, nothing extra.
// Kept indefinitely: dropping it would silently break already-installed
// plugins, and it grants no access `pluginApi` doesn't already grant.
contextBridge.exposeInMainWorld('extApi', pluginApi);
