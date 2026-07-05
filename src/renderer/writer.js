// Writer module (v2.7) — writing projects with 3 submodules on the nav rail:
// project (series → books → chapter editor; the Writer rail button itself),
// novel link (wiki word links into a Director novel), and chat note.

// ═══ ENTRY / ROUTING ══════════════════════════════════
async function renderWriterView() {
  S.view = 'writer';
  S.activeModule = 'writer';
  if (!S.write) { await renderWriteProjectList(); updateTopNavButton(); return; }
  if (S.writeTab === 'novel')     await renderWriteNovelLink();
  else if (S.writeTab === 'note') await renderWriteChatnote();
  else                            await renderWriteProject();
  updateTopNavButton();
}

async function setWriteTab(tab) {
  if (!S.write) return;
  S.writeTab = tab;
  await renderWriterView();
}

function goToWriteList() {
  S.write = null; S.writeTab = 'project';
  S.writeSeries = null; S.writeBook = null; S.writeChapter = null;
  S.writeWikiChapter = null; S.writeNote = null;
  renderWriterView();
}

async function selectWriteSeries(projectId, seriesId) {
  S.write = await api.write.getProject(projectId);
  S.writeTab = 'project';
  S.writeSeries = seriesId; S.writeBook = null; S.writeChapter = null;
  S.writeWikiChapter = null; S.writeNote = null;
  if (S.write) upsertEntityTab({ id: S.write.id, name: S.write.project_name, color_code: S.write.color_code }, 'write', 'writer');
  await renderWriterView();
}

// ═══ PROJECT LIST (no project active) ═════════════════
async function renderWriteProjectList() {
  const projects = await api.write.getProjects(S.nexus?.id ?? null);
  let h = `<div class="ph"><h4>${t('writer')}</h4>
    <button class="btn btn-g btn-i" onclick="openWriteProjectModal()" title="${t('writeProjectNew')}">${I.plus}</button>
  </div>`;
  if (!projects.length) {
    h += `<div class="empty" style="padding:32px 10px"><div class="ei">${I.writer}</div><p>${t('writeProjectNew')}</p></div>`;
  } else {
    for (const p of projects) {
      const col = p.color_code || '#6366f1';
      const open = S.writeOpenProjects.has(p.id);
      h += `<div class="fhead" onclick="tglWriteProject(${p.id})">
        <svg class="ftgl ${open ? 'open' : ''}" style="width:8px;height:8px;margin-right:6px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <div class="dot" style="background:${col};margin-right:6px"></div>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(p.project_name)}${p.codename ? ` <span style="color:var(--t3);font-size:.8em">· ${x(p.codename)}</span>` : ''}</span>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openWriteProjectModal(${p.id})" title="${t('edit')}">${I.edit}</button>
      </div>`;
      if (open) {
        const series = await api.write.getSeries(p.id);
        h += `<div class="fchildren">`;
        for (const s of series) {
          const scol = s.color_code || '#6366f1';
          h += `<div class="li" onclick="selectWriteSeries(${p.id},${s.id})" style="display:flex;align-items:center;gap:8px">
            <span style="display:flex;align-items:center;color:${scol}">${I.series}</span>
            <span class="name" style="flex:1">${x(s.name)}</span>
            <button class="btn btn-g btn-i" onclick="event.stopPropagation();openWriteSeriesModal(${p.id},${s.id})" title="${t('edit')}">${I.edit}</button>
          </div>`;
        }
        h += `<div class="li" onclick="openWriteSeriesModal(${p.id})" style="display:flex;align-items:center;gap:8px;color:var(--t3)">
          <span style="display:flex;align-items:center">${I.plus}</span>
          <span class="name" style="flex:1">${t('writeSeriesNew')}</span>
        </div></div>`;
      }
    }
  }
  q('#left-panel-inner').innerHTML = h;
  q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
    <div class="ei">${I.writer}</div><h3>${t('writer')}</h3><p>${t('nexusWelcomeText')}</p></div>`;
}

function tglWriteProject(id) {
  if (S.writeOpenProjects.has(id)) S.writeOpenProjects.delete(id);
  else S.writeOpenProjects.add(id);
  renderWriteProjectList();
}

// ═══ SUBMODULE: PROJECT (series → books → chapters) ════
async function renderWriteProject() {
  const p = S.write;
  const series = await api.write.getSeries(p.id);
  const pcol = p.color_code || '#6366f1';
  let lh = `<div class="ph"><h4 style="border-left:3px solid ${pcol};padding-left:8px">${x(p.project_name)}</h4>
    <button class="btn btn-g btn-i" onclick="openWriteProjectModal(${p.id})" title="${t('edit')}">${I.edit}</button>
  </div>
  <div class="ph" style="margin-top:10px"><h4>${t('writeSeries')}</h4>
    <button class="btn btn-g btn-i" onclick="openWriteSeriesModal(${p.id})" title="${t('writeSeriesNew')}">${I.plus}</button>
  </div>`;
  if (!series.length) {
    lh += `<div class="empty" style="padding:16px 10px"><p style="font-size:12px;color:var(--t3);text-align:center">${t('writeSeriesNew')}</p></div>`;
  } else {
    for (const s of series) {
      const col = s.color_code || '#6366f1';
      const act = S.writeSeries === s.id;
      lh += `<div class="li ${act ? 'active' : ''}" onclick="openWriteSeriesBooks(${s.id})" style="display:flex;align-items:center;gap:8px">
        <div class="dot" style="background:${col}"></div>
        <span class="name" style="flex:1">${x(s.name)}</span>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openWriteSeriesModal(${p.id},${s.id})" title="${t('edit')}">${I.edit}</button>
      </div>`;
    }
  }
  q('#left-panel-inner').innerHTML = lh;

  if (S.writeSeries && S.writeBook) await renderWriteBookPage();
  else if (S.writeSeries) await renderWriteBookGrid();
  else q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
    <div class="ei">${I.series}</div><h3>${x(p.project_name)}</h3><p>${t('writeSeriesNew')}</p></div>`;
}

async function openWriteSeriesBooks(seriesId) {
  S.writeSeries = seriesId; S.writeBook = null; S.writeChapter = null;
  await renderWriteProject();
  updateTopNavButton();
}

// ─── Book grid ───
async function renderWriteBookGrid() {
  const [series, books] = await Promise.all([
    api.write.getSeries(S.write.id),
    api.write.getBooks(S.writeSeries),
  ]);
  const s = series.find(sr => sr.id === S.writeSeries);
  if (!s) { S.writeSeries = null; return renderWriteProject(); }
  const col = s.color_code || '#6366f1';
  let h = `<div class="ch">
    <h2 style="border-left:4px solid ${col};padding-left:10px">${x(s.name)} <span style="color:var(--t3);font-weight:400;font-size:.75em">· ${t('writeBooks')}</span></h2>
    <button class="btn btn-p" style="padding:5px 11px;font-size:12.5px" onclick="openWriteBookModal(${s.id})">${I.plus} ${t('writeBookNew')}</button>
  </div>`;
  if (!books.length) {
    h += `<div class="empty" style="margin-top:60px"><div class="ei">${I.book}</div><p>${t('writeBookNew')}</p></div>`;
  } else {
    h += `<div class="series-grid">`;
    for (const b of books) {
      const bcol = b.color_code || '#6366f1';
      h += `<div class="series-card" onclick="openWriteBook(${b.id})" style="border-top:3px solid ${bcol}">
        <div class="series-card-icon">${I.book}</div>
        <div class="series-card-name">${x(b.name)}</div>
        <div class="series-card-memo">${b.chapter_count} ${t('writeChapters')}</div>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openWriteBookModal(${s.id},${b.id})" title="${t('edit')}">${I.edit}</button>
      </div>`;
    }
    h += `</div>`;
  }
  q('#main-inner').innerHTML = h;
}

async function openWriteBook(bookId) {
  S.writeBook = bookId; S.writeChapter = null;
  await renderWriteBookPage();
}

function closeWriteBook() {
  clearTimeout(_wchapSaveTimer);
  S.writeBook = null; S.writeChapter = null;
  renderWriteBookGrid();
}

// ─── Book page: chapter list (1) + editor (3) ───
async function renderWriteBookPage() {
  const [books, chapters] = await Promise.all([
    api.write.getBooks(S.writeSeries),
    api.write.getChapters(S.writeBook),
  ]);
  const b = books.find(bk => bk.id === S.writeBook);
  if (!b) { S.writeBook = null; return renderWriteBookGrid(); }
  if (!S.writeChapter && chapters.length) S.writeChapter = chapters[0].id;
  if (S.writeChapter && !chapters.find(c => c.id === S.writeChapter)) S.writeChapter = chapters[0]?.id || null;
  const bcol = b.color_code || '#6366f1';
  let h = `<div class="ch">
    <h2 style="display:flex;align-items:center;gap:8px">
      <button class="btn btn-g btn-i" onclick="closeWriteBook()" title="${t('writeBooks')}">${I.return}</button>
      <span style="border-left:4px solid ${bcol};padding-left:10px">${x(b.name)}</span>
    </h2>
    <button class="btn btn-p" style="padding:5px 11px;font-size:12.5px" onclick="openWriteChapterModal(${b.id})">${I.plus} ${t('writeChapterNew')}</button>
  </div>
  <div class="wchap-split">
    <div class="wchap-list">`;
  if (!chapters.length) {
    h += `<div class="empty" style="padding:24px 8px"><p style="font-size:12px;color:var(--t3);text-align:center">${t('writeChapterNew')}</p></div>`;
  } else {
    for (let i = 0; i < chapters.length; i++) {
      const c = chapters[i];
      const ccol = c.color_code || '#6366f1';
      const act = S.writeChapter === c.id;
      h += `<div class="li ${act ? 'active' : ''}" onclick="selectWriteChapter(${c.id})" style="display:flex;align-items:center;gap:6px">
        <span class="cs-count" style="min-width:22px;text-align:center;border-left:3px solid ${ccol}">${c.chapter_order}</span>
        <span class="name" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(c.name)}</span>
        <span style="display:flex;flex-direction:column">
          ${i > 0 ? `<button class="btn btn-g btn-i wchap-move" onclick="event.stopPropagation();moveWriteChapter(${c.id},-1)" title="▲">▲</button>` : ''}
          ${i < chapters.length - 1 ? `<button class="btn btn-g btn-i wchap-move" onclick="event.stopPropagation();moveWriteChapter(${c.id},1)" title="▼">▼</button>` : ''}
        </span>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openWriteChapterModal(${b.id},${c.id})" title="${t('edit')}">${I.edit}</button>
      </div>`;
    }
  }
  h += `</div>
    <div class="wchap-editor" id="wchap-editor"></div>
  </div>`;
  q('#main-inner').innerHTML = h;
  if (S.writeChapter) await renderWriteChapterEditor(S.writeChapter);
  else q('#wchap-editor').innerHTML = `<div class="empty" style="margin-top:60px"><div class="ei">${I.document}</div><p>${t('writeChapterNew')}</p></div>`;
}

async function selectWriteChapter(id) {
  clearTimeout(_wchapSaveTimer);
  S.writeChapter = id;
  await renderWriteBookPage();
}

async function moveWriteChapter(id, dir) {
  await api.write.moveChapter(id, dir);
  await renderWriteBookPage();
}

// ─── Chapter editor: autosaving textarea + word-link highlights ───
let _wchapSaveTimer = null;
let _wchapRanges = [];   // [{start,end,color,chapterId}] in current textarea value
let _wchapLinks = [];    // word links of the open chapter
let _wchapSelText = '';

async function renderWriteChapterEditor(chapterId) {
  const [chapter, links] = await Promise.all([
    api.write.getChapter(chapterId),
    api.write.getWordLinks(chapterId),
  ]);
  if (!chapter) return;
  const wrap = q('#wchap-editor');
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="wchap-editor-head">
      <span style="font-weight:600;font-size:13.5px">${x(chapter.name)}</span>
      <span id="wchap-save-state" style="color:var(--t3);font-size:11.5px;margin-left:auto"></span>
    </div>
    <div class="wchap-wrap">
      <div id="wchap-backdrop" class="wchap-backdrop" aria-hidden="true"></div>
      <textarea id="wchap-text" class="wchap-text" spellcheck="false" data-chapter-id="${chapter.id}">${x(chapter.chapter_content || '')}</textarea>
    </div>
    <button id="wlink-float" class="btn btn-p wlink-float" style="display:none" onclick="openCreateLinkModal()">${t('writeCreateLink')}</button>`;
  const ta = q('#wchap-text');
  _wchapLinks = links;
  refreshWchapHighlights(ta.value, _wchapLinks, chapter.id);
  ta.addEventListener('input', () => {
    setWchapSaveState('…');
    clearTimeout(_wchapSaveTimer);
    _wchapSaveTimer = setTimeout(async () => {
      await api.write.updateChapterContent(chapter.id, ta.value);
      setWchapSaveState(t('saved'));
    }, 800);
    refreshWchapHighlights(ta.value, _wchapLinks, chapter.id);
  });
  ta.addEventListener('scroll', () => {
    const bd = q('#wchap-backdrop');
    if (bd) { bd.scrollTop = ta.scrollTop; bd.scrollLeft = ta.scrollLeft; }
  });
  ta.addEventListener('mouseup', (e) => handleWchapMouseUp(e, ta, chapter.id));
  ta.addEventListener('keyup', () => { if (ta.selectionStart === ta.selectionEnd) hideWlinkFloat(); });
}

function setWchapSaveState(txt) {
  const el = q('#wchap-save-state');
  if (el) el.textContent = txt;
}

// Rebuild the highlight ranges + backdrop for the current text.
function refreshWchapHighlights(text, links, chapterId) {
  const uniq = new Map(); // text_link -> color
  for (const l of links) {
    if (l.text_link && !uniq.has(l.text_link)) uniq.set(l.text_link, l.color_code || '');
  }
  const words = [...uniq.keys()].sort((a, b) => b.length - a.length);
  const ranges = [];
  for (const w of words) {
    let idx = 0;
    while ((idx = text.indexOf(w, idx)) !== -1) {
      const end = idx + w.length;
      if (!ranges.some(r => idx < r.end && end > r.start)) ranges.push({ start: idx, end, color: uniq.get(w) });
      idx = end;
    }
  }
  ranges.sort((a, b) => a.start - b.start);
  _wchapRanges = ranges.map(r => ({ ...r, chapterId }));
  const bd = q('#wchap-backdrop');
  if (!bd) return;
  let html = '';
  let pos = 0;
  for (const r of ranges) {
    html += x(text.slice(pos, r.start));
    const col = r.color;
    const st = col ? `style="text-decoration-color:${col};background:color-mix(in srgb, ${col} 22%, transparent)"` : '';
    html += `<mark class="wlink-mark" ${st}>${x(text.slice(r.start, r.end))}</mark>`;
    pos = r.end;
  }
  html += x(text.slice(pos));
  bd.innerHTML = html + '<br>';
  const ta = q('#wchap-text');
  if (ta) { bd.scrollTop = ta.scrollTop; bd.scrollLeft = ta.scrollLeft; }
}

function handleWchapMouseUp(e, ta, chapterId) {
  const start = ta.selectionStart, end = ta.selectionEnd;
  if (start !== end) {
    _wchapSelText = ta.value.slice(start, end);
    const btn = q('#wlink-float');
    if (btn && _wchapSelText.trim()) {
      btn.style.display = '';
      btn.style.left = `${Math.min(e.clientX, window.innerWidth - 140)}px`;
      btn.style.top = `${Math.max(e.clientY - 40, 8)}px`;
    }
    return;
  }
  hideWlinkFloat();
  // Caret click on a linked word jumps to the wiki word list.
  const hit = _wchapRanges.find(r => start >= r.start && start <= r.end);
  if (hit) jumpToWikiChapter(chapterId);
}

function hideWlinkFloat() {
  const btn = q('#wlink-float');
  if (btn) btn.style.display = 'none';
}

function jumpToWikiChapter(chapterId) {
  S.writeTab = 'novel';
  S.writeWikiChapter = chapterId;
  renderWriterView();
}

// ─── Create-link modal: pick an object from the linked novel ───
async function openCreateLinkModal() {
  hideWlinkFloat();
  const text = (_wchapSelText || '').trim();
  if (!text || !S.writeChapter) return;
  const link = await api.write.getNovelLink(S.writeSeries);
  if (!link) { toast(t('writeNoNovelLinked'), 'err'); return; }
  const cats = await api.category.getAll(link.novel_id);
  openModal(t('writeCreateLink'), `
    <div class="fg"><label>${t('writeLinkedWord')}</label><div class="wlink-selected">${x(text)}</div></div>
    <div class="fg"><label>${t('writeCategory')}</label>
      <select id="wlink-cat" onchange="loadWlinkObjects()">
        <option value="">--</option>
        ${cats.map(c => `<option value="${c.id}">${x(c.category_name)}</option>`).join('')}
      </select>
    </div>
    <div id="wlink-objs" class="pick-list"></div>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
    </div>`);
}

async function loadWlinkObjects() {
  const catId = parseInt(q('#wlink-cat')?.value) || null;
  const wrap = q('#wlink-objs');
  if (!wrap) return;
  if (!catId) { wrap.innerHTML = ''; return; }
  const objs = await api.object.getAll(catId);
  wrap.innerHTML = objs.map(o => `<div class="pick-item" onclick="createWlinkForObject(${o.id})">${x(o.name)}</div>`).join('')
    || `<div class="empty" style="padding:10px"><p style="font-size:12px;color:var(--t3)">--</p></div>`;
}

async function createWlinkForObject(objectId) {
  const text = (_wchapSelText || '').trim();
  if (!text || !S.writeChapter) { closeModal(); return; }
  await api.write.createWordLink(S.writeChapter, objectId, text);
  closeModal();
  _wchapSelText = '';
  const ta = q('#wchap-text');
  _wchapLinks = await api.write.getWordLinks(S.writeChapter);
  if (ta) refreshWchapHighlights(ta.value, _wchapLinks, S.writeChapter);
  toast(t('saved'), 'ok');
}

// ═══ SUBMODULE: NOVEL LINK (wiki) ══════════════════════
async function renderWriteNovelLink() {
  const p = S.write;
  const series = await api.write.getSeries(p.id);
  if (S.writeSeries && !series.find(s => s.id === S.writeSeries)) S.writeSeries = null;
  if (!S.writeSeries && series.length) S.writeSeries = series[0].id;
  let lh = `<div class="ph"><h4>${t('writeNovelLink')}</h4></div>
    <div class="fg" style="padding:6px 10px;margin:0">
      <label>${t('writeSeries')}</label>
      <select onchange="setWriteWikiSeries(this.value)">
        ${series.map(s => `<option value="${s.id}" ${S.writeSeries === s.id ? 'selected' : ''}>${x(s.name)}</option>`).join('')}
      </select>
    </div>`;
  if (!series.length) {
    lh += `<div class="empty" style="padding:16px 10px"><p style="font-size:12px;color:var(--t3);text-align:center">${t('writeSeriesNew')}</p></div>`;
    q('#left-panel-inner').innerHTML = lh;
    q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px"><div class="ei">${I.relation}</div><h3>${t('writeNovelLink')}</h3><p>${t('writeSeriesNew')}</p></div>`;
    return;
  }
  const [link, novels, wikis] = await Promise.all([
    api.write.getNovelLink(S.writeSeries),
    api.project.getAll(null, S.nexus?.id ?? null),
    api.write.getWikiChapters(S.writeSeries),
  ]);
  const nid = link?.novel_id || '';
  lh += `<div class="fg" style="padding:6px 10px;margin:0">
      <label>${t('gameSelectNovel')}</label>
      <select onchange="setWriteNovel(this.value)">
        <option value="">--</option>
        ${novels.map(n => `<option value="${n.id}" ${nid === n.id ? 'selected' : ''}>${x(n.name)}</option>`).join('')}
      </select>
    </div>
    <div class="ph" style="margin-top:8px"><h4>${t('writeWiki')}</h4>
      <button class="btn btn-g btn-i" onclick="openWriteWikiModal()" title="${t('writeWikiNew')}">${I.plus}</button>
    </div>`;
  if (!wikis.length) {
    lh += `<div class="empty" style="padding:16px 10px"><p style="font-size:12px;color:var(--t3);text-align:center">${t('writeWikiNew')}</p></div>`;
  } else {
    for (const w of wikis) {
      const act = S.writeWikiChapter === w.chapter_id;
      lh += `<div class="li ${act ? 'active' : ''}" onclick="selectWriteWikiChapter(${w.chapter_id})" style="display:flex;align-items:center;gap:8px">
        <span style="display:flex;align-items:center">${I.document}</span>
        <span class="name" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(w.book_name)} · ${x(w.chapter_name)}</span>
        <span class="cs-count">${w.word_count}</span>
      </div>`;
    }
  }
  q('#left-panel-inner').innerHTML = lh;

  if (S.writeWikiChapter && wikis.find(w => w.chapter_id === S.writeWikiChapter)) await renderWriteWordList(S.writeWikiChapter, wikis);
  else q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
    <div class="ei">${I.relation}</div><h3>${t('writeNovelLink')}</h3><p>${t('writeWikiNew')}</p></div>`;
}

async function setWriteWikiSeries(val) {
  S.writeSeries = parseInt(val) || null;
  S.writeWikiChapter = null;
  await renderWriteNovelLink();
}

async function setWriteNovel(val) {
  try {
    await api.write.setNovelLink(S.writeSeries, parseInt(val) || null);
    toast(t('saved'), 'ok');
  } catch (e) {
    toast(e.message, 'err');
  }
  await renderWriteNovelLink();
}

async function selectWriteWikiChapter(chapterId) {
  S.writeWikiChapter = chapterId;
  await renderWriteNovelLink();
}

async function renderWriteWordList(chapterId, wikis) {
  const wiki = wikis.find(w => w.chapter_id === chapterId);
  const words = await api.write.getWordLinks(chapterId);
  let h = `<div class="ch">
    <h2>${x(wiki?.book_name || '')} · ${x(wiki?.chapter_name || '')} <span style="color:var(--t3);font-weight:400;font-size:.75em">· ${t('writeWordList')}</span></h2>
    <button class="btn btn-g btn-i" style="color:var(--danger)" onclick="deleteWriteWiki(${chapterId})" title="${t('delete')}">${I.delete}</button>
  </div>`;
  if (!words.length) {
    h += `<div class="empty" style="margin-top:60px"><div class="ei">${I.hashtag}</div><p>${t('writeWordList')}</p></div>`;
  } else {
    h += `<div class="objlist" style="max-width:680px">`;
    for (const w of words) {
      const col = w.color_code || '#6366f1';
      h += `<div class="objrow" style="cursor:default">
        <div class="odot" style="background:${col}"></div>
        <div style="flex:1;min-width:0">
          <div class="oname">${x(w.text_link)}</div>
          <div style="font-size:11.5px;color:var(--t3)">${x(w.category_name || '')}${w.object_name ? ` · ${x(w.object_name)}` : ''}</div>
        </div>
        <button class="btn btn-g btn-i" style="color:var(--danger)" onclick="deleteWriteWordLink(${w.id})" title="${t('delete')}">${I.delete}</button>
      </div>`;
    }
    h += `</div>`;
  }
  q('#main-inner').innerHTML = h;
}

async function deleteWriteWordLink(id) {
  await api.write.deleteWordLink(id);
  await renderWriteNovelLink();
}

async function deleteWriteWiki(chapterId) {
  if (!await uiConfirm(t('delete') + '?')) return;
  await api.write.deleteWiki(chapterId);
  S.writeWikiChapter = null;
  await renderWriteNovelLink();
}

async function openWriteWikiModal() {
  const [books, wikis] = await Promise.all([
    api.write.getBooks(S.writeSeries),
    api.write.getWikiChapters(S.writeSeries),
  ]);
  const used = new Set(wikis.map(w => w.chapter_id));
  let items = '';
  for (const b of books) {
    const chapters = await api.write.getChapters(b.id);
    const avail = chapters.filter(c => !used.has(c.id));
    if (!avail.length) continue;
    items += `<div style="font-size:11.5px;color:var(--t3);font-weight:600;margin:6px 0 3px">${x(b.name)}</div>`;
    items += avail.map(c => `<div class="pick-item" onclick="createWriteWikiFor(${c.id})">${c.chapter_order}. ${x(c.name)}</div>`).join('');
  }
  openModal(t('writeWikiNew'), `
    <div class="pick-list">${items || `<div class="empty" style="padding:10px"><p style="font-size:12px;color:var(--t3)">--</p></div>`}</div>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
    </div>`);
}

async function createWriteWikiFor(chapterId) {
  await api.write.createWiki(chapterId);
  closeModal();
  S.writeWikiChapter = chapterId;
  await renderWriteNovelLink();
  toast(t('created'), 'ok');
}

// ═══ SUBMODULE: CHAT NOTE ══════════════════════════════
async function renderWriteChatnote() {
  const p = S.write;
  const notes = await api.write.getNotes(p.id);
  if (S.writeNote && !notes.find(n => n.id === S.writeNote)) S.writeNote = null;
  let lh = `<div class="ph"><h4>${t('writeChatnote')}</h4>
    <button class="btn btn-g btn-i" onclick="openWriteNoteModal()" title="${t('writeNoteNew')}">${I.plus}</button>
  </div>`;
  if (!notes.length) {
    lh += `<div class="empty" style="padding:16px 10px"><p style="font-size:12px;color:var(--t3);text-align:center">${t('writeNoteNew')}</p></div>`;
  } else {
    for (const n of notes) {
      const col = n.color_code || '#6366f1';
      const act = S.writeNote === n.id;
      lh += `<div class="li ${act ? 'active' : ''}" onclick="selectWriteNote(${n.id})" style="display:flex;align-items:center;gap:8px">
        <div class="dot" style="background:${col}"></div>
        <span class="name" style="flex:1">${x(n.notename)}</span>
        <span class="cs-count">${n.chat_count}</span>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openWriteNoteModal(${n.id})" title="${t('edit')}">${I.edit}</button>
      </div>`;
    }
  }
  q('#left-panel-inner').innerHTML = lh;

  if (S.writeNote) await renderWriteChatBoard(S.writeNote, notes);
  else q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
    <div class="ei">${I.story}</div><h3>${t('writeChatnote')}</h3><p>${t('writeNoteNew')}</p></div>`;
}

async function selectWriteNote(id) {
  S.writeNote = id;
  await renderWriteChatnote();
}

async function renderWriteChatBoard(noteId, notes) {
  const n = notes.find(nt => nt.id === noteId);
  const chats = await api.write.getChats(noteId);
  const col = n?.color_code || '#6366f1';
  let h = `<div class="wchat-board">
    <div class="ch" style="margin-bottom:8px">
      <h2 style="border-left:4px solid ${col};padding-left:10px">${x(n?.notename || '')}</h2>
    </div>
    <div class="wchat-scroll" id="wchat-scroll">`;
  if (!chats.length) {
    h += `<div class="empty" style="margin-top:40px"><div class="ei">${I.story}</div><p>${t('writeChatPlaceholder')}</p></div>`;
  } else {
    for (const c of chats) {
      h += `<div class="wchat-row">
        <div class="wchat-bubble">${x(c.chat)}</div>
        <span class="wchat-time">${x((c.update_at || '').slice(0, 16))}</span>
        <button class="btn btn-g btn-i wchat-del" onclick="deleteWriteChat(${c.id})" title="${t('delete')}">${I.delete}</button>
      </div>`;
    }
  }
  h += `</div>
    <div class="wchat-inputrow">
      <input id="wchat-input" placeholder="${t('writeChatPlaceholder')}" onkeydown="if(event.key==='Enter')submitWriteChat(${noteId})">
      <button class="btn btn-p" onclick="submitWriteChat(${noteId})">${t('writeSend')}</button>
    </div>
  </div>`;
  q('#main-inner').innerHTML = h;
  const sc = q('#wchat-scroll');
  if (sc) sc.scrollTop = sc.scrollHeight;
  setTimeout(() => q('#wchat-input')?.focus(), 60);
}

async function submitWriteChat(noteId) {
  const input = q('#wchat-input');
  const text = input?.value.trim();
  if (!text) return;
  await api.write.createChat(noteId, text);
  await renderWriteChatnote();
}

async function deleteWriteChat(id) {
  if (!await uiConfirm(t('delete') + '?')) return;
  await api.write.deleteChat(id);
  await renderWriteChatnote();
}

// ═══ MODALS ════════════════════════════════════════════
async function openWriteProjectModal(id = null) {
  const p = id ? await api.write.getProject(id) : null;
  openModal(p ? `${t('edit')} — ${x(p.project_name)}` : t('writeProjectNew'), `
    <div class="fg"><label>${t('name')} *</label><input id="wp-name" value="${x(p?.project_name || '')}"></div>
    <div class="fg"><label>Codename</label><input id="wp-codename" value="${x(p?.codename || '')}"></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(p?.color)}</div>
    <div class="mfoot">
      ${p ? `<button class="btn btn-d" onclick="deleteWriteProject(${p.id})">${t('delete')}</button>` : ''}
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveWriteProject(${id || 'null'})">${t('save')}</button>
    </div>`);
  setTimeout(() => q('#wp-name')?.focus(), 60);
}

async function saveWriteProject(id) {
  const name = q('#wp-name').value.trim();
  if (!name) return;
  const codename = q('#wp-codename').value.trim();
  const color = parseInt(q('#sel-color').value) || null;
  try {
    if (id) {
      await api.write.updateProject(id, name, codename, color);
      if (S.write?.id === id) {
        S.write = await api.write.getProject(id);
        upsertEntityTab({ id, name: S.write.project_name, color_code: S.write.color_code }, 'write', 'writer');
      }
    } else {
      await api.write.createProject(name, codename, color, S.nexus?.id ?? null);
    }
  } catch (e) {
    toast(e.message, 'err');
    return;
  }
  closeModal();
  await renderWriterView();
  toast(t('saved'), 'ok');
}

async function deleteWriteProject(id) {
  if (!await uiConfirm(t('delete') + '?')) return;
  await api.write.deleteProject(id);
  closeModal();
  if (S.write?.id === id) goToWriteList();
  else await renderWriterView();
  toast(t('deleted'), 'ok');
}

async function openWriteSeriesModal(projectId, id = null) {
  const s = id ? (await api.write.getSeries(projectId)).find(sr => sr.id === id) : null;
  openModal(s ? `${t('edit')} — ${x(s.name)}` : t('writeSeriesNew'), `
    <div class="fg"><label>${t('name')} *</label><input id="ws-name" value="${x(s?.name || '')}"></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(s?.color)}</div>
    <div class="mfoot">
      ${s ? `<button class="btn btn-d" onclick="deleteWriteSeries(${s.id})">${t('delete')}</button>` : ''}
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveWriteSeries(${projectId},${id || 'null'})">${t('save')}</button>
    </div>`);
  setTimeout(() => q('#ws-name')?.focus(), 60);
}

async function saveWriteSeries(projectId, id) {
  const name = q('#ws-name').value.trim();
  if (!name) return;
  const color = parseInt(q('#sel-color').value) || null;
  if (id) await api.write.updateSeries(id, name, color);
  else await api.write.createSeries(projectId, name, color);
  closeModal();
  await renderWriterView();
  toast(t('saved'), 'ok');
}

async function deleteWriteSeries(id) {
  if (!await uiConfirm(t('delete') + '?')) return;
  await api.write.deleteSeries(id);
  closeModal();
  if (S.writeSeries === id) { S.writeSeries = null; S.writeBook = null; S.writeChapter = null; }
  await renderWriterView();
  toast(t('deleted'), 'ok');
}

async function openWriteBookModal(seriesId, id = null) {
  const b = id ? (await api.write.getBooks(seriesId)).find(bk => bk.id === id) : null;
  openModal(b ? `${t('edit')} — ${x(b.name)}` : t('writeBookNew'), `
    <div class="fg"><label>${t('name')} *</label><input id="wb-name" value="${x(b?.name || '')}"></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(b?.color)}</div>
    <div class="mfoot">
      ${b ? `<button class="btn btn-d" onclick="deleteWriteBook(${b.id})">${t('delete')}</button>` : ''}
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveWriteBook(${seriesId},${id || 'null'})">${t('save')}</button>
    </div>`);
  setTimeout(() => q('#wb-name')?.focus(), 60);
}

async function saveWriteBook(seriesId, id) {
  const name = q('#wb-name').value.trim();
  if (!name) return;
  const color = parseInt(q('#sel-color').value) || null;
  if (id) await api.write.updateBook(id, name, color);
  else await api.write.createBook(seriesId, name, color);
  closeModal();
  await renderWriterView();
  toast(t('saved'), 'ok');
}

async function deleteWriteBook(id) {
  if (!await uiConfirm(t('delete') + '?')) return;
  await api.write.deleteBook(id);
  closeModal();
  if (S.writeBook === id) { S.writeBook = null; S.writeChapter = null; }
  await renderWriterView();
  toast(t('deleted'), 'ok');
}

async function openWriteChapterModal(bookId, id = null) {
  const c = id ? (await api.write.getChapters(bookId)).find(ch => ch.id === id) : null;
  openModal(c ? `${t('edit')} — ${x(c.name)}` : t('writeChapterNew'), `
    <div class="fg"><label>${t('name')} *</label><input id="wc-name" value="${x(c?.name || '')}"></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(c?.color)}</div>
    <div class="mfoot">
      ${c ? `<button class="btn btn-d" onclick="deleteWriteChapter(${c.id})">${t('delete')}</button>` : ''}
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveWriteChapter(${bookId},${id || 'null'})">${t('save')}</button>
    </div>`);
  setTimeout(() => q('#wc-name')?.focus(), 60);
}

async function saveWriteChapter(bookId, id) {
  const name = q('#wc-name').value.trim();
  if (!name) return;
  const color = parseInt(q('#sel-color').value) || null;
  if (id) await api.write.updateChapter(id, name, color);
  else {
    const newId = await api.write.createChapter(bookId, name, color);
    S.writeChapter = newId;
  }
  closeModal();
  await renderWriteBookPage();
  toast(t('saved'), 'ok');
}

async function deleteWriteChapter(id) {
  if (!await uiConfirm(t('delete') + '?')) return;
  await api.write.deleteChapter(id);
  closeModal();
  if (S.writeChapter === id) S.writeChapter = null;
  await renderWriteBookPage();
  toast(t('deleted'), 'ok');
}

async function openWriteNoteModal(id = null) {
  const n = id ? (await api.write.getNotes(S.write.id)).find(nt => nt.id === id) : null;
  openModal(n ? `${t('edit')} — ${x(n.notename)}` : t('writeNoteNew'), `
    <div class="fg"><label>${t('name')} *</label><input id="wn-name" value="${x(n?.notename || '')}"></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(n?.color)}</div>
    <div class="mfoot">
      ${n ? `<button class="btn btn-d" onclick="deleteWriteNote(${n.id})">${t('delete')}</button>` : ''}
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveWriteNote(${id || 'null'})">${t('save')}</button>
    </div>`);
  setTimeout(() => q('#wn-name')?.focus(), 60);
}

async function saveWriteNote(id) {
  const name = q('#wn-name').value.trim();
  if (!name) return;
  const color = parseInt(q('#sel-color').value) || null;
  if (id) await api.write.updateNote(id, name, color);
  else {
    const newId = await api.write.createNote(S.write.id, name, color);
    S.writeNote = newId;
  }
  closeModal();
  await renderWriteChatnote();
  toast(t('saved'), 'ok');
}

async function deleteWriteNote(id) {
  if (!await uiConfirm(t('delete') + '?')) return;
  await api.write.deleteNote(id);
  closeModal();
  if (S.writeNote === id) S.writeNote = null;
  await renderWriteChatnote();
  toast(t('deleted'), 'ok');
}
