'use strict';
// ═══ Book "Author" (progress.md Phase 11) ═════════════════════════════
// An Author module IS a book (mockup docs/mockups/12-author.png): a
// chapter column on the left and the shared markdown editor
// (src/renderer/mdeditor.js — same component as Drafter/Detail/Scribe,
// with its own Ctrl+E edit/preview toggle, autosave and word count in the
// status bar) on the right. Chapters are wikilink-indexed under the
// bchp_<id> key kind (src/db/author.js + src/db/wiki.js).

const AUTHOR_VIEWS = ['editor', 'outline', 'reading'];
const AUTHOR_VIEW_LABEL = { editor: 'Editor', outline: 'Outline', reading: 'Reading' };

async function loadAuthorData(m) {
  const [chapters, ui] = await Promise.all([
    api.author.getChapters(m.id),
    api.module.getUi(m.id),
  ]);
  const prev = (S.authorData && S.authorData.moduleId === m.id) ? S.authorData : null;
  // A [[bchp]] wikilink jump (openEntityByKey) pre-selects its chapter.
  let selectedId = S.pendingAuthorChapter || prev?.selectedId || Number(ui.activeChapter) || null;
  S.pendingAuthorChapter = null;
  if (selectedId && !chapters.find(c => c.id === selectedId)) selectedId = null;
  if (!selectedId && chapters.length) selectedId = chapters[0].id;
  const view = AUTHOR_VIEWS.includes(ui.activeView) ? ui.activeView : 'editor';
  S.authorData = { moduleId: m.id, chapters, selectedId, view };
}

async function setAuthorView(view) {
  const d = S.authorData;
  d.view = view;
  await api.module.setUi(d.moduleId, 'activeView', view);
  if (S.inspectorData?.moduleId === d.moduleId) S.inspectorData.ui = { ...S.inspectorData.ui, activeView: view };
  renderNexusHome();
}

async function selectAuthorChapter(id) {
  const d = S.authorData;
  d.selectedId = id;
  await api.module.setUi(d.moduleId, 'activeChapter', String(id));
  renderNexusHome();
}

function buildAuthorMainHtml(m) {
  const d = (S.authorData && S.authorData.moduleId === m.id) ? S.authorData : null;
  if (!d) return `<div class="empty" style="margin-top:40px"><div class="ei">${moduleIconHtml(m)}</div><h3>${x(m.name)}</h3></div>`;
  const viewBar = `<div class="viewbar"><span class="vlbl">View:</span>
    ${AUTHOR_VIEWS.map(v => `<span class="vitem${v === d.view ? ' act' : ''}" onclick="setAuthorView('${v}')">${AUTHOR_VIEW_LABEL[v]}</span>`).join('')}
  </div>`;
  const toolbar = `<div class="classifier-toolbar">
    <button class="btn btn-p" onclick="openAuthorChapterModal(${m.id})">${I.plus} ${t('writeChapterNew')}</button>
    ${viewBar}
  </div>`;
  if (!d.chapters.length) {
    return `${toolbar}<div class="empty" style="margin-top:30px"><div class="ei">${moduleIconHtml(m)}</div>
      <h3>${x(m.name)}</h3><p>${t('nestEmpty')}</p></div>`;
  }
  // Chapter column (mockup 12) frames every view; the right side swaps.
  const rows = d.chapters.map((c, i) => `
    <div class="li${c.id === d.selectedId ? ' sel' : ''}" onclick="selectAuthorChapter(${c.id})">
      <span class="name">${i + 1}. ${x(c.name)}</span>
      <span class="acts">
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openAuthorChapterModal(${m.id},${c.id})" title="${t('edit')}">${I.edit}</button>
      </span>
    </div>`).join('');
  const column = `<div class="author-chapters">
    <div class="au-col-label" data-no-i18n>CHAPTERS · ${x(m.name)}</div>
    ${rows}
    <div class="li au-add" onclick="openAuthorChapterModal(${m.id})">${I.plus}<span class="name">${t('writeChapterNew')}</span></div>
  </div>`;
  let body;
  if (d.view === 'outline') body = buildAuthorOutlineHtml(d);
  else if (d.view === 'reading') body = buildAuthorReadingHtml(d);
  else body = `<div id="author-editor" class="scribe-editor au-editor"></div>`;
  return `${toolbar}<div class="author-layout">${column}<div class="author-main">${body}</div></div>`;
}

// Post-DOM hook (registered in renderNexusHome): mounts the markdown
// editor for the selected chapter; the editor itself pushes the word count
// and save state into the status bar.
function mountAuthorEditor() {
  const d = S.authorData;
  if (!d || S.activeModuleNode?.id !== d.moduleId || d.view !== 'editor') return;
  const el = q('#author-editor');
  const ch = d.chapters.find(c => c.id === d.selectedId);
  if (!el || !ch) return;
  createMarkdownEditor(el, {
    title: ch.name,
    content: ch.chapter_content || '',
    srcKey: `bchp_${ch.id}`,
    save: async (content) => {
      await api.author.updateContent(ch.id, content);
      ch.chapter_content = content;
    },
  });
}

// ── Outline view: markdown headings across every chapter ────────────────
function buildAuthorOutlineHtml(d) {
  let html = '';
  for (const [i, c] of d.chapters.entries()) {
    const heads = [...String(c.chapter_content || '').matchAll(/^(#{1,4})\s+(.+)$/gm)]
      .map(mm => ({ depth: mm[1].length, text: mm[2].trim() }));
    html += `<div class="au-outline-sec">
      <div class="au-outline-ch" onclick="selectAuthorChapter(${c.id}).then(()=>setAuthorView('editor'))">${i + 1}. ${x(c.name)}</div>
      ${heads.map(h2 => `<div class="au-outline-h" style="padding-left:${h2.depth * 14}px">${x(h2.text)}</div>`).join('')
        || `<div class="au-outline-h ghost" data-no-i18n>—</div>`}
    </div>`;
  }
  return `<div class="au-outline">${html}</div>`;
}

// ── Reading view: rendered markdown of the selected chapter ─────────────
function buildAuthorReadingHtml(d) {
  const ch = d.chapters.find(c => c.id === d.selectedId);
  if (!ch) return '';
  return `<div class="au-reading md-preview">${mdRender(ch.chapter_content || '', { resolveLink: typeof resolveWikiNameCached === 'function' ? resolveWikiNameCached : null })}</div>`;
}

// ── Chapter CRUD ────────────────────────────────────────────────────────
async function openAuthorChapterModal(moduleId, id = null) {
  const ch = id ? S.authorData?.chapters.find(c => c.id === id) : null;
  openModal(ch ? t('moduleEdit') : t('writeChapterNew'), `
    <div class="fg"><label>${t('name')} *</label><input id="ac-name" value="${x(ch?.name || '')}"></div>
    <div class="mfoot">
      ${ch ? `<button class="btn btn-d" onclick="deleteAuthorChapter(${ch.id})">${t('delete')}</button>` : ''}
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="submitAuthorChapter(${moduleId},${ch ? ch.id : 'null'})">${ch ? t('save') : t('create')}</button>
    </div>`);
  setTimeout(() => q('#ac-name').focus(), 60);
}

async function submitAuthorChapter(moduleId, id) {
  const name = q('#ac-name').value.trim();
  if (!name) return;
  if (id) await api.author.renameChapter(id, name);
  else {
    const newId = await api.author.createChapter(moduleId, name);
    S.authorData.selectedId = newId;
  }
  closeModal();
  await openModuleNode(moduleId);
  toast(id ? t('saved') : t('created'), 'ok');
}

async function deleteAuthorChapter(id) {
  if (!await uiConfirm(t('moduleDeleteConfirm'))) return;
  await api.author.deleteChapter(id);
  closeModal();
  const d = S.authorData;
  if (d.selectedId === id) d.selectedId = null;
  await openModuleNode(d.moduleId);
  toast(t('deleted'), 'ok');
}
