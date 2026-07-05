// IDE-style explorer: one tree of everything in the active Nexus, spanning
// every module. Rows navigate through openEntityByKey; group/branch rows
// expand in place (state in S.explorerOpen). This is an extra left-panel view
// — each module's own sidebar remains untouched.

async function renderNexusExplorer() {
  const el = q('#left-panel-inner');
  if (!el || !S.nexus) return;
  const tree = await api.wiki.explorerTree(S.nexus.id);
  S.explorerTree = tree;

  const SECTIONS = [
    ['scribe', 'scribe'], ['director', 'director'], ['navigator', 'navigator'],
    ['hero', 'hero'], ['writer', 'writer'],
  ];

  const row = (node, depth) => {
    const pad = 8 + depth * 12;
    const kids = node.children || [];
    // Folder/group rows toggle; leaf rows (and branch rows' labels) navigate.
    if (kids.length || node.key.startsWith('nfold_')) {
      const open = S.explorerOpen.has(node.key);
      return `
        <div class="li xp-row" style="padding-left:${pad}px" onclick="tglExplorerNode('${node.key}')">
          <svg class="xp-chev" style="transform:rotate(${open ? 90 : 0}deg)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          <span class="dot" style="background:${node.color || 'var(--t3)'}"></span>
          <span class="name">${x(node.name)}</span>
          ${node.key.startsWith('nfold_') ? '' : `<button class="btn-icon xp-open" onclick="event.stopPropagation();openEntityByKey('${node.key}')" title="${t('open')}">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </button>`}
          <span class="xp-count">${kids.length}</span>
        </div>
        ${open ? kids.map(k => row(k, depth + 1)).join('') : ''}`;
    }
    return `
      <div class="li xp-row xp-leaf" style="padding-left:${pad + 14}px" onclick="openEntityByKey('${node.key}')">
        <span class="dot" style="background:${node.color || 'var(--accent)'}"></span>
        <span class="name">${x(node.name)}</span>
      </div>`;
  };

  const section = (mod, nodes) => {
    const skey = `sec_${mod}`;
    const open = S.explorerOpen.has(skey);
    return `
      <div class="xp-section">
        <div class="xp-section-head" onclick="tglExplorerNode('${skey}')">
          <svg class="xp-chev" style="transform:rotate(${open ? 90 : 0}deg)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          <span class="xp-section-icon">${I[mod] || ''}</span>
          <span class="name">${t(mod)}</span>
          <span class="xp-count">${nodes.length}</span>
        </div>
        ${open ? (nodes.length ? nodes.map(n => row(n, 1)).join('') : `<div class="xp-empty">—</div>`) : ''}
      </div>`;
  };

  el.innerHTML = `
    <div class="ph"><h4>${t('explorer')}</h4></div>
    ${SECTIONS.map(([mod, prop]) => section(mod, tree[prop] || [])).join('')}`;
}

function tglExplorerNode(key) {
  if (S.explorerOpen.has(key)) S.explorerOpen.delete(key);
  else S.explorerOpen.add(key);
  renderNexusExplorer();
}

// Rail entry point: keep the current main view, swap only the left panel.
async function openExplorerPanel() {
  document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
  q('.nav-btn[data-panel="explorer"]')?.classList.add('active');
  await renderNexusExplorer();
}
