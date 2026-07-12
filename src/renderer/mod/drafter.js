'use strict';
// ═══ Doc "Drafter" (progress.md Phase 13) ══════════════════════════════
// A blank .md-style page (mockup docs/mockups/13-drafter.png) — the
// thinnest kind: the module's own `description` IS the document, edited
// with the shared markdown editor (src/renderer/mdeditor.js) plus its
// optional format bar. The editor's built-in Ctrl+E edit/preview toggle
// covers this kind's "2 views: Edit · Read", and wikilink indexing rides
// on the module_<id> key kind that every module already has.

const DRAFTER_VIEW_LABEL = { edit: 'Edit', read: 'Read' };

function buildDrafterMainHtml(m) {
  return `<div class="drafter-hint">${t('drafterHint')}</div>
    <div id="drafter-editor" class="scribe-editor" style="height:calc(100vh - 250px)"></div>`;
}

function mountDrafterEditor(m) {
  const el = q('#drafter-editor');
  if (!el) return;
  createMarkdownEditor(el, {
    title: m.name,
    content: m.description || '',
    srcKey: `module_${m.id}`,
    toolbar: true,
    save: async (content) => {
      await api.module.updateDescription(m.id, content);
      const node = findModuleNode(m.id);
      if (node) node.description = content;
      if (S.inspectorData?.moduleId === m.id) {
        await loadInspectorData(m.id);
        const dock = q('.module-inspector');
        if (dock && S.activeModuleNode?.id === m.id) dock.outerHTML = buildInspectorHtml(S.activeModuleNode);
      }
    },
  });
}
