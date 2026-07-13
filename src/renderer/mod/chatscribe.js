'use strict';
// ═══ Chat "Scribe" (progress.md Phase 12) ══════════════════════════════
// Chat-style note page (mockup docs/mockups/06-scribe-chat.png): a Scribe
// module holds sessions ("1 session = 1 note"); each session is a stream
// of right-aligned bubbles with HH:MM timestamps, day dividers and an
// input row at the bottom (Enter sends). Bubble text runs through the
// markdown inline pass so [[wikilinks]] resolve and click through; the
// message text is wikilink-indexed under the session's chss_<id> key
// (src/db/chatscribe.js + src/db/wiki.js).

const CHATSCRIBE_VIEWS = ['chat', 'transcript'];
const CHATSCRIBE_VIEW_LABEL = { chat: 'Chat', transcript: 'Log' };

async function loadChatScribeData(m) {
  const [sessions, ui] = await Promise.all([
    api.chatscribe.getSessions(m.id),
    api.module.getUi(m.id),
  ]);
  const prev = (S.chatScribeData && S.chatScribeData.moduleId === m.id) ? S.chatScribeData : null;
  // A [[chss]] wikilink jump (openEntityByKey) pre-selects its session.
  let selectedId = S.pendingChatSession || prev?.selectedId || Number(ui.activeSession) || null;
  S.pendingChatSession = null;
  if (selectedId && !sessions.find(s => s.id === selectedId)) selectedId = null;
  if (!selectedId && sessions.length) selectedId = sessions[0].id;
  const messages = selectedId ? await api.chatscribe.getMessages(selectedId) : [];
  const view = CHATSCRIBE_VIEWS.includes(ui.activeView) ? ui.activeView : 'chat';
  S.chatScribeData = { moduleId: m.id, sessions, selectedId, messages, view };
}

async function setChatScribeView(view) {
  const d = S.chatScribeData;
  d.view = view;
  await api.module.setUi(d.moduleId, 'activeView', view);
  if (S.inspectorData?.moduleId === d.moduleId) S.inspectorData.ui = { ...S.inspectorData.ui, activeView: view };
  renderNexusHome();
}

async function selectChatSession(id) {
  const d = S.chatScribeData;
  d.selectedId = id;
  d.messages = await api.chatscribe.getMessages(id);
  await api.module.setUi(d.moduleId, 'activeSession', String(id));
  renderNexusHome();
}

// SQLite datetime('now') stores UTC — display in local time.
function chsDate(createAt) {
  const dt = new Date(String(createAt).replace(' ', 'T') + 'Z');
  return isNaN(dt) ? null : dt;
}
const chsTime = (createAt) => {
  const dt = chsDate(createAt);
  return dt ? `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}` : '';
};
function chsDayLabel(createAt) {
  const dt = chsDate(createAt);
  if (!dt) return '';
  const now = new Date();
  if (dt.toDateString() === now.toDateString()) return t('chatToday');
  return dt.toLocaleDateString();
}

function buildChatScribeMainHtml(m) {
  const d = (S.chatScribeData && S.chatScribeData.moduleId === m.id) ? S.chatScribeData : null;
  if (!d) return `<div class="empty" style="margin-top:40px"><div class="ei">${moduleIconHtml(m)}</div><h3>${x(m.name)}</h3></div>`;
  const viewBar = `<div class="viewbar">
    ${CHATSCRIBE_VIEWS.map(v => `<span class="vitem${v === d.view ? ' act' : ''}" onclick="setChatScribeView('${v}')" data-no-i18n>${CHATSCRIBE_VIEW_LABEL[v]}</span>`).join('')}
  </div>`;
  const toolbar = `<div class="classifier-toolbar">
    <button class="btn btn-p" onclick="openChatSessionModal(${m.id})">${I.plus} ${t('chatNewSession')}</button>
    ${viewBar}
  </div>`;
  if (!d.sessions.length) {
    return `${toolbar}<div class="empty" style="margin-top:30px"><div class="ei">${moduleIconHtml(m)}</div>
      <h3>${x(m.name)}</h3><p>${t('nestEmpty')}</p></div>`;
  }
  const rows = d.sessions.map(s => `
    <div class="li${s.id === d.selectedId ? ' sel' : ''}" onclick="selectChatSession(${s.id})">
      <span class="name">${x(s.name)}<small class="chs-snippet">${x(String(s.last_message || '').slice(0, 40))}</small></span>
      <span class="cnt" data-no-i18n>${s.message_count}</span>
      <span class="acts">
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openChatSessionModal(${m.id},${s.id})" title="${t('edit')}">${I.edit}</button>
      </span>
    </div>`).join('');
  const column = `<div class="author-chapters">
    <div class="au-col-label" data-no-i18n>SESSIONS · ${x(m.name)}</div>
    ${rows}
    <div class="li au-add" onclick="openChatSessionModal(${m.id})">${I.plus}<span class="name">${t('chatNewSession')}</span></div>
  </div>`;
  const body = d.view === 'transcript' ? buildChatTranscriptHtml(d) : buildChatBubblesHtml(d);
  return `${toolbar}<div class="author-layout">${column}<div class="author-main chs-main">${body}</div></div>`;
}

// ── Chat view: bubble stream + input row ────────────────────────────────
function buildChatBubblesHtml(d) {
  const ses = d.sessions.find(s => s.id === d.selectedId);
  if (!ses) return '';
  const resolve = typeof resolveWikiNameCached === 'function' ? resolveWikiNameCached : null;
  let html = '';
  let lastDay = null;
  for (const g of d.messages) {
    const day = chsDayLabel(g.create_at);
    if (day !== lastDay) {
      lastDay = day;
      html += `<div class="chs-day" data-no-i18n>${x(day)} · session: ${x(ses.name)}</div>`;
    }
    html += `<div class="chs-row">
      <div class="chs-bubble">
        <span class="chs-text">${_mdInline(g.message, resolve)}</span>
        <span class="chs-time" data-no-i18n>${chsTime(g.create_at)}</span>
        <span class="chs-acts">
          <button class="btn btn-g btn-i" onclick="openChatMessageModal(${g.id})" title="${t('edit')}">${I.edit}</button>
          <button class="btn btn-g btn-i" onclick="deleteChatMessageRow(${g.id})" title="${t('delete')}">${I.delete}</button>
        </span>
      </div>
    </div>`;
  }
  if (!d.messages.length) html = `<div class="empty" style="margin-top:30px"><p>${t('nestEmpty')}</p></div>`;
  return `<div id="chs-stream" class="chs-stream">${html}</div>
    <div class="chs-inputrow">
      <input id="chs-input" placeholder="${t('chatTypeNote')}" onkeydown="if(event.key==='Enter')sendChatMessage()">
      <button class="btn btn-p" onclick="sendChatMessage()">${t('chatSend')}</button>
    </div>`;
}

// Post-DOM hook (registered in renderNexusHome): keep the stream pinned to
// the newest bubble and the input ready.
function mountChatScribe() {
  const d = S.chatScribeData;
  if (!d || S.activeModuleNode?.id !== d.moduleId || d.view !== 'chat') return;
  const stream = q('#chs-stream');
  if (stream) stream.scrollTop = stream.scrollHeight;
}

async function sendChatMessage() {
  const d = S.chatScribeData;
  const el = q('#chs-input');
  const text = el?.value.trim();
  if (!text || !d?.selectedId) return;
  await api.chatscribe.createMessage(d.selectedId, text);
  d.messages = await api.chatscribe.getMessages(d.selectedId);
  const ses = d.sessions.find(s => s.id === d.selectedId);
  if (ses) { ses.message_count = d.messages.length; ses.last_message = text; }
  renderNexusHome();
  const input = q('#chs-input');
  if (input) input.focus();
}

// ── Transcript view: plain time-stamped log ─────────────────────────────
function buildChatTranscriptHtml(d) {
  const ses = d.sessions.find(s => s.id === d.selectedId);
  if (!ses) return '';
  const resolve = typeof resolveWikiNameCached === 'function' ? resolveWikiNameCached : null;
  const rows = d.messages.map(g => `
    <div class="chs-tr-row">
      <span class="chs-tr-time" data-no-i18n>${chsDayLabel(g.create_at)} ${chsTime(g.create_at)}</span>
      <span class="chs-tr-text">${_mdInline(g.message, resolve)}</span>
    </div>`).join('');
  return `<div class="chs-transcript">
    <div class="au-col-label" data-no-i18n>TRANSCRIPT · ${x(ses.name)}</div>
    ${rows || `<div class="empty" style="margin-top:30px"><p>${t('nestEmpty')}</p></div>`}
  </div>`;
}

// ── Session + message CRUD ──────────────────────────────────────────────
function openChatSessionModal(moduleId, id = null) {
  const ses = id ? S.chatScribeData?.sessions.find(s => s.id === id) : null;
  openModal(ses ? t('moduleEdit') : t('chatNewSession'), `
    <div class="fg"><label>${t('name')} *</label><input id="cs-name" value="${x(ses?.name || '')}"></div>
    <div class="mfoot">
      ${ses ? `<button class="btn btn-d" onclick="deleteChatSessionRow(${ses.id})">${t('delete')}</button>` : ''}
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="submitChatSession(${moduleId},${ses ? ses.id : 'null'})">${ses ? t('save') : t('create')}</button>
    </div>`);
  setTimeout(() => q('#cs-name').focus(), 60);
}

async function submitChatSession(moduleId, id) {
  const name = q('#cs-name').value.trim();
  if (!name) return;
  if (id) await api.chatscribe.renameSession(id, name);
  else {
    const newId = await api.chatscribe.createSession(moduleId, name);
    S.chatScribeData.selectedId = newId;
  }
  closeModal();
  await openModuleNode(moduleId);
  toast(id ? t('saved') : t('created'), 'ok');
}

async function deleteChatSessionRow(id) {
  if (!await uiConfirm(t('moduleDeleteConfirm'))) return;
  await api.chatscribe.deleteSession(id);
  closeModal();
  const d = S.chatScribeData;
  if (d.selectedId === id) d.selectedId = null;
  await openModuleNode(d.moduleId);
  toast(t('deleted'), 'ok');
}

function openChatMessageModal(id) {
  const g = S.chatScribeData?.messages.find(v => v.id === id);
  if (!g) return;
  openModal(t('moduleEdit'), `
    <div class="fg"><label>${t('content')}</label><textarea id="cm-text" rows="3">${x(g.message)}</textarea></div>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="submitChatMessage(${id})">${t('save')}</button>
    </div>`);
  setTimeout(() => q('#cm-text').focus(), 60);
}

async function submitChatMessage(id) {
  const text = q('#cm-text').value.trim();
  if (!text) return;
  await api.chatscribe.updateMessage(id, text);
  closeModal();
  const d = S.chatScribeData;
  d.messages = await api.chatscribe.getMessages(d.selectedId);
  renderNexusHome();
  toast(t('saved'), 'ok');
}

async function deleteChatMessageRow(id) {
  if (!await uiConfirm(t('moduleDeleteConfirm'))) return;
  await api.chatscribe.deleteMessage(id);
  const d = S.chatScribeData;
  d.messages = await api.chatscribe.getMessages(d.selectedId);
  const ses = d.sessions.find(s => s.id === d.selectedId);
  if (ses) ses.message_count = d.messages.length;
  renderNexusHome();
  toast(t('deleted'), 'ok');
}
