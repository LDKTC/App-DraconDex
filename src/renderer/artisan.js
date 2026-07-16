'use strict';
// Artisan module (v3) — create-from-template studio. Pick a target module
// in the sidebar, then step through the create wizard (startArtisanWizard):
// a Manager step followed by one step per Minor (artisanV3Spec), each
// committing its own module row (plus classifier templates / author
// chapters / drafter content) before moving to the next.
// Reached from the nexus tile and from the rail shortcut shown inside each
// project module (openArtisanFromModule in core.js).

const ARTISAN_TARGETS = [
  { id: 'director',  icon: 'director',  labelKey: 'director' },
  { id: 'navigator', icon: 'navigator', labelKey: 'navigator' },
  { id: 'hero',      icon: 'hero',      labelKey: 'hero' },
  { id: 'writer',    icon: 'writer',    labelKey: 'writer' },
];

// ═══ v3 STRUCTURE TEMPLATES (Phase 23) ═════════════════════════════════
// The four legacy fixed modules as built-in Nexus-nest templates: each
// describes a Manager Major + pre-filled Minors, walked step-by-step by
// the create wizard below (startArtisanWizard). Names run through t() at
// call time — the rows become user data in the current language.
function artisanV3Spec(target, name, colorId) {
  const f = (key, type, levelable) => ({ name: t(key), type: type || 'text', levelable: !!levelable });
  const stat = (nm) => ({ name: nm, type: 'number', levelable: true });
  const minors = [];
  if (target === 'director') {
    minors.push(
      { kind: 'classifier', catType: 'character', name: t('worldChars'),
        templates: [f('artFldRole'), f('artFldAge'), f('artFldPersonality', 'textarea'), f('artFldGoal')] },
      { kind: 'classifier', name: t('artLocations'), templates: [f('artFldDescription', 'textarea'), f('artFldHistory', 'textarea')] },
      { kind: 'classifier', name: t('gameItems'), templates: [f('artFldDescription', 'textarea'), f('artFldOwner')] },
      { kind: 'chronicler', name: t('artMainTimeline') },
      { kind: 'drafter', name: t('artFldPremise') },
    );
  } else if (target === 'navigator') {
    minors.push(
      { kind: 'classifier', catType: 'character', name: t('worldChars'),
        templates: [f('artFldRole'), f('artFldAge'), f('artFldPersonality', 'textarea'), f('artFldGoal')] },
      { kind: 'classifier', name: t('artLocations'), templates: [f('artFldDescription', 'textarea'), f('artFldHistory', 'textarea')] },
      { kind: 'classifier', name: t('artFactions'), templates: [f('artFldDescription', 'textarea'), f('artFldGoal')] },
      { kind: 'locator', name: t('kcMap') },
      { kind: 'chronicler', name: t('kcTimeline') },
      { kind: 'drafter', name: t('worldOverview') },
    );
  } else if (target === 'hero') {
    minors.push(
      { kind: 'classifier', catType: 'character', name: t('gameChars'),
        templates: [stat('HP'), stat('MP'), stat('ATK'), stat('DEF'), f('artFldRole'), f('artFldBackstory', 'textarea')] },
      { kind: 'classifier', name: t('gameItems'), templates: [f('artFldDescription', 'textarea'), f('artFldEffect')] },
      { kind: 'narrator', name: t('artMainStory') },
    );
  } else if (target === 'writer') {
    minors.push(
      { kind: 'author', name: t('artBook'), chapters: [1, 2, 3].map(n => `${t('artChapter')} ${n}`) },
      { kind: 'drafter', name: t('artIdeas') },
    );
  }
  return { name, colorId: colorId || null, minors };
}

// ═══ CREATE WIZARD ════════════════════════════════════
// Manager step, then one step per Minor (artisanV3Spec) — each step commits
// its own module row immediately via api.module.create so the user can
// name/re-icon every piece before it's created, instead of the old one-shot
// name+color modal that built the whole tree in a single call.
function startArtisanWizard(target) {
  const spec = artisanV3Spec(target, '');
  S.artisanWizard = { target, spec, idx: -1, managerId: null };
  renderArtisanWizardStep();
}

async function renderArtisanWizardStep() {
  const w = S.artisanWizard;
  if (!w) return;
  const tg = ARTISAN_TARGETS.find(a => a.id === w.target);
  if (w.idx === -1) {
    openModal(`${t(tg.labelKey)} — ${t('artV3Card')} · 1 / ${w.spec.minors.length + 1}`, `
      <div class="fg"><label>${t('name')} *</label><input id="art-wiz-name"></div>
      <div class="fg"><label>${t('iconCollection')}</label>${await iconPicker(null, null, '', kindLabel('manager'))}</div>
      <div class="mfoot">
        <button class="btn btn-s" onclick="closeArtisanWizard()">${t('cancel')}</button>
        <button class="btn btn-p" onclick="submitArtisanWizardStep()">${t('guideNext')}</button>
      </div>`);
  } else {
    const i = w.idx;
    const mn = w.spec.minors[i];
    openModal(`${i + 2} / ${w.spec.minors.length + 1} — ${x(mn.name)}`, `
      <div class="fg"><label>${t('name')} *</label><input id="art-wiz-name" value="${x(mn.name || '')}"></div>
      <div class="fg"><label>${t('iconCollection')}</label>${await iconPicker(null, null, mn.name || '', kindLabel(mn.kind))}</div>
      <div class="mfoot">
        <button class="btn btn-s" onclick="closeArtisanWizard()">${t('cancel')}</button>
        <button class="btn btn-p" onclick="submitArtisanWizardStep()">${i === w.spec.minors.length - 1 ? t('guideDone') : t('guideNext')}</button>
      </div>`);
  }
  setTimeout(() => q('#art-wiz-name').focus(), 60);
}

async function submitArtisanWizardStep() {
  const w = S.artisanWizard;
  if (!w) return;
  if (!S.nexus) { toast(t('nexusSelectFirst'), 'error'); return; }
  const name = q('#art-wiz-name').value.trim();
  if (!name) return;
  const icon = getIconPickerValue() || null;
  const color = q('#sel-color')?.value || null;
  if (w.idx === -1) {
    w.managerId = await api.module.create({ nexus_ref: S.nexus.id, parent_id: null, name, kind: 'manager', color, icon_color: color, icon });
    if (!w.spec.minors.length) { await finishArtisanWizard(); return; }
    w.idx = 0;
    await renderArtisanWizardStep();
  } else {
    const i = w.idx;
    const mn = w.spec.minors[i];
    const minorId = await api.module.create({
      nexus_ref: S.nexus.id, parent_id: w.managerId, name, kind: mn.kind,
      color, icon_color: color, icon,
      cat_type: mn.kind === 'classifier' ? (mn.catType || 'object') : null,
    });
    if (mn.kind === 'classifier') {
      for (const tf of (mn.templates || [])) {
        await api.classifier.createTemplate(minorId, tf.name, tf.type || 'text', !!tf.levelable, false, null);
      }
    }
    if (mn.kind === 'author') {
      for (const ch of (mn.chapters || [])) await api.author.createChapter(minorId, ch);
    }
    if (mn.kind === 'drafter' && mn.content) await api.module.updateDescription(minorId, mn.content);
    if (i === w.spec.minors.length - 1) {
      await finishArtisanWizard();
    } else {
      w.idx = i + 1;
      await renderArtisanWizardStep();
    }
  }
}

function closeArtisanWizard() {
  S.artisanWizard = null;
  closeModal();
}

async function finishArtisanWizard() {
  const managerId = S.artisanWizard.managerId;
  S.artisanWizard = null;
  closeModal();
  toast(t('artisanCreated'), 'ok');
  await returnToNexus();
  await reloadModuleTree();
  await openModuleNode(managerId);
}

// ═══ ENTRY / ROUTING ══════════════════════════════════
function renderArtisanView() {
  S.view = 'artisan';
  S.activeModule = 'artisan';
  let h = `<div class="ph"><h4>${t('artisan')}</h4></div>`;
  for (const tg of ARTISAN_TARGETS) {
    h += `<div class="li ${S.artisanTarget === tg.id ? 'active' : ''}" onclick="selectArtisanTarget('${tg.id}')" style="display:flex;align-items:center;gap:8px">
      <span style="display:flex;align-items:center">${I[tg.icon]}</span>
      <span class="name" style="flex:1">${t(tg.labelKey)}</span>
    </div>`;
  }
  // The legacy fixed modules moved off the hub into here (Phase 23) —
  // still reachable until their data is migrated (Phase 24).
  h += `<div class="ph" style="margin-top:14px"><h4>${t('artLegacySection')}</h4></div>`;
  for (const tg of ARTISAN_TARGETS) {
    h += `<div class="li" onclick="selectModule('${tg.id}')" style="display:flex;align-items:center;gap:8px">
      <span style="display:flex;align-items:center">${I[tg.icon]}</span>
      <span class="name" style="flex:1">${t(tg.labelKey)}</span>
    </div>`;
  }
  q('#left-panel-inner').innerHTML = h;
  renderArtisanMain();
  updateTopNavButton();
}

function selectArtisanTarget(target) {
  S.artisanTarget = target;
  renderArtisanView();
}

function renderArtisanMain() {
  if (!S.artisanTarget) {
    q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
      <div class="ei">${I.artisan}</div><h3>${t('artisan')}</h3><p>${t('artisanWelcomeText')}</p></div>`;
    return;
  }
  const tg = ARTISAN_TARGETS.find(a => a.id === S.artisanTarget);
  let h = `<div class="detail-head" style="border-left:4px solid var(--accent);padding-left:12px">
    <h2 style="margin:0;font-size:1.1em">${t(tg.labelKey)} <span style="color:var(--t3);font-weight:400;font-size:.8em">· ${t('artisanPickTemplate')}</span></h2>
  </div>
  <div class="artisan-grid">`;
  // Built-in v3 structure card first (Phase 23) — creates a Nexus-nest
  // Major/Minor set instead of a legacy project.
  const v3Spec = artisanV3Spec(S.artisanTarget, '·');
  h += `<div class="artisan-card artisan-v3" onclick="startArtisanWizard('${S.artisanTarget}')">
    <div class="artisan-card-head">
      <span class="artisan-card-icon">${I[tg.icon]}</span>
      <h4>${t('artV3Card')} <span class="kind-chip" data-no-i18n>v3</span></h4>
    </div>
    <p>${t('artV3CardD')}</p>
    <div class="artisan-inc">${t('artisanIncludes')}</div>
    <div class="artisan-inc-list">${v3Spec.minors.map(mn => `<span class="artisan-chip">${x(mn.name)} <small data-no-i18n>${x(kindLabel(mn.kind))}</small></span>`).join('')}</div>
    <button class="btn btn-p" style="margin-top:10px;width:100%" onclick="event.stopPropagation();startArtisanWizard('${S.artisanTarget}')">${I.plus} ${t('artisanCreate')}</button>
  </div>`;
  h += `</div>
  <div class="detail-head" style="border-left:4px solid var(--border);padding-left:12px;margin-top:22px">
    <h2 style="margin:0;font-size:1.05em">${t('artMigrateSection')}</h2>
  </div>
  <div id="art-migrate-list" class="hlist" style="max-width:560px"><div class="empty" style="padding:14px"><p>…</p></div></div>`;
  q('#main-inner').innerHTML = h;
  fillArtisanMigrateList(S.artisanTarget);
}

// Legacy projects of this target, each importable as a v3 structure
// (Phase 24 — lazy, non-destructive; original rows stay).
async function fillArtisanMigrateList(target) {
  const el = q('#art-migrate-list');
  if (!el) return;
  const rows = await api.migrate.list(target);
  if (S.artisanTarget !== target || !q('#art-migrate-list')) return;
  el.innerHTML = rows.length ? rows.map(r => `
    <div class="li">
      <span class="name">${x(r.name)}</span>
      <button class="btn btn-s btn-sm" onclick="runArtisanMigration('${target}',${r.id},this)">${t('artMigrateBtn')}</button>
    </div>`).join('') : `<div class="empty" style="padding:14px"><p>${t('artMigrateEmpty')}</p></div>`;
}

async function runArtisanMigration(target, legacyId, btn) {
  if (!S.nexus) { toast(t('nexusSelectFirst'), 'error'); return; }
  if (btn) btn.disabled = true;
  try {
    const res = await api.migrate.run(S.nexus.id, target, legacyId);
    const c = res.counts || {};
    toast(`${t('artMigrateDone')} — ${c.modules} modules · ${c.objects} objects · ${c.events} events · ${c.chapters} chapters · ${c.dialogues} dialogues`, 'ok');
    await returnToNexus();
    await reloadModuleTree();
    if (res.id) await openModuleNode(res.id);
  } catch (e) {
    toast(t('vRestoreFailed'), 'error');
    if (btn) btn.disabled = false;
  }
}

