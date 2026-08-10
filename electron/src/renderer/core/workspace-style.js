'use strict';
// Workspace → Workspace Style page (Plan.md part2 #New Workspace's "setting
// page add workspace") — the picker that makes Drake/Wyvern/Dragon actually
// selectable; before this only the `?workspace=` query param existed. Same
// one-page-per-file convention as tool-toggle.js/account.js even though it
// shares the pre-existing `workspace` Setting group (theme/text&size/tool
// toggle already live there — this is one more thing that's a "workspace"
// concern).

const WORKSPACE_STYLE_DESC_KEY = {
  drake: 'workspaceStyleDrakeDesc',
  wyvern: 'workspaceStyleWyvernDesc',
  dragon: 'workspaceStyleDragonDesc',
};

// CSS-drawn wireframe mockup per style (css/workspace.css's .wsp-* rules) —
// no image asset, same "draw it with CSS" idiom as the Theme page's mini
// preview above it in this same Setting window.
function workspaceStylePreviewHtml(style) {
  if (style === 'wyvern') return `<div class="wsp-cell-preview">
    <i class="wsp-blk" style="width:10px;background:var(--surface)"></i>
    <i class="wsp-blk" style="flex:1;background:var(--raised);opacity:.5"></i>
  </div>`;
  if (style === 'dragon') return `<div class="wsp-cell-preview">
    <i class="wsp-blk" style="width:8px;background:var(--surface)"></i>
    <div class="wsp-board-mini">
      <i class="wsp-dot" style="left:8px;top:6px"></i>
      <i class="wsp-dot" style="left:30px;top:22px"></i>
      <i class="wsp-dot" style="left:16px;top:36px"></i>
    </div>
  </div>`;
  return `<div class="wsp-cell-preview">
    <i class="wsp-blk" style="width:8px;background:var(--surface)"></i>
    <i class="wsp-blk" style="width:26px;background:var(--raised)"></i>
    <i class="wsp-blk" style="flex:1;background:var(--raised);opacity:.5"></i>
  </div>`;
}
function workspaceStyleCellHtml(style) {
  const pending = S.settingPendingWorkspace || S.settings.workspaceStyle;
  const active = pending === style;
  const label = style.charAt(0).toUpperCase() + style.slice(1);
  return `<div class="prefs-theme-cell${active ? ' active' : ''}" onclick="selectPendingWorkspaceStyle('${style}')">
    ${workspaceStylePreviewHtml(style)}
    <div class="prefs-theme-name" data-no-i18n>${label}</div>
    <div class="settings-hint">${t(WORKSPACE_STYLE_DESC_KEY[style])}</div>
    ${active ? '<span class="prefs-theme-check">✓</span>' : ''}
  </div>`;
}
function settingWorkspaceStylePageHtml() {
  const pending = S.settingPendingWorkspace || S.settings.workspaceStyle;
  const dirty = pending !== S.settings.workspaceStyle;
  const cells = WORKSPACE_STYLE_OPTIONS.map(workspaceStyleCellHtml).join('');
  return `<div class="settings-label">${t('settingPageWorkspaceStyle')}</div>
    <div class="prefs-theme-grid">${cells}</div>
    ${dirty ? `<button class="btn btn-p" style="margin-top:14px" onclick="applyWorkspaceStyleChoice()">${t('settingWorkspaceApply')}</button>` : ''}`;
}
function selectPendingWorkspaceStyle(style) {
  if (!WORKSPACE_STYLE_OPTIONS.includes(style)) return;
  S.settingPendingWorkspace = style;
  renderSettingWindow();
}
// Chrome swap needs a fresh boot (same reasoning as applyWorkspaceStyle()
// in core/boot.js), so this is a deliberate two-step commit rather than
// live-applying like setUiSetting() does for theme/language — confirm via
// uiConfirm(), same guard settingProfileRestore() already uses before its
// own location.reload() (core/account.js).
async function applyWorkspaceStyleChoice() {
  const pending = S.settingPendingWorkspace;
  if (!pending || pending === S.settings.workspaceStyle) return;
  if (!(await uiConfirm(t('settingWorkspaceApplyConfirm')))) return;
  S.settings.workspaceStyle = pending;
  saveUiSettings();
  location.reload();
}
registerSettingPage('workspace', 'style', settingWorkspaceStylePageHtml);
