// Opening a module node: KIND_MAIN_BUILDER (kind → renderer builder) and the
// module detail page shell that hosts it alongside the Inspector.

// ═══ Open a module — minimal placeholder content + the Module Inspector
// dock (Phase 4); the real per-kind renderers (Table/Canvas/Editor/...)
// are Phases 5-16 ═══════════════════════════════════════════════════
async function openModuleNode(id) {
  const m = findModuleNode(id);
  if (!m) return;
  if (m.kind === 'collector') { if (m.parent_id == null) toggleMajorExpand(id); return; }
  S.activeModuleNode = m;
  S.activeItemNode = null;
  S.kindBrowserPage = false;
  upsertModuleTab(id);
  updateStatusBar({ item: null, words: null, saveState: null });
  renderModuleRail();
  renderNexusHome();
  const loaders = [loadInspectorData(id)];
  if (m.kind === 'classifier' && typeof loadClassifierData === 'function') loaders.push(loadClassifierData(m));
  if (m.kind === 'manager' && typeof loadManagerData === 'function') loaders.push(loadManagerData(m));
  if (m.kind === 'locator' && typeof loadLocatorData === 'function') loaders.push(loadLocatorData(m));
  if (m.kind === 'chronicler' && typeof loadChroniclerData === 'function') loaders.push(loadChroniclerData(m));
  if (m.kind === 'wanderer' && typeof loadWandererData === 'function') loaders.push(loadWandererData(m));
  if (m.kind === 'narrator' && typeof loadNarratorData === 'function') loaders.push(loadNarratorData(m));
  if (m.kind === 'author' && typeof loadAuthorData === 'function') loaders.push(loadAuthorData(m));
  if (m.kind === 'scribe' && typeof loadChatScribeData === 'function') loaders.push(loadChatScribeData(m));
  if (m.kind === 'viewer' && typeof loadViewerData === 'function') loaders.push(loadViewerData(m));
  if (m.kind === 'connector' && typeof loadConnectorData === 'function') loaders.push(loadConnectorData(m));
  if (m.kind === 'sketcher' && typeof loadSketcherData === 'function') loaders.push(loadSketcherData(m));
  if (m.kind === 'designer' && typeof loadDesignerData === 'function') loaders.push(loadDesignerData(m));
  // renderNexusHome() above has already painted the shell, so the pane sits
  // there empty until these IPC loads resolve — on a large module that reads as
  // a click that did nothing.
  setBusy('#main-inner', true);
  try { await Promise.all(loaders); }
  finally { setBusy('#main-inner', false); }
  if (S.activeModuleNode?.id === id) renderNexusHome();
}

// Kind -> its main-content builder, defined in src/renderer/mod/<kind>.js.
// Falls back to the generic placeholder for kinds without a real renderer yet.
const KIND_MAIN_BUILDER = {
  classifier: () => typeof buildClassifierMainHtml === 'function' && buildClassifierMainHtml,
  manager: () => typeof buildManagerMainHtml === 'function' && buildManagerMainHtml,
  inspector: () => typeof buildDetailMainHtml === 'function' && buildDetailMainHtml,
  locator: () => typeof buildLocatorMainHtml === 'function' && buildLocatorMainHtml,
  chronicler: () => typeof buildChroniclerMainHtml === 'function' && buildChroniclerMainHtml,
  wanderer: () => typeof buildWandererMainHtml === 'function' && buildWandererMainHtml,
  narrator: () => typeof buildNarratorMainHtml === 'function' && buildNarratorMainHtml,
  author: () => typeof buildAuthorMainHtml === 'function' && buildAuthorMainHtml,
  scribe: () => typeof buildChatScribeMainHtml === 'function' && buildChatScribeMainHtml,
  drafter: () => typeof buildDrafterMainHtml === 'function' && buildDrafterMainHtml,
  viewer: () => typeof buildViewerMainHtml === 'function' && buildViewerMainHtml,
  connector: () => typeof buildConnectorMainHtml === 'function' && buildConnectorMainHtml,
  sketcher: () => typeof buildSketcherMainHtml === 'function' && buildSketcherMainHtml,
  designer: () => typeof buildDesignerMainHtml === 'function' && buildDesignerMainHtml,
};

function buildModuleDetailHtml(m) {
  const col = m.icon_color_code || m.color_code || 'var(--accent)';
  const builder = KIND_MAIN_BUILDER[m.kind]?.();
  const mainHtml = builder ? builder(m) : `<div class="empty" style="margin-top:40px">
        <div class="ei" style="color:${x(col)}">${moduleIconHtml(m)}</div>
        <h3>${x(m.name)}</h3>
        <p>${x(kindLabel(m.kind))}</p>
      </div>`;
  // Header per the approved mockups: name + kind chip, then a chips row of
  // tag links and the 🔗 link-count chip (A.3 #1-2). Chip data comes from
  // the inspector load that openModuleNode already awaited.
  const d = (S.inspectorData && S.inspectorData.moduleId === m.id) ? S.inspectorData : null;
  const tagChips = (d?.tags || []).map(tg =>
    `<span class="htag" style="border-color:${x(tg.color_code || '#6366f1')};color:${x(tg.color_code || '#6366f1')}">#${x(tg.tag_name)}</span>`).join('');
  const linkCount = d ? (d.links.outgoing.length + d.links.backlinks.length) : 0;
  const linkChip = `<span class="htag lk" data-no-i18n title="${t('moduleLink')}">🔗 ${linkCount} links</span>`;
  const renamingHead = S.renamingModuleId === m.id;
  const nameHtml = renamingHead
    ? `<input id="rename-head-${m.id}" class="rename-input" style="font-size:1.15em" value="${x(m.name)}" onclick="event.stopPropagation()" onblur="saveModuleRename(${m.id},this.value)" onkeydown="if(event.key==='Enter')this.blur();if(event.key==='Escape'){this.value=${x(JSON.stringify(m.name))};this.blur();}">`
    : `<span ondblclick="startRenameModule(${m.id})">${x(m.name)}</span>`;
  return `<div class="module-builder">
    <div class="module-main">
      <div class="detail-head module-head" style="border-left:4px solid ${x(col)};padding-left:12px">
        <h2 style="margin:0;font-size:1.15em;display:flex;align-items:center;gap:8px">
          <span class="kicon" style="color:${x(col)};cursor:pointer" onclick="event.stopPropagation();openModuleIconPopup(${m.id},this)">${moduleIconHtml(m)}</span>
          ${nameHtml}
          <span class="kind-chip" data-no-i18n>${x(kindLabel(m.kind))}${m.kind === 'classifier' && m.cat_type ? ` · ${m.cat_type.charAt(0).toUpperCase()}${m.cat_type.slice(1)}` : ''}</span>
        </h2>
        <div class="mtags">${tagChips}${linkChip}<button class="btn btn-g btn-i" onclick="openModuleTagPopup(${m.id}, this)" title="${t('tagLink')}">${I.plus}</button></div>
      </div>
      ${mainHtml}
    </div>
    <div id="inspector-resize" class="panel-resize-handle" onmousedown="startInspectorResize(event)" title="${t('resizePanel')}"></div>
    ${buildInspectorHtml(m)}
  </div>`;
}
