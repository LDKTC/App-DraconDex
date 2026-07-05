// Quick switcher (Ctrl+P) — Obsidian-style fuzzy jump to any entity in the
// active vault. Data comes from wiki:quickIndex; Enter opens the selection
// through openEntityByKey. Overlay/keyboard handling mirrors uiConfirm
// (capture-phase keydown so app shortcuts don't fire underneath).

let _qsItems = [];    // full quickIndex of the vault
let _qsShown = [];    // currently listed rows
let _qsIdx = 0;

// Subsequence fuzzy score: higher is better, -1 = no match.
// Bonuses for start-of-word hits and consecutive runs; light length penalty.
function fuzzyScore(query, name) {
  const nq = query.toLowerCase(), nn = name.toLowerCase();
  if (!nq) return 0;
  let qi = 0, score = 0, run = 0;
  for (let i = 0; i < nn.length && qi < nq.length; i++) {
    if (nn[i] === nq[qi]) {
      run++;
      score += 2 + run; // consecutive matches compound
      if (i === 0 || nn[i - 1] === ' ' || nn[i - 1] === '-' || nn[i - 1] === '_') score += 8;
      qi++;
    } else {
      run = 0;
    }
  }
  if (qi < nq.length) return -1;
  return score - Math.floor(nn.length / 4);
}

async function openQuickSwitcher() {
  if (!S.nexus) { toast(t('nexusSelectFirst'), 'error'); return; }
  document.getElementById('qs-overlay')?.remove();

  _qsItems = await api.wiki.quickIndex(S.nexus.id);
  const byKey = new Map(_qsItems.map(e => [e.key, e]));

  const ov = document.createElement('div');
  ov.id = 'qs-overlay';
  ov.innerHTML = `
    <div id="qs-box">
      <input id="qs-input" placeholder="${t('qsPlaceholder')}" autocomplete="off" spellcheck="false">
      <div id="qs-list"></div>
    </div>`;
  document.body.appendChild(ov);
  const input = ov.querySelector('#qs-input');
  const list = ov.querySelector('#qs-list');

  const close = () => {
    document.removeEventListener('keydown', onKey, true);
    ov.remove();
  };

  const paint = () => {
    if (!_qsShown.length) {
      list.innerHTML = `<div class="qs-empty">${t('qsNoResults')}</div>`;
      return;
    }
    list.innerHTML = _qsShown.map((e, i) => `
      <div class="qs-item ${i === _qsIdx ? 'active' : ''}" data-i="${i}">
        <span class="qs-icon">${I[e.module] || ''}</span>
        <span class="dot" style="background:${e.color || 'var(--accent)'}"></span>
        <span class="name">${x(e.name)}</span>
        <span class="qs-type">${x(t(e.module) || e.module)} · ${x(e.type)}</span>
      </div>`).join('');
    list.querySelector('.qs-item.active')?.scrollIntoView({ block: 'nearest' });
  };

  const update = () => {
    const qv = input.value.trim();
    if (!qv) {
      // empty query → recently opened entities
      _qsShown = (S.recentEntities || []).map(k => byKey.get(k)).filter(Boolean).slice(0, 20);
      if (!_qsShown.length) _qsShown = _qsItems.slice(0, 20);
    } else {
      _qsShown = _qsItems
        .map(e => ({ e, s: fuzzyScore(qv, e.name) }))
        .filter(r => r.s >= 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 50)
        .map(r => r.e);
    }
    _qsIdx = 0;
    paint();
  };

  const accept = async () => {
    const e = _qsShown[_qsIdx];
    if (!e) return;
    close();
    await openEntityByKey(e.key);
  };

  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); _qsIdx = Math.min(_qsIdx + 1, _qsShown.length - 1); paint(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); _qsIdx = Math.max(_qsIdx - 1, 0); paint(); }
    else if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); accept(); }
  };

  document.addEventListener('keydown', onKey, true);
  input.addEventListener('input', update);
  list.addEventListener('click', (e) => {
    const row = e.target.closest('.qs-item');
    if (row) { _qsIdx = Number(row.dataset.i); accept(); }
  });
  ov.addEventListener('mousedown', (e) => { if (e.target === ov) close(); });

  update();
  input.focus();
}
