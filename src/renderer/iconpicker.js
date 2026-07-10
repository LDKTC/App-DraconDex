'use strict';
// ═══ Icon Collection picker (progress.md Phase 5) ═════════════════════
// Modal used by every module create/edit flow (hub.js's moduleFormModal)
// to pick a module's icon + color, with a live nest-row preview. Two
// working tabs — Icons (this app's `I.*` SVG dict) and Symbols (the
// existing `symbol_collection`, already user-extendable via Navigator) —
// plus a disabled "Uploaded" placeholder feeding off Import Dock (Phase 18).
//
// Selection is stored as `svg:<I-key>` or `sym:<glyph>` in `module.icon`;
// see moduleIconHtml() in hub.js for how it's rendered back out.

const ICON_PICKER_KEYS = [
  'globe','sword','book','scribe','sage','artisan','projects','timeline','relation','map',
  'hashtag','folder','star','pin','fields','list','table','person','layer','item','story',
  'func','series','document','chart','manager','narrator','sketcher','wanderer','director','navigator',
];

async function iconPicker(selIcon, selColorId, previewName, previewKind) {
  const symbols = await api.world.getSymbolCollection();
  const selKey = selIcon && selIcon.startsWith('svg:') ? selIcon.slice(4) : (selIcon && !selIcon.startsWith('sym:') ? selIcon : null);
  const selSym = selIcon && selIcon.startsWith('sym:') ? selIcon.slice(4) : null;
  return `<div class="ipk-wrap">
    <div class="fg"><input id="ipk-search" placeholder="${t('search')}" oninput="filterIconPicker()"></div>
    <div class="ipk-tabs">
      <div class="ipk-tab active" data-ipktab="icons" onclick="switchIconPickerTab('icons')">${t('iconTabIcons')}</div>
      <div class="ipk-tab" data-ipktab="symbols" onclick="switchIconPickerTab('symbols')">${t('iconTabSymbols')}</div>
      <div class="ipk-tab ipk-tab-disabled" title="${t('importDockComingSoon')}">${t('iconTabUploaded')}</div>
    </div>
    <div class="ipk-grid" id="ipk-icon-grid">
      ${ICON_PICKER_KEYS.map(k => `<div class="ipk-cell${selKey===k?' sel':''}" data-name="${k}" onclick="pickIconPickerIcon(this,'${k}')" title="${k}">${I[k]}</div>`).join('')}
    </div>
    <div class="ipk-grid" id="ipk-symbol-grid" style="display:none">
      ${symbols.map(s => `<div class="ipk-cell ipk-symbol${selSym===s.glyph?' sel':''}" data-name="${x((s.label||'').toLowerCase())}" onclick="pickIconPickerSymbol(this,'${x(s.glyph).replace(/'/g,"\\'")}')" title="${x(s.label||'')}">${x(s.glyph)}</div>`).join('')}
    </div>
    <div class="ipk-color-row">
      <span class="pk">${t('color')}</span>
      <div class="ipk-colors" id="ipk-colors">${sortColorsByHex(S.colors).map(c =>
        `<div class="cswatch${selColorId===c.id?' sel':''}" style="background:${c.color_code}" data-cid="${c.id}" onclick="pickIconPickerColor(this,${c.id})"></div>`
      ).join('')}</div>
    </div>
    <div class="ipk-preview-row">
      <span class="pk">${t('preview')}</span>
      <div class="li" id="ipk-preview" style="pointer-events:none;display:inline-flex;width:auto">
        <span class="kicon" id="ipk-preview-icon" style="color:${x((S.colors.find(c=>c.id===selColorId)||{}).color_code || 'var(--accent)')}">${selSym ? `<span class="kicon-glyph">${x(selSym)}</span>` : (I[selKey] || I.layer)}</span>
        <span class="name">${x(previewName||'')}</span>
        ${previewKind ? `<span class="kind">${x(previewKind)}</span>` : ''}
      </div>
    </div>
    <input type="hidden" id="ipk-icon-value" value="${x(selIcon||'')}">
    <input type="hidden" id="sel-color" value="${selColorId||''}">
  </div>`;
}

function switchIconPickerTab(tabName) {
  document.querySelectorAll('.ipk-tab[data-ipktab]').forEach(b => b.classList.toggle('active', b.dataset.ipktab === tabName));
  const q1 = q('#ipk-icon-grid'), q2 = q('#ipk-symbol-grid');
  if (q1) q1.style.display = tabName === 'icons' ? '' : 'none';
  if (q2) q2.style.display = tabName === 'symbols' ? '' : 'none';
}

function filterIconPicker() {
  const term = (q('#ipk-search')?.value || '').trim().toLowerCase();
  document.querySelectorAll('.ipk-cell').forEach(el => {
    el.style.display = !term || (el.dataset.name || '').includes(term) ? '' : 'none';
  });
}

function updateIconPickerPreviewName(name, kind) {
  const nameEl = q('#ipk-preview .name');
  if (nameEl) nameEl.textContent = name || '';
  const kindEl = q('#ipk-preview .kind');
  if (kindEl) kindEl.textContent = kind || '';
}

function pickIconPickerIcon(el, key) {
  document.querySelectorAll('#ipk-icon-grid .ipk-cell, #ipk-symbol-grid .ipk-cell').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  q('#ipk-icon-value').value = `svg:${key}`;
  const prevIcon = q('#ipk-preview-icon');
  if (prevIcon) prevIcon.innerHTML = I[key] || I.layer;
}

function pickIconPickerSymbol(el, glyph) {
  document.querySelectorAll('#ipk-icon-grid .ipk-cell, #ipk-symbol-grid .ipk-cell').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  q('#ipk-icon-value').value = `sym:${glyph}`;
  const prevIcon = q('#ipk-preview-icon');
  if (prevIcon) prevIcon.innerHTML = `<span class="kicon-glyph">${x(glyph)}</span>`;
}

async function pickIconPickerColor(el, id) {
  q('#ipk-colors')?.querySelectorAll('.cswatch').forEach(s => s.classList.remove('sel'));
  el.classList.add('sel');
  q('#sel-color').value = id;
  const code = (S.colors || []).find(c => c.id === id)?.color_code;
  const prevIcon = q('#ipk-preview-icon');
  if (prevIcon && code) prevIcon.style.color = code;
  await api.color.markUsed(id);
}

const getIconPickerValue = () => q('#ipk-icon-value')?.value || '';
