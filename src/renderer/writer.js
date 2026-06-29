// Writer module — Library / Publishing management

async function renderWriterView() {
  S.activeModule = 'writer';
  const libs = await api.library.getProjects();
  const lp = q('#left-panel-inner');
  lp.innerHTML = `
    <div class="ph">
      <h4>${t('library')}</h4>
      <button class="ph-add" onclick="openLibraryModal()">${t('libraryNew')}</button>
    </div>
    ${libs.map(lib => `
      <div class="panel-item ${S.library===lib.id?'active':''}" onclick="selectLibrary(${lib.id})" style="${lib.color_code?`border-left:3px solid ${lib.color_code}`:''}">
        <span>${esc(lib.name)}</span>
      </div>`).join('')}`;
  if (S.library) await renderLibraryDetail(S.library);
  else {
    q('#main-inner').innerHTML = `<div class="empty"><div class="ei">${I.writer}</div><p>${t('libraryNew')}</p></div>`;
  }
  updateTopNavButton();
}

async function selectLibrary(id) {
  S.library = id; S.libraryTab = 'overview'; S.librarySeries = null; S.libraryDoc = null;
  const libs = await api.library.getProjects();
  const lib = libs.find(l => l.id === id);
  if (lib) upsertEntityTab(lib, 'library', 'writer');
  renderWriterView();
}

async function renderLibraryDetail(id) {
  const tabLabels = { overview:t('libraryOverview'), series:t('librarySeries'), tags:t('libraryTags') };
  const libs = await api.library.getProjects();
  const lib = libs.find(l => l.id === id);
  const col = lib?.color_code || '#6366f1';
  const mi = q('#main-inner');
  mi.innerHTML = `
    <div class="detail-head" style="border-left:4px solid ${col};padding-left:12px;margin-bottom:12px;display:flex;align-items:flex-start;gap:8px">
      <div style="flex:1;min-width:0">
        <h2 style="margin:0;font-size:1.1em">${esc(lib?.name||'')} <span style="color:var(--t3);font-weight:400;font-size:.8em">· ${esc(tabLabels[S.libraryTab]||S.libraryTab)}</span></h2>
        ${lib?.memo ? `<div style="color:var(--t3);font-size:.85em;margin-top:2px">${esc(lib.memo)}</div>` : ''}
      </div>
      <div class="detail-actions">
        <button class="btn btn-g btn-i" onclick="openLibraryModal(${id})" title="${t('edit')}">${I.edit}</button>
        <button class="btn btn-g btn-i" onclick="deleteLibrary(${id})" title="${t('delete')}" style="color:var(--danger)">${I.delete}</button>
      </div>
    </div>
    <div id="library-tab-body" class="tab-body"></div>`;
  await renderLibraryTab(id);
  updateTopNavButton();
}

function setLibraryTab(tab) {
  S.libraryTab = tab;
  S.librarySeries = null; S.libraryDoc = null;
  renderLibraryDetail(S.library);
}

async function renderLibraryTab(id) {
  const body = q('#library-tab-body');
  if (!body) return;
  if (S.libraryTab === 'overview') {
    const [descs, worlds] = await Promise.all([
      api.library.getDescriptions(id),
      api.library.getWorldLinks(id),
    ]);
    body.innerHTML = `
      <div class="section">
        <div class="section-head"><h5>${t('libraryOverview')}</h5><button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openLibraryDescModal(${id})">${t('add')}</button></div>
        ${descs.map(d => `
          <div class="desc-card">
            ${d.title ? `<div class="desc-title">${esc(d.title)}</div>` : ''}
            <div class="desc-content">${esc(d.content||'')}</div>
            <div class="desc-actions">
              <button class="btn-xs" onclick="openLibraryDescModal(${id},${d.id})">${t('edit')}</button>
              <button class="btn-xs danger" onclick="deleteLibraryDesc(${d.id})">${t('delete')}</button>
            </div>
          </div>`).join('')}
      </div>
      <div class="section">
        <div class="section-head"><h5>${t('libraryLinkedWorlds')}</h5><button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="linkLibraryWorld(${id})">${t('addWorld')}</button></div>
        ${worlds.map(w => `
          <div class="link-chip" style="${w.color_code?`border-left:3px solid ${w.color_code}`:''}">
            ${I.globe}<span>${esc(w.world_name)}</span>
            <button class="btn-xs danger" onclick="removeLibraryWorldLink(${w.id})">${t('remove')}</button>
          </div>`).join('')}
      </div>`;
  } else if (S.libraryTab === 'series') {
    await renderLibrarySeriesTab(id);
  } else if (S.libraryTab === 'tags') {
    await renderLibraryTagsTab(id);
  }
}

async function renderLibrarySeriesTab(libId) {
  const series = await api.library.getSeries(libId);
  const body = q('#library-tab-body');
  if (S.librarySeries) {
    await renderSeriesDetail(S.librarySeries);
    return;
  }
  body.innerHTML = `
    <div class="section">
      <div class="section-head"><h5>${t('librarySeries')}</h5><button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openSeriesModal(${libId})">${t('seriesNew')}</button></div>
      <div class="series-grid">
        ${series.map(s => `
          <div class="series-card" onclick="selectLibrarySeries(${s.id})">
            <div class="series-card-icon">${I.series}</div>
            <div class="series-card-name">${esc(s.name)}</div>
            ${s.memo ? `<div class="series-card-memo">${esc(s.memo)}</div>` : ''}
          </div>`).join('')}
      </div>
    </div>`;
}

function selectLibrarySeries(id) {
  S.librarySeries = id; S.librarySeriesTab = 'docs'; S.libraryDoc = null;
  renderLibrarySeriesTab(S.library);
}

async function renderSeriesDetail(seriesId) {
  const body = q('#library-tab-body');
  const seriesTabs = ['docs','overview','chars','objects','tags'];
  const seriesTabLabels = { docs:t('seriesDocs'), overview:t('seriesOverview'), chars:t('seriesChars'), objects:t('seriesObjects'), tags:t('seriesTags') };
  body.innerHTML = `
    <div class="detail-header" style="margin-bottom:8px">
      <button class="btn btn-s" style="padding:5px 11px;font-size:12px" onclick="clearLibrarySeries()">← ${t('librarySeries')}</button>
      <div class="detail-tabs" style="margin-left:8px">
        ${seriesTabs.map(tab => `<button class="tab-btn${S.librarySeriesTab===tab?' active':''}" onclick="setSeriesTab('${tab}')">${seriesTabLabels[tab]}</button>`).join('')}
      </div>
      <div class="detail-actions">
        <button class="btn btn-g btn-i" onclick="openSeriesModal(${S.library},${seriesId})">${t('edit')}</button>
        <button class="btn btn-g btn-i" style="color:var(--danger)" onclick="deleteSeries(${seriesId})">${t('delete')}</button>
      </div>
    </div>
    <div id="series-tab-body" class="tab-body"></div>`;
  await renderSeriesTab(seriesId);
}

function setSeriesTab(tab) {
  S.librarySeriesTab = tab; S.libraryDoc = null;
  renderSeriesDetail(S.librarySeries);
}

function clearLibrarySeries() {
  S.librarySeries = null; S.libraryDoc = null;
  renderLibrarySeriesTab(S.library);
}

async function renderSeriesTab(seriesId) {
  const stb = q('#series-tab-body');
  if (!stb) return;
  if (S.libraryDoc) {
    await renderDocumentEditor(S.libraryDoc, seriesId);
    return;
  }
  if (S.librarySeriesTab === 'docs') {
    const docs = await api.library.getDocs(seriesId);
    stb.innerHTML = `
      <div class="section-head"><h5>${t('seriesDocs')}</h5><button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openDocModal(${seriesId})">${t('docNew')}</button></div>
      <div class="doc-list">
        ${docs.map(d => `
          <div class="doc-item">
            <span class="doc-icon">${I.document}</span>
            <span class="doc-name" onclick="openDocument(${d.id})">${esc(d.name)}</span>
            <span class="doc-date">${d.updated_at||''}</span>
            <button class="btn-xs danger" onclick="deleteDoc(${d.id})">${t('delete')}</button>
          </div>`).join('')}
        ${docs.length===0?`<div class="empty-hint">${t('docNew')}</div>`:''}
      </div>`;
  } else if (S.librarySeriesTab === 'overview') {
    const [descs, novels] = await Promise.all([
      api.library.getSeriesDescs(seriesId),
      api.library.getSeriesNovels(seriesId),
    ]);
    stb.innerHTML = `
      <div class="section">
        <div class="section-head"><h5>${t('seriesOverview')}</h5><button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openSeriesDescModal(${seriesId})">${t('add')}</button></div>
        ${descs.map(d => `
          <div class="desc-card">
            ${d.title ? `<div class="desc-title">${esc(d.title)}</div>` : ''}
            <div class="desc-content">${esc(d.content||'')}</div>
            <div class="desc-actions">
              <button class="btn-xs" onclick="openSeriesDescModal(${seriesId},${d.id})">${t('edit')}</button>
              <button class="btn-xs danger" onclick="deleteSeriesDesc(${d.id})">${t('delete')}</button>
            </div>
          </div>`).join('')}
      </div>
      <div class="section">
        <div class="section-head"><h5>${t('addNovel')}</h5><button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="linkSeriesNovel(${seriesId})">${t('addNovel')}</button></div>
        ${novels.map(n => `
          <div class="link-chip" style="${n.color_code?`border-left:3px solid ${n.color_code}`:''}">
            <span>${esc(n.project_name)}</span>
            <button class="btn-xs danger" onclick="removeSeriesNovel(${n.id})">${t('remove')}</button>
          </div>`).join('')}
      </div>`;
  } else if (S.librarySeriesTab === 'chars') {
    await renderSeriesCharsTab(seriesId);
  } else if (S.librarySeriesTab === 'objects') {
    await renderSeriesObjectsTab(seriesId);
  } else if (S.librarySeriesTab === 'tags') {
    const [tags, allTags] = await Promise.all([api.library.getSeriesTags(seriesId), api.hashtag.getAll()]);
    const activeIds = new Set(tags.map(h=>h.id));
    stb.innerHTML = `
      <div class="section">
        <div class="section-head"><h5>${t('seriesTags')}</h5></div>
        <div class="tag-picker">
          ${allTags.map(h=>`<span class="tag-chip${activeIds.has(h.id)?' active':''}" onclick="toggleSeriesTag(${seriesId},${h.id})">${esc(h.tag_name)}</span>`).join('')}
        </div>
      </div>`;
  }
}

async function renderSeriesCharsTab(seriesId) {
  const stb = q('#series-tab-body');
  const chars = await api.library.getSeriesChars(seriesId);
  stb.innerHTML = `
    <div class="section">
      <div class="section-head"><h5>${t('seriesChars')}</h5><button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openAddSeriesEntityModal(${seriesId},'char')">${t('addChar')}</button></div>
      ${chars.map(c => `
        <div class="link-chip">
          ${I.person}<span>${esc(c.object_name)} <small>(${esc(c.project_name)} · ${esc(c.category_name)})</small></span>
          <button class="btn-xs danger" onclick="removeSeriesChar(${c.id})">${t('remove')}</button>
        </div>`).join('')}
      ${chars.length===0?`<div class="empty-hint">${t('addChar')}</div>`:''}
    </div>`;
}

async function renderSeriesObjectsTab(seriesId) {
  const stb = q('#series-tab-body');
  const objs = await api.library.getSeriesObjects(seriesId);
  stb.innerHTML = `
    <div class="section">
      <div class="section-head"><h5>${t('seriesObjects')}</h5><button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openAddSeriesEntityModal(${seriesId},'object')">${t('addObject')}</button></div>
      ${objs.map(o => `
        <div class="link-chip">
          ${I.layer}<span>${esc(o.object_name)} <small>(${esc(o.project_name)} · ${esc(o.category_name)})</small></span>
          <button class="btn-xs danger" onclick="removeSeriesObject(${o.id})">${t('remove')}</button>
        </div>`).join('')}
      ${objs.length===0?`<div class="empty-hint">${t('addObject')}</div>`:''}
    </div>`;
}

async function renderLibraryTagsTab(libId) {
  const body = q('#library-tab-body');
  body.innerHTML = `<div class="empty-hint">Library-level tags not implemented yet.</div>`;
}

// ═══ DOCUMENT EDITOR ═════════════════════════════════════
async function openDocument(docId) {
  S.libraryDoc = docId;
  renderSeriesTab(S.librarySeries);
}

async function renderDocumentEditor(docId, seriesId) {
  const stb = q('#series-tab-body');
  const doc = await api.library.getDoc(docId);
  if (!doc) return;
  let blocks = [];
  try { blocks = JSON.parse(doc.content_json || '[]'); } catch(_){}
  // Build initial HTML from blocks
  const editorHtml = blocksToHtml(blocks);
  stb.innerHTML = `
    <div class="doc-editor-bar">
      <button class="btn-xs" onclick="closeDocEditor()">← ${t('seriesDocs')}</button>
      <span class="doc-editor-name">${esc(doc.name)}</span>
      <div style="flex:1"></div>
      <button class="btn-xs" onclick="saveDocument(${docId},'${esc(doc.name)}')">${t('saved')}</button>
      <button class="btn-xs" onclick="exportDocPdf(${docId},'${esc(doc.name)}')">${t('exportPdf')}</button>
      <button class="btn-xs" onclick="exportDocDocx(${docId},'${esc(doc.name)}')">${t('exportDocx')}</button>
    </div>
    <div class="doc-editor-toolbar">
      <button class="tbar-btn" onclick="docCmd('bold')" title="Bold"><b>B</b></button>
      <button class="tbar-btn" onclick="docCmd('italic')" title="Italic"><i>I</i></button>
      <button class="tbar-btn" onclick="docCmd('formatBlock','h1')" title="H1">H1</button>
      <button class="tbar-btn" onclick="docCmd('formatBlock','h2')" title="H2">H2</button>
      <button class="tbar-btn" onclick="docCmd('formatBlock','p')" title="P">P</button>
      <button class="tbar-btn" onclick="insertMention(${docId})" title="Insert mention">@</button>
    </div>
    <div id="doc-editor" class="doc-editor" contenteditable="true" data-doc-id="${docId}" spellcheck="false">${editorHtml}</div>
    <div id="mention-dropdown" class="mention-dropdown hidden"></div>`;
  setupDocEditor(seriesId);
}

function blocksToHtml(blocks) {
  return blocks.map(block => {
    const inner = (block.nodes||[]).map(n => {
      if (n.type === 'mention') return `<span class="mention-chip" contenteditable="false" data-ref-type="${n.ref_type}" data-ref-id="${n.ref_id}">@${esc(n.label)}</span>`;
      return esc(n.text||'');
    }).join('');
    if (block.type === 'heading1') return `<h1>${inner}</h1>`;
    if (block.type === 'heading2') return `<h2>${inner}</h2>`;
    return `<p>${inner||'<br>'}</p>`;
  }).join('');
}

function htmlToBlocks(editorEl) {
  const blocks = [];
  for (const child of editorEl.childNodes) {
    let type = 'paragraph';
    if (child.nodeName === 'H1') type = 'heading1';
    else if (child.nodeName === 'H2') type = 'heading2';
    const nodes = [];
    for (const node of child.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent) nodes.push({ type:'text', text:node.textContent });
      } else if (node.classList && node.classList.contains('mention-chip')) {
        nodes.push({ type:'mention', ref_type:node.dataset.refType, ref_id:parseInt(node.dataset.refId), label:node.textContent.replace(/^@/,'') });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.textContent) nodes.push({ type:'text', text:node.textContent });
      }
    }
    blocks.push({ type, nodes });
  }
  return blocks;
}

function setupDocEditor(seriesId) {
  const editor = q('#doc-editor');
  if (!editor) return;
  let mentionStart = null;
  let mentionQuery = '';

  editor.addEventListener('keydown', async (e) => {
    if (e.key === '@') {
      mentionStart = window.getSelection().getRangeAt(0).cloneRange();
      mentionQuery = '';
      await showMentionDropdown(seriesId, '');
    } else if (q('#mention-dropdown') && !q('#mention-dropdown').classList.contains('hidden')) {
      if (e.key === 'Escape') { hideMentionDropdown(); }
      else if (e.key === 'Enter') {
        const first = q('#mention-dropdown .mention-option');
        if (first) { e.preventDefault(); first.click(); }
      } else if (e.key === 'Backspace' && mentionQuery.length === 0) {
        hideMentionDropdown();
      }
    }
  });

  editor.addEventListener('input', async () => {
    if (!q('#mention-dropdown').classList.contains('hidden')) {
      const sel = window.getSelection();
      if (sel.rangeCount) {
        const range = sel.getRangeAt(0);
        const textBefore = range.startContainer.textContent.slice(0, range.startOffset);
        const atIdx = textBefore.lastIndexOf('@');
        if (atIdx >= 0) {
          mentionQuery = textBefore.slice(atIdx + 1);
          await showMentionDropdown(seriesId, mentionQuery);
        } else {
          hideMentionDropdown();
        }
      }
    }
    autosaveDoc(editor);
  });
}

let _autosaveTimer = null;
function autosaveDoc(editor) {
  clearTimeout(_autosaveTimer);
  _autosaveTimer = setTimeout(() => {
    const docId = parseInt(editor.dataset.docId);
    const blocks = htmlToBlocks(editor);
    api.library.updateDoc(docId, editor.closest('[data-doc-name]')?.dataset.docName || '', JSON.stringify(blocks));
  }, 1500);
}

async function showMentionDropdown(seriesId, query) {
  const [chars, objs] = await Promise.all([
    api.library.getSeriesChars(seriesId),
    api.library.getSeriesObjects(seriesId),
  ]);
  const lower = query.toLowerCase();
  const all = [
    ...chars.filter(c => c.object_name.toLowerCase().includes(lower)).map(c => ({ label:c.object_name, ref_type:'character', ref_id:c.object_ref })),
    ...objs.filter(o => o.object_name.toLowerCase().includes(lower)).map(o => ({ label:o.object_name, ref_type:'object', ref_id:o.object_ref })),
  ];
  const dd = q('#mention-dropdown');
  if (!dd) return;
  if (!all.length) { dd.classList.add('hidden'); return; }
  dd.classList.remove('hidden');
  dd.innerHTML = all.slice(0,10).map(item =>
    `<div class="mention-option" data-ref-type="${item.ref_type}" data-ref-id="${item.ref_id}" data-label="${esc(item.label)}">${esc(item.label)} <small>${item.ref_type}</small></div>`
  ).join('');
  dd.querySelectorAll('.mention-option').forEach(opt => {
    opt.addEventListener('click', () => insertMentionChip(opt.dataset.refType, parseInt(opt.dataset.refId), opt.dataset.label));
  });
}

function hideMentionDropdown() {
  const dd = q('#mention-dropdown');
  if (dd) { dd.classList.add('hidden'); dd.innerHTML = ''; }
}

function insertMentionChip(refType, refId, label) {
  hideMentionDropdown();
  const editor = q('#doc-editor');
  if (!editor) return;
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  // Remove the @query text
  const node = range.startContainer;
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    const atIdx = text.lastIndexOf('@');
    if (atIdx >= 0) {
      range.setStart(node, atIdx);
      range.deleteContents();
    }
  }
  const chip = document.createElement('span');
  chip.className = 'mention-chip';
  chip.contentEditable = 'false';
  chip.dataset.refType = refType;
  chip.dataset.refId = refId;
  chip.textContent = `@${label}`;
  range.insertNode(chip);
  // Move cursor after chip
  range.setStartAfter(chip);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  autosaveDoc(editor);
}

function docCmd(cmd, arg) {
  document.execCommand(cmd, false, arg||null);
  q('#doc-editor')?.focus();
}

function insertMention(docId) {
  const editor = q('#doc-editor');
  if (!editor) return;
  editor.focus();
  document.execCommand('insertText', false, '@');
}

function closeDocEditor() {
  clearTimeout(_autosaveTimer);
  const editor = q('#doc-editor');
  if (editor) {
    const docId = parseInt(editor.dataset.docId);
    const blocks = htmlToBlocks(editor);
    api.library.updateDoc(docId, '', JSON.stringify(blocks));
  }
  S.libraryDoc = null;
  renderSeriesDetail(S.librarySeries);
}

async function saveDocument(docId, name) {
  const editor = q('#doc-editor');
  if (!editor) return;
  const blocks = htmlToBlocks(editor);
  await api.library.updateDoc(docId, name, JSON.stringify(blocks));
  toast(t('saved'));
}

async function exportDocPdf(docId, name) {
  const editor = q('#doc-editor');
  if (!editor) return;
  const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;max-width:800px;margin:40px auto;line-height:1.6}h1{font-size:2em}h2{font-size:1.5em}.mention-chip{background:#e0e7ff;color:#3730a3;padding:2px 6px;border-radius:4px}</style></head><body>${editor.innerHTML}</body></html>`;
  const result = await api.library.exportPdf(htmlContent, name+'.pdf');
  if (!result.canceled) toast(t('saved'));
}

async function exportDocDocx(docId, name) {
  const editor = q('#doc-editor');
  if (!editor) return;
  const blocks = htmlToBlocks(editor);
  const result = await api.library.exportDocx(blocks, name+'.docx');
  if (!result.canceled) toast(t('saved'));
}

// ═══ LIBRARY MODALS ══════════════════════════════════════
async function openLibraryModal(id) {
  let lib = null;
  if (id) {
    const libs = await api.library.getProjects();
    lib = libs.find(l => l.id === id);
  }
  const colors = S.colors || [];
  openModal(lib ? t('edit') : t('libraryNew'), `
    <label>${t('name')}<input id="m-lib-name" value="${esc(lib?.name||'')}"></label>
    <label>${t('memo')}<textarea id="m-lib-memo">${esc(lib?.memo||'')}</textarea></label>
    <label>${t('color')}
      <select id="m-lib-color">
        <option value="">—</option>
        ${colors.map(c => `<option value="${c.id}" ${lib?.color_ref===c.id?'selected':''} style="background:${c.color_code}">${esc(c.color_code)}</option>`).join('')}
      </select>
    </label>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveLibrary(${id||'null'})">${t('save')}</button>
    </div>`);
}

async function saveLibrary(id) {
  const name = q('#m-lib-name').value.trim();
  if (!name) return;
  const memo = q('#m-lib-memo').value.trim();
  const colorRef = parseInt(q('#m-lib-color').value)||null;
  if (id) await api.library.updateProject(id, name, memo, colorRef);
  else { const newId = await api.library.createProject(name, memo, colorRef); S.library = newId; }
  closeModal();
  renderWriterView();
}

async function deleteLibrary(id) {
  if (!confirm(t('delete')+'?')) return;
  await api.library.deleteProject(id);
  S.library = null;
  renderWriterView();
}

async function openLibraryDescModal(libId, id) {
  let desc = null;
  if (id) {
    const descs = await api.library.getDescriptions(libId);
    desc = descs.find(d => d.id === id);
  }
  openModal(id ? t('edit') : t('add'), `
    <label>${t('title')}<input id="m-ldesc-title" value="${esc(desc?.title||'')}"></label>
    <label>${t('content')}<textarea id="m-ldesc-content" rows="6">${esc(desc?.content||'')}</textarea></label>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveLibraryDesc(${libId},${id||'null'})">${t('save')}</button>
    </div>`);
}

async function saveLibraryDesc(libId, id) {
  const title = q('#m-ldesc-title').value.trim();
  const content = q('#m-ldesc-content').value.trim();
  if (id) await api.library.updateDescription(id, title, content);
  else await api.library.createDescription(libId, title, content);
  closeModal();
  renderLibraryTab(libId);
}

async function deleteLibraryDesc(id) {
  await api.library.deleteDescription(id);
  renderLibraryTab(S.library);
}

async function linkLibraryWorld(libId) {
  const worlds = await api.world.getAll();
  const existing = await api.library.getWorldLinks(libId);
  const existIds = new Set(existing.map(w => w.world_ref));
  const available = worlds.filter(w => !existIds.has(w.id));
  openModal(t('addWorld'), `
    <div class="pick-list">
      ${available.map(w => `<div class="pick-item" onclick="addLibraryWorldLink(${libId},${w.id})">${esc(w.name)}</div>`).join('')}
      ${!available.length ? `<div class="empty-hint">(no worlds)</div>` : ''}
    </div>`);
}

async function addLibraryWorldLink(libId, worldId) {
  await api.library.addWorldLink(libId, worldId);
  closeModal();
  renderLibraryTab(libId);
}

async function removeLibraryWorldLink(id) {
  await api.library.removeWorldLink(id);
  renderLibraryTab(S.library);
}

// ═══ SERIES MODALS ═══════════════════════════════════════
async function openSeriesModal(libId, id) {
  let series = null;
  if (id) {
    const all = await api.library.getSeries(libId);
    series = all.find(s => s.id === id);
  }
  openModal(id ? t('edit') : t('seriesNew'), `
    <label>${t('name')}<input id="m-series-name" value="${esc(series?.name||'')}"></label>
    <label>${t('memo')}<textarea id="m-series-memo">${esc(series?.memo||'')}</textarea></label>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveSeries(${libId},${id||'null'})">${t('save')}</button>
    </div>`);
}

async function saveSeries(libId, id) {
  const name = q('#m-series-name').value.trim();
  if (!name) return;
  const memo = q('#m-series-memo').value.trim();
  if (id) await api.library.updateSeries(id, name, memo);
  else { const newId = await api.library.createSeries(libId, name, memo); S.librarySeries = newId; }
  closeModal();
  S.libraryTab = 'series';
  renderLibrarySeriesTab(libId);
}

async function deleteSeries(id) {
  if (!confirm(t('delete')+'?')) return;
  await api.library.deleteSeries(id);
  S.librarySeries = null;
  renderLibrarySeriesTab(S.library);
}

async function openSeriesDescModal(seriesId, id) {
  let desc = null;
  if (id) {
    const descs = await api.library.getSeriesDescs(seriesId);
    desc = descs.find(d => d.id === id);
  }
  openModal(id ? t('edit') : t('add'), `
    <label>${t('title')}<input id="m-sdesc-title" value="${esc(desc?.title||'')}"></label>
    <label>${t('content')}<textarea id="m-sdesc-content" rows="6">${esc(desc?.content||'')}</textarea></label>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveSeriesDesc(${seriesId},${id||'null'})">${t('save')}</button>
    </div>`);
}

async function saveSeriesDesc(seriesId, id) {
  const title = q('#m-sdesc-title').value.trim();
  const content = q('#m-sdesc-content').value.trim();
  if (id) await api.library.updateSeriesDesc(id, title, content);
  else await api.library.createSeriesDesc(seriesId, title, content);
  closeModal();
  renderSeriesTab(seriesId);
}

async function deleteSeriesDesc(id) {
  await api.library.deleteSeriesDesc(id);
  renderSeriesTab(S.librarySeries);
}

async function linkSeriesNovel(seriesId) {
  const existing = await api.library.getSeriesNovels(seriesId);
  const existIds = new Set(existing.map(n => n.project_ref));
  const available = S.projects.filter(p => !existIds.has(p.id));
  openModal(t('addNovel'), `
    <div class="pick-list">
      ${available.map(p => `<div class="pick-item" onclick="addSeriesNovel(${seriesId},${p.id})">${esc(p.name)}</div>`).join('')}
      ${!available.length ? `<div class="empty-hint">(no projects)</div>` : ''}
    </div>`);
}

async function addSeriesNovel(seriesId, projectId) {
  await api.library.addSeriesNovel(seriesId, projectId);
  closeModal();
  renderSeriesTab(seriesId);
}

async function removeSeriesNovel(id) {
  await api.library.removeSeriesNovel(id);
  renderSeriesTab(S.librarySeries);
}

async function openAddSeriesEntityModal(seriesId, type) {
  const projects = S.projects || [];
  let html = `<div style="margin-bottom:8px"><select id="m-entity-project" onchange="loadEntityCatOpts(${seriesId},'${type}')"><option value="">— ${t('projects')} —</option>${projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></div>
    <div id="m-entity-cat-wrap"></div>
    <div id="m-entity-obj-wrap"></div>`;
  openModal(type==='char'?t('addChar'):t('addObject'), html);
}

async function loadEntityCatOpts(seriesId, type) {
  const projectId = parseInt(q('#m-entity-project').value)||null;
  if (!projectId) return;
  const cats = await api.category.getAll(projectId);
  const wrap = q('#m-entity-cat-wrap');
  wrap.innerHTML = `<select id="m-entity-cat" onchange="loadEntityObjOpts(${seriesId},'${type}')"><option value="">— category —</option>${cats.map(c=>`<option value="${c.id}">${esc(c.category_name)}</option>`).join('')}</select>`;
  q('#m-entity-obj-wrap').innerHTML = '';
}

async function loadEntityObjOpts(seriesId, type) {
  const catId = parseInt(q('#m-entity-cat').value)||null;
  const projectId = parseInt(q('#m-entity-project').value)||null;
  if (!catId || !projectId) return;
  const objs = await api.object.getAll(catId);
  const wrap = q('#m-entity-obj-wrap');
  wrap.innerHTML = `
    <div class="pick-list">
      ${objs.map(o=>`<div class="pick-item" onclick="${type==='char'?`addSeriesChar`:`addSeriesObject`}(${seriesId},${o.id})">${esc(o.name)}</div>`).join('')}
    </div>`;
}

async function addSeriesChar(seriesId, objectId) {
  await api.library.addSeriesChar(seriesId, objectId);
  closeModal();
  renderSeriesCharsTab(seriesId);
}

async function removeSeriesChar(id) {
  await api.library.removeSeriesChar(id);
  renderSeriesCharsTab(S.librarySeries);
}

async function addSeriesObject(seriesId, objectId) {
  await api.library.addSeriesObject(seriesId, objectId);
  closeModal();
  renderSeriesObjectsTab(seriesId);
}

async function removeSeriesObject(id) {
  await api.library.removeSeriesObject(id);
  renderSeriesObjectsTab(S.librarySeries);
}

async function toggleSeriesTag(seriesId, hashtagId) {
  await api.library.toggleSeriesTag(seriesId, hashtagId);
  renderSeriesTab(seriesId);
}

// ═══ DOCUMENT MODALS ═════════════════════════════════════
async function openDocModal(seriesId) {
  openModal(t('docNew'), `
    <label>${t('name')}<input id="m-doc-name"></label>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveNewDoc(${seriesId})">${t('save')}</button>
    </div>`);
}

async function saveNewDoc(seriesId) {
  const name = q('#m-doc-name').value.trim();
  if (!name) return;
  const newId = await api.library.createDoc(seriesId, name);
  closeModal();
  S.libraryDoc = newId;
  renderSeriesTab(seriesId);
}

async function deleteDoc(id) {
  if (!confirm(t('delete')+'?')) return;
  await api.library.deleteDoc(id);
  renderSeriesTab(S.librarySeries);
}
