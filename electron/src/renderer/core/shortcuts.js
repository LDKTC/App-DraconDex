// Global keyboard shortcuts (Ctrl+P quick switch, tab cycling, …) and
// returnToNexus().
// ═══ GLOBAL SHORTCUTS ═════════════════════════════════════
function bindGlobalShortcuts() {
  document.addEventListener('keydown', async (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const key = e.key.toLowerCase();
    const modalOpen = !q('#modal-overlay')?.classList.contains('hidden') || q('#confirm-overlay');
    const inInput = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
    if (key === 'p') { // quick switcher — always available
      e.preventDefault();
      try {
        if (typeof openQuickSwitcher !== 'function') await loadModule('src/renderer/quickswitch.js');
        openQuickSwitcher();
      } catch (_) {}
      return;
    }
    if (modalOpen) return;
    if (key === 'w') { // close active tab (builder pane tab in nexus view)
      e.preventDefault();
      if (!S.activeModule && S.view === 'nexus' && typeof builderCloseActiveTab === 'function') await builderCloseActiveTab();
      else if (S.activeEntityTabKey) await closeEntityTab(S.activeEntityTabKey);
      return;
    }
    if (key === 'tab') { // cycle tabs (focused pane in nexus view, else legacy)
      e.preventDefault();
      if (!S.activeModule && S.view === 'nexus' && typeof builderCycleTab === 'function') {
        await builderCycleTab(e.shiftKey ? -1 : 1);
        return;
      }
      const ring = S.entityTabs.map(tb => tb.key);
      if (!ring.length) return;
      const cur = ring.indexOf(S.activeEntityTabKey);
      const next = ring[(cur + (e.shiftKey ? -1 : 1) + ring.length) % ring.length];
      await switchEntityTab(next);
      return;
    }
    if (inInput && !['e', 'n'].includes(key)) return;
    if (key === 'n' && S.activeModule === 'scribe' && S.nexus) { // new note
      e.preventDefault();
      openNoteModal();
      return;
    }
    // Ctrl+E is handled by the focused editor itself (mdeditor.js); this is
    // the fallback when focus is outside it.
    if (key === 'e' && typeof _mdActive?.toggleMode === 'function' && !inInput) {
      e.preventDefault();
      _mdActive.toggleMode();
    }
  });
}

function returnToNexus() {
  S.activeModule = null;
  S.view = 'nexus';
  renderProjectTabs();
  renderNexusHome();
}

