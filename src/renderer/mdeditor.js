// Shared markdown editor component (Scribe notes, Director object notes, …).
// Same construction as the Writer chapter editor: a <textarea> over a
// scroll-synced highlight backdrop, 800 ms debounce autosave, plus an
// edit ↔ rendered-preview toggle (Ctrl+E or the head button).
//
//   createMarkdownEditor(container, {
//     title,            // head label
//     content,          // initial markdown text
//     srcKey,           // entity key ('note_3', 'obj_12') — used by wiki indexing
//     save(content),    // async persist callback
//     resolveLink(name),// optional [[name]] -> entity key (Phase 3)
//     mode,             // 'edit' | 'preview' (default 'edit')
//   })

let _mdActive = null; // the most recently created editor (Ctrl+E target)

function createMarkdownEditor(container, opts) {
  const st = {
    content: opts.content ?? '',
    mode: opts.mode === 'preview' ? 'preview' : 'edit',
    srcKey: opts.srcKey || '',
    saveTimer: null,
  };

  container.innerHTML = `
    <div class="mded-head">
      <span class="mded-title">${x(opts.title || '')}</span>
      <span class="mded-save-state"></span>
      <button class="btn btn-s btn-sm mded-toggle" title="Ctrl+E"></button>
    </div>
    <div class="mded-body"></div>`;
  const body = container.querySelector('.mded-body');
  const saveState = container.querySelector('.mded-save-state');
  const toggleBtn = container.querySelector('.mded-toggle');

  const doSave = async () => {
    if (!opts.save) return;
    await opts.save(st.content);
    if (saveState) saveState.textContent = t('saved');
  };

  const scheduleSave = () => {
    saveState.textContent = '…';
    clearTimeout(st.saveTimer);
    st.saveTimer = setTimeout(doSave, 800);
  };

  // Tint [[wikilinks]] while typing (backdrop mirror, like wlink-mark).
  const paintBackdrop = (bd, text) => {
    let html = '';
    let pos = 0;
    for (const l of mdExtractWikilinks(text)) {
      html += x(text.slice(pos, l.start));
      html += `<mark class="mded-wikimark">${x(text.slice(l.start, l.end))}</mark>`;
      pos = l.end;
    }
    bd.innerHTML = html + x(text.slice(pos)) + '<br>';
  };

  const renderMode = () => {
    toggleBtn.textContent = st.mode === 'edit' ? t('preview') : t('editMode');
    if (st.mode === 'edit') {
      body.innerHTML = `
        <div class="mded-wrap">
          <div class="mded-backdrop" aria-hidden="true"></div>
          <textarea class="mded-text" spellcheck="false"></textarea>
        </div>`;
      const ta = body.querySelector('.mded-text');
      const bd = body.querySelector('.mded-backdrop');
      ta.value = st.content;
      paintBackdrop(bd, st.content);
      ta.addEventListener('input', () => {
        st.content = ta.value;
        paintBackdrop(bd, st.content);
        scheduleSave();
      });
      ta.addEventListener('scroll', () => { bd.scrollTop = ta.scrollTop; bd.scrollLeft = ta.scrollLeft; });
      ta.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') { // keep Tab inside the editor (indent)
          e.preventDefault();
          const s = ta.selectionStart, epos = ta.selectionEnd;
          ta.value = ta.value.slice(0, s) + '  ' + ta.value.slice(epos);
          ta.selectionStart = ta.selectionEnd = s + 2;
          ta.dispatchEvent(new Event('input'));
        }
      });
      ta.focus();
    } else {
      // tabindex so the preview holds focus and Ctrl+E can toggle back
      body.innerHTML = `<div class="md-preview" tabindex="0"></div>`;
      const pv = body.querySelector('.md-preview');
      pv.innerHTML = mdRender(st.content, { resolveLink: opts.resolveLink || null });
      pv.focus();
    }
  };

  const setMode = (m) => {
    if (st.mode === m) return;
    st.mode = m;
    // entering preview flushes a pending save immediately
    if (m === 'preview' && st.saveTimer) { clearTimeout(st.saveTimer); doSave(); }
    renderMode();
  };

  toggleBtn.addEventListener('click', () => setMode(st.mode === 'edit' ? 'preview' : 'edit'));
  container.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      setMode(st.mode === 'edit' ? 'preview' : 'edit');
    }
  });

  renderMode();

  const editor = {
    srcKey: st.srcKey,
    getContent: () => st.content,
    getMode: () => st.mode,
    toggleMode: () => setMode(st.mode === 'edit' ? 'preview' : 'edit'),
    flush: doSave,
  };
  _mdActive = editor;
  return editor;
}
