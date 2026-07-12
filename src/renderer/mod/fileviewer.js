'use strict';
// ═══ Import Dock section + file viewers (progress.md Phase 18) ═════════
// The hub's Import Dock section lists imported files (mockup 29):
// "นำเข้าโฟลเดอร์" scans a folder via the importdock:pickFolder dialog,
// rows show a linker chip (→ entity / ยังไม่ผูก), and clicking a file
// opens a read-only viewer page in the builder (image with zoom pills ·
// markdown via mdRender · plain text). Image files linked to an entity
// can be flagged "use as display image" — Manager cards and Classifier
// grids pick those up through the batched displayImages lookup. Editing
// an imported doc (docx -> Drafter conversion) is deferred to Phase 19's
// builder tabs; the viewer says so in its hint line.

// ── Hub section rows ────────────────────────────────────────────────────
// Lazy cache: loaded the first time the section is open, then kept fresh
// by the mutating actions below.
function ensureImportDock() {
  if (!S.nexus || S.importFiles !== undefined) return;
  S.importFiles = null; // loading marker
  Promise.all([api.importdock.list(S.nexus.id), api.wiki.quickIndex(S.nexus.id)]).then(([files, ix]) => {
    const byKey = new Map(ix.map(e2 => [e2.key, e2]));
    for (const f of files) f.entity = f.linker_key ? (byKey.get(f.linker_key) || null) : null;
    S.importFiles = files;
    renderNexusHome();
  });
}

function buildImportDockRows() {
  ensureImportDock();
  const files = S.importFiles;
  const importBtn = `<div class="li au-add" onclick="importDockPickFolder()">${I.plus}<span class="name">${t('importFolder')}</span></div>`;
  if (!files || !files.length) {
    return `${files === null || files === undefined ? '' : `<div class="empty" style="padding:14px 10px"><p>${t('nestEmpty')}</p></div>`}${importBtn}`;
  }
  let html = '';
  let lastFolder = null;
  for (const f of files) {
    if (f.folder !== lastFolder) {
      lastFolder = f.folder;
      const count = files.filter(v => v.folder === f.folder).length;
      html += `<div class="au-col-label dock-folder" data-no-i18n>${I.folder || ''} ${x(f.folder || '—')}/<span class="cnt">${count} files</span></div>`;
    }
    const chip = f.entity
      ? `<span class="dock-chip lk" data-no-i18n>→ ${x(f.entity.name)}</span>`
      : `<span class="dock-chip ghost">${t('notLinked')}</span>`;
    html += `<div class="li${S.filePreview?.id === f.id && !S.activeModuleNode ? ' sel' : ''}" onclick="openImportFile(${f.id})">
      <span class="dock-ficon dock-${x(f.file_type || 'file')}" data-no-i18n>▤</span>
      <span class="name" data-no-i18n>${x(f.file_name)}${f.use_as_image ? ' ★' : ''}</span>
      ${chip}
    </div>`;
  }
  return html + importBtn;
}

async function importDockPickFolder() {
  const res = await api.importdock.pickFolder();
  if (!res || res.canceled) return;
  const added = await api.importdock.add(S.nexus.id, res.files);
  S.importFiles = undefined; // refetch
  renderNexusHome();
  toast(`${t('created')} +${added}`, 'ok');
}

async function refreshImportDock() {
  S.importFiles = undefined;
  ensureImportDock();
}

// ── Builder file viewer ─────────────────────────────────────────────────
async function openImportFile(id) {
  const f = (S.importFiles || []).find(v => v.id === id);
  if (!f) return;
  const content = await api.importdock.readFile(id);
  S.filePreview = { ...f, content, zoom: 1 };
  S.sageHut = null;
  S.activeModuleNode = null;
  if (typeof builderNavigate === 'function') builderNavigate({ kind: 'file', id });
  renderNexusHome();
}

const fvBytes = (b) => typeof fmtBytes === 'function' ? fmtBytes(b) : `${b} B`;

function buildFileViewerHtml() {
  const f = S.filePreview;
  const c = f.content || {};
  let body;
  if (c.kind === 'image') {
    body = `<div class="fv-imgwrap"><img id="fv-img" src="${c.dataUrl}" style="transform:scale(${f.zoom})" alt=""></div>
      <div class="czoom" data-no-i18n>
        <button class="btn btn-g btn-i" onclick="fileViewerZoom(-0.2)">−</button>
        <span id="fv-zoom-label">${Math.round(f.zoom * 100)}%</span>
        <button class="btn btn-g btn-i" onclick="fileViewerZoom(0.2)">＋</button>
      </div>`;
  } else if (c.kind === 'md') {
    body = `<div class="md-preview au-reading">${mdRender(c.text || '', { resolveLink: typeof resolveWikiNameCached === 'function' ? resolveWikiNameCached : null })}</div>`;
  } else if (c.kind === 'txt') {
    body = `<pre class="fv-pre" data-no-i18n>${x(c.text || '')}</pre>`;
  } else if (c.kind === 'error') {
    body = `<div class="empty" style="margin-top:30px"><p data-no-i18n>${x(c.message || '')}</p></div>`;
  } else {
    // Binary docs (docx): no in-app reader — offer converting into a
    // Drafter module linked to this file (text extraction is out of scope,
    // per the Phase 18/19 deferral note).
    body = `<div class="empty" style="margin-top:30px"><p>${t('importDocxLater')}</p>
      <button class="btn btn-p" style="margin-top:10px" onclick="createDrafterFromFile(${f.id})">${I.plus} ${t('createAsDrafter')}</button></div>`;
  }
  const isImage = c.kind === 'image';
  const linkerChip = f.entity
    ? `<span class="htag lk" data-no-i18n onclick="openEntityByKey('${x(f.linker_key)}')">[[${x(f.entity.name)}]]</span>`
    : `<span class="pv ghost">${t('notLinked')}</span>`;
  return `<div class="detail-head module-head" style="border-left:4px solid var(--accent);padding-left:12px">
      <h2 style="margin:0;font-size:1.15em" data-no-i18n>${x(f.file_name)} <span class="kind-chip" data-no-i18n>File</span></h2>
      <div class="drafter-hint" data-no-i18n>${fvBytes(f.file_size)}${f.file_type === 'docx' ? ` · ${t('importDocxLater')}` : ''}</div>
    </div>
    <div class="cn-wrap fv-wrap">${body}</div>
    <div class="fv-foot">
      <span class="pk">${t('linkedTo')}</span> ${linkerChip}
      ${isImage && f.linker_key ? `<label class="fv-useimg"><input type="checkbox" ${f.use_as_image ? 'checked' : ''}
        onchange="toggleImportUseAsImage(${f.id}, this.checked)"> ${t('useAsImage')}</label>` : ''}
      <span style="flex:1"></span>
      <button class="btn btn-s" onclick="openImportLinkerModal(${f.id})">${t('changeLinker')}</button>
      <button class="btn btn-d" onclick="deleteImportFileRow(${f.id})">${t('delete')}</button>
    </div>`;
}

function fileViewerZoom(dz) {
  const f = S.filePreview;
  if (!f) return;
  f.zoom = Math.min(4, Math.max(0.2, f.zoom + dz));
  const img = q('#fv-img');
  if (img) img.style.transform = `scale(${f.zoom})`;
  const lbl = q('#fv-zoom-label');
  if (lbl) lbl.textContent = `${Math.round(f.zoom * 100)}%`;
}

async function openImportLinkerModal(id) {
  const f = (S.importFiles || []).find(v => v.id === id);
  const ix = await api.wiki.quickIndex(S.nexus.id);
  openModal(t('changeLinker'), `
    <div class="fg"><label>${t('moduleLink')}</label>
      <select id="il-key">
        <option value="">${t('notLinked')}</option>
        ${ix.map(e2 => `<option value="${x(e2.key)}" ${f?.linker_key === e2.key ? 'selected' : ''}>${x(e2.name)} (${x(e2.type)})</option>`).join('')}
      </select></div>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="submitImportLinker(${id})">${t('save')}</button>
    </div>`);
}

async function submitImportLinker(id) {
  const key = q('#il-key').value || null;
  await api.importdock.setLinker(id, key);
  closeModal();
  S.displayImageCache = null;
  await reopenImportFile(id);
  toast(t('saved'), 'ok');
}

async function toggleImportUseAsImage(id, on) {
  await api.importdock.setUseAsImage(id, on);
  S.displayImageCache = null;
  await reopenImportFile(id);
  toast(t('saved'), 'ok');
}

async function reopenImportFile(id) {
  S.importFiles = undefined;
  await new Promise(res => {
    Promise.all([api.importdock.list(S.nexus.id), api.wiki.quickIndex(S.nexus.id)]).then(([files, ix]) => {
      const byKey = new Map(ix.map(e2 => [e2.key, e2]));
      for (const f of files) f.entity = f.linker_key ? (byKey.get(f.linker_key) || null) : null;
      S.importFiles = files;
      res();
    });
  });
  await openImportFile(id);
}

async function deleteImportFileRow(id) {
  if (!await uiConfirm(t('moduleDeleteConfirm'))) return;
  await api.importdock.delete(id);
  S.importFiles = undefined;
  S.filePreview = null;
  S.displayImageCache = null;
  renderNexusHome();
  toast(t('deleted'), 'ok');
}

// docx → Drafter: creates an empty Drafter module named after the file and
// links the file to it (content stays in the source file — no docx parsing).
async function createDrafterFromFile(id) {
  const f = (S.importFiles || []).find(v => v.id === id);
  if (!f) return;
  const name = f.file_name.replace(/\.[^.]+$/, '');
  const moduleId = await api.module.create({ nexus_ref: S.nexus.id, parent_id: null, name, kind: 'drafter' });
  await api.importdock.setLinker(id, `module_${moduleId}`);
  S.importFiles = undefined;
  await reloadModuleTree();
  await openModuleNode(moduleId);
  toast(t('created'), 'ok');
}

// ── Display-image lookup for cards/grids ────────────────────────────────
// One batched fetch per session (invalidated on linker/image changes);
// returns linker_key -> import_file id. Callers then hydrate <img> tags
// through hydrateDisplayImages().
async function getDisplayImageMap() {
  if (S.displayImageCache) return S.displayImageCache;
  if (!S.nexus) return new Map();
  const rows = await api.importdock.displayImages(S.nexus.id);
  S.displayImageCache = new Map(rows.map(r => [r.linker_key, r.id]));
  return S.displayImageCache;
}

// Fills every <img data-display-key="..."> in the current DOM with its
// entity's display image (if one is flagged). Data URLs are cached.
async function hydrateDisplayImages() {
  const imgs = [...document.querySelectorAll('img[data-display-key]')];
  if (!imgs.length) return;
  const map = await getDisplayImageMap();
  S.displayImageData = S.displayImageData || new Map();
  for (const img of imgs) {
    const fileId = map.get(img.dataset.displayKey);
    if (!fileId) { img.closest('.card-thumb, .disp-thumb')?.classList.add('disp-empty'); continue; }
    if (!S.displayImageData.has(fileId)) {
      const c = await api.importdock.readFile(fileId);
      S.displayImageData.set(fileId, c?.kind === 'image' ? c.dataUrl : null);
    }
    const url = S.displayImageData.get(fileId);
    if (url) { img.src = url; img.closest('.disp-thumb')?.classList.remove('disp-empty'); }
  }
}
