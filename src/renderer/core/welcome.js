// The Welcome screen (v4.6.0) — its own Electron window, not an overlay.
//
// Before, this was a 480px modal shown on top of the vault picker, and only
// when the database held zero vaults. Now main.js opens a dedicated window
// (index.html?welcome=1, createWelcomeWindow) on every launch, boot.js no
// longer restores the last vault, and this screen is the only way into one.
// It reuses the app's own shell — left panel + main area, chrome hidden by
// body.welcome-mode (css/welcome.css) — so modals, the color picker, toasts,
// i18n and theming all come for free.
//
// Picking a vault hands off to a real app window and closes this one
// (window:openNexusReplace), so nothing here ever renders the hub.

function renderWelcomeWindow() {
  const recent = recentNexuses(3, null);
  const hasVaults = S.nexuses.length > 0;
  // Left panel: every vault, most-recently-opened first so the list matches
  // the order of the cards on the right, then the rest in the alphabetical
  // order getNexuses() returns.
  const ordered = [...recentNexuses(S.nexuses.length, null)];
  q('#left-panel-inner').innerHTML = `
    <div class="ph"><h4>${t('nexus')}</h4>
      <button class="btn btn-p btn-sm" onclick="welcomeCreateNexus()">+ ${t('nexusNew')}</button>
    </div>
    ${ordered.map(n => `
      <div class="module-item nexus-item" onclick="welcomeOpenNexus(${n.id})" title="${t('wmOpenNexus')}">
        <span class="nexus-vault-dot" style="${n.color_code ? `background:${x(n.color_code)}` : ''}"></span>
        <span class="module-name">${x(n.name)}</span>
        <span class="nexus-count">${n.project_count}</span>
        <button class="btn-icon" onclick="event.stopPropagation();openNexusModal(${n.id})" title="${t('edit')}">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
        </button>
      </div>`).join('')}
    ${hasVaults ? '' : `<div class="welcome-side-empty">${t('nexusEmpty')}</div>`}`;
  q('#left-panel-foot').innerHTML = '';
  q('#main-inner').innerHTML = `
    <div class="welcome-hero">
      <div class="ei"><img src="Image/DraconDex_WhiteOut.png" class="brand-img" alt="DraconDex" style="height:72px;width:72px;opacity:.4"></div>
      <h2 class="welcome-title">${t('wmTitle')}</h2>
      <p class="welcome-text">${hasVaults ? t('nexusSelect') : t('wmText')}</p>
      ${recent.length ? `
        <div class="welcome-recent">
          <div class="welcome-recent-label">${t('wmRecent')}</div>
          <div class="welcome-recent-row">
            ${recent.map(n => `
              <div class="welcome-recent-card" onclick="welcomeOpenNexus(${n.id})" title="${t('wmOpenNexus')}">
                <span class="nexus-vault-dot" style="${n.color_code ? `background:${x(n.color_code)}` : ''}"></span>
                <span class="welcome-recent-name">${x(n.name)}</span>
                <span class="nexus-count">${n.project_count}</span>
              </div>`).join('')}
          </div>
        </div>` : ''}
      <div class="welcome-actions">
        <button class="btn btn-p" onclick="welcomeCreateNexus()">${t('wmCreateNew')}</button>
        <button class="btn btn-s" onclick="importDatabaseFile()">${t('wmImport')}</button>
      </div>
    </div>`;
}

// Hand the chosen vault to a real app window; main.js closes this one once
// that window exists. The MRU is written first — this renderer is about to go
// away, and the new window reads the list at boot.
async function welcomeOpenNexus(id) {
  pushRecentNexus(id);
  await api.window.openNexusReplace(id);
}

// "Create new Nexus" opens the standard vault form with the optional tour
// checkbox. createNexusSubmit (nexus.js) reads it after the vault is created
// and, in this window, defers the tour to the app window it opens.
async function welcomeCreateNexus() {
  openNexusModal(null, { showGuideChoice: true });
}
