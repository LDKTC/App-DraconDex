// Sage module — Analytics

async function renderSageView() {
  S.activeModule = 'sage';
  if (!S.sageTab) S.sageTab = 'dataSize';
  q('#left-panel-inner').innerHTML = `
    <div class="ph"><h4>${t('sage')}</h4></div>
    <div class="panel-item${S.sageTab==='dataSize'?' active':''}" onclick="setSageTab('dataSize')">${t('sageDataSize')}</div>
    <div class="panel-item${S.sageTab==='objectAmount'?' active':''}" onclick="setSageTab('objectAmount')">${t('sageObjectAmount')}</div>
    <div class="panel-item${S.sageTab==='linkerList'?' active':''}" onclick="setSageTab('linkerList')">${t('sageLinkerList')}</div>
    <div class="panel-item${S.sageTab==='linkerGraph'?' active':''}" onclick="setSageTab('linkerGraph')">${t('sageLinkerGraph')}</div>`;
  await renderSageTab();
  updateTopNavButton();
}

function setSageTab(tab) {
  S.sageTab = tab;
  renderSageView();
}

async function renderSageTab() {
  const mi = q('#main-inner');
  mi.innerHTML = '';
  // The graph canvas needs #main-inner as a flex column (same layout Director's
  // Relation graph uses) so its flex:1 wrap actually fills the available height.
  mi.classList.toggle('relation-main', S.sageTab === 'linkerGraph');
  if (S.sageTab === 'dataSize') await renderSageDataSize(mi);
  else if (S.sageTab === 'objectAmount') await renderSageObjectAmount(mi);
  else if (S.sageTab === 'linkerList') await renderSageLinkerList(mi);
  else if (S.sageTab === 'linkerGraph') await renderSageLinkerGraph(mi);
}

async function renderSageDataSize(container) {
  const data = await api.sage.getDataSize();
  const moduleColors = { director:'var(--accent)', navigator:'#22c55e', hero:'#f59e0b', writer:'#8b5cf6' };
  const moduleIcons = { director: I.director, navigator: I.navigator, hero: I.hero, writer: I.writer };
  const total = data.reduce((s, m) => s + m.rows, 0);
  container.innerHTML = `
    <div style="padding:24px">
      <h3 style="color:var(--t1);margin-bottom:4px">${t('sageDataSize')}</h3>
      <p style="color:var(--t3);font-size:13px;margin-bottom:24px">${total} ${t('sageRows')} total</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px">
        ${data.map(m => `
          <div class="sage-card" style="border-left:4px solid ${moduleColors[m.module]||'var(--border)'}">
            <div class="sage-card-icon">${moduleIcons[m.module]||I.chart}</div>
            <div class="sage-card-body">
              <div class="sage-card-name">${m.module.charAt(0).toUpperCase()+m.module.slice(1)}</div>
              <div class="sage-card-count">${m.rows} <span>${t('sageRows')}</span></div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

async function renderSageObjectAmount(container) {
  const data = await api.sage.getObjectAmounts();
  const groups = [
    { label:'Director', color:'var(--accent)', items:[
      { key:'projects', label:'Projects' },
      { key:'categories', label:'Categories' },
      { key:'objects', label:'Objects' },
      { key:'timelineEvts', label:'Timeline Events' },
      { key:'relations', label:'Relations' },
      { key:'mapAreas', label:'Map Areas' },
    ]},
    { label:'Navigator', color:'#22c55e', items:[
      { key:'worlds', label:'Worlds' },
      { key:'worldChars', label:'World Characters' },
      { key:'worldCatObjs', label:'World Cat. Objects' },
      { key:'worldMaptlEvts', label:'Map Timeline Events' },
    ]},
    { label:'Hero', color:'#f59e0b', items:[
      { key:'games', label:'Games' },
      { key:'gameChars', label:'Game Characters' },
      { key:'gameElements', label:'Game Elements' },
      { key:'dialogueNodes', label:'Dialogue Nodes' },
      { key:'dialogueEdges', label:'Storyline Edges' },
      { key:'conversations', label:'Conversations' },
    ]},
    { label:'Writer', color:'#8b5cf6', items:[
      { key:'writeProjects', label:'Writing Projects' },
      { key:'series', label:'Series' },
      { key:'books', label:'Books' },
      { key:'chapters', label:'Chapters' },
      { key:'notes', label:'Notes' },
    ]},
    { label:'Global', color:'var(--t3)', items:[
      { key:'hashtags', label:'Hashtags' },
    ]},
  ];
  container.innerHTML = `
    <div style="padding:24px">
      <h3 style="color:var(--t1);margin-bottom:24px">${t('sageObjectAmount')}</h3>
      ${groups.map(g => `
        <div style="margin-bottom:20px">
          <h4 style="color:${g.color};margin-bottom:8px;font-size:13px;text-transform:uppercase;letter-spacing:1px">${g.label}</h4>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px">
            ${g.items.map(item => `
              <div class="sage-stat-card">
                <span class="sage-stat-num" style="color:${g.color}">${data[item.key]||0}</span>
                <span class="sage-stat-label">${item.label}</span>
              </div>`).join('')}
          </div>
        </div>`).join('')}
    </div>`;
}

async function renderSageLinkerList(container) {
  const links = await api.sage.getLinkerList();
  const typeColors = { project:'var(--accent)', hashtag:'#d97706', world:'#22c55e', game:'#f59e0b', write:'#8b5cf6', series:'#6366f1', object:'#ec4899', world_char:'#14b8a6' };
  container.innerHTML = `
    <div style="padding:24px">
      <h3 style="color:var(--t1);margin-bottom:4px">${t('sageLinkerList')}</h3>
      <p style="color:var(--t3);font-size:13px;margin-bottom:16px">${links.length} links</p>
      <table class="sage-table">
        <thead><tr>
          <th>${t('sageFrom')}</th><th>${t('sageType')}</th><th>${t('sageTo')}</th><th>${t('sageType')}</th>
        </tr></thead>
        <tbody>
          ${links.map(l => `<tr>
            <td><span style="color:${typeColors[l.from_type]||'var(--t1)'}">${esc(l.from_name)}</span></td>
            <td><span class="sage-type-badge" style="background:${typeColors[l.from_type]||'var(--raised)'}">${l.from_type}</span></td>
            <td><span style="color:${typeColors[l.to_type]||'var(--t1)'}">${esc(l.to_name)}</span></td>
            <td><span class="sage-type-badge" style="background:${typeColors[l.to_type]||'var(--raised)'}">${l.to_type}</span></td>
          </tr>`).join('')}
          ${!links.length ? `<tr><td colspan="4" style="text-align:center;color:var(--t3);padding:24px">No links yet</td></tr>` : ''}
        </tbody>
      </table>
    </div>`;
}

const SAGE_MODULE_COLORS = { director:'#6366f1', navigator:'#22c55e', hero:'#f59e0b', writer:'#8b5cf6', global:'#d97706' };
let _sageGraphState = null; // { data, hiddenModules:Set }

async function renderSageLinkerGraph(container) {
  container.innerHTML = `
    <div style="padding:16px 24px 8px;display:flex;align-items:center;justify-content:space-between">
      <h3 style="color:var(--t1);margin-bottom:4px">${t('sageLinkerGraph')}</h3>
    </div>
    <div id="sage-graph-wrap" style="flex:1;position:relative;overflow:hidden"></div>`;
  const data = await api.sage.getLinkerGraph();
  if (!data.nodes.length) {
    q('#sage-graph-wrap').innerHTML = `<div class="empty" style="margin-top:60px"><p>No linked data yet</p></div>`;
    return;
  }
  if (!_sageGraphState || _sageGraphState.dataRef !== data) {
    _sageGraphState = { hiddenModules: _sageGraphState?.hiddenModules || new Set() };
  }
  _sageGraphState.dataRef = data;
  buildSageGraph(data, _sageGraphState.hiddenModules);
}

function buildSageGraph(data, hiddenModules) {
  const wrap = q('#sage-graph-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  const W = wrap.clientWidth || 800, H = wrap.clientHeight || 500;

  // Degree (connection count) drives node radius, Obsidian-style.
  const degree = new Map();
  data.edges.forEach(e => {
    degree.set(e.source, (degree.get(e.source)||0)+1);
    degree.set(e.target, (degree.get(e.target)||0)+1);
  });
  const neighbors = new Map(); // nodeId -> Set(nodeId) via edge
  data.edges.forEach(e => {
    (neighbors.get(e.source) || neighbors.set(e.source, new Set()).get(e.source)).add(e.target);
    (neighbors.get(e.target) || neighbors.set(e.target, new Set()).get(e.target)).add(e.source);
  });

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width','100%');
  svg.setAttribute('height','100%');
  svg.style.cssText = 'position:absolute;inset:0;background:var(--bg);cursor:grab';
  wrap.appendChild(svg);

  const viewport = document.createElementNS('http://www.w3.org/2000/svg','g');
  svg.appendChild(viewport);
  const gLinks = document.createElementNS('http://www.w3.org/2000/svg','g');
  const gNodes = document.createElementNS('http://www.w3.org/2000/svg','g');
  viewport.appendChild(gLinks); viewport.appendChild(gNodes);

  const nodes = data.nodes.map(n => ({
    ...n,
    r: Math.min(28, 8 + Math.sqrt(degree.get(n.id)||0)*4),
    x: W/2 + (Math.random()-.5)*300, y: H/2 + (Math.random()-.5)*300,
  }));
  const nodeById = new Map(nodes.map(n => [n.id, n]));

  const lines = data.edges.map(e => {
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('stroke','var(--border)'); line.setAttribute('stroke-width','1.25');
    gLinks.appendChild(line);
    return { el:line, source:e.source, target:e.target };
  });

  // ── pan & zoom ──────────────────────────────────────────
  let view = { scale: 1, tx: 0, ty: 0 };
  function applyView() {
    viewport.setAttribute('transform', `translate(${view.tx},${view.ty}) scale(${view.scale})`);
  }
  let panning = false, panStartX=0, panStartY=0, panOrigTx=0, panOrigTy=0;
  svg.addEventListener('mousedown', ev => {
    if (ev.target !== svg) return; // node drags handle their own mousedown
    panning = true; panStartX = ev.clientX; panStartY = ev.clientY;
    panOrigTx = view.tx; panOrigTy = view.ty;
    svg.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', ev => {
    if (!panning) return;
    view.tx = panOrigTx + (ev.clientX - panStartX);
    view.ty = panOrigTy + (ev.clientY - panStartY);
    applyView();
  });
  window.addEventListener('mouseup', () => { panning = false; svg.style.cursor = 'grab'; });
  svg.addEventListener('wheel', ev => {
    ev.preventDefault();
    const rect = svg.getBoundingClientRect();
    const mx = ev.clientX - rect.left, my = ev.clientY - rect.top;
    const factor = ev.deltaY < 0 ? 1.12 : 1/1.12;
    const newScale = Math.max(0.2, Math.min(4, view.scale * factor));
    view.tx = mx - (mx - view.tx) * (newScale/view.scale);
    view.ty = my - (my - view.ty) * (newScale/view.scale);
    view.scale = newScale;
    applyView();
  }, { passive:false });

  // ── nodes ───────────────────────────────────────────────
  const circles = nodes.map(n => {
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.style.cursor = 'grab';
    g.dataset.id = n.id;
    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('r', n.r);
    c.setAttribute('fill', SAGE_MODULE_COLORS[n.module]||'var(--raised)');
    c.setAttribute('stroke','var(--bg)'); c.setAttribute('stroke-width','2');
    const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
    txt.setAttribute('text-anchor','middle'); txt.setAttribute('y', n.r + 12);
    txt.setAttribute('fill','var(--t2)'); txt.setAttribute('font-size','10'); txt.setAttribute('pointer-events','none');
    txt.textContent = n.label.length > 14 ? n.label.slice(0,13)+'…' : n.label;
    g.appendChild(c); g.appendChild(txt);
    gNodes.appendChild(g);

    let dragging = false, dx=0, dy=0, moved=false;
    g.addEventListener('mousedown', ev => {
      dragging = true; moved = false;
      dx = (ev.clientX - svg.getBoundingClientRect().left - view.tx)/view.scale - n.x;
      dy = (ev.clientY - svg.getBoundingClientRect().top - view.ty)/view.scale - n.y;
      g.style.cursor = 'grabbing'; ev.stopPropagation(); ev.preventDefault();
    });
    window.addEventListener('mousemove', ev => {
      if (!dragging) return;
      moved = true;
      n.x = (ev.clientX - svg.getBoundingClientRect().left - view.tx)/view.scale - dx;
      n.y = (ev.clientY - svg.getBoundingClientRect().top - view.ty)/view.scale - dy;
      updatePositions();
    });
    window.addEventListener('mouseup', () => { dragging = false; g.style.cursor = 'grab'; });
    g.addEventListener('mouseenter', () => highlightNode(n.id));
    g.addEventListener('mouseleave', () => highlightNode(null));
    return { el:g, circle:c, text:txt, node:n };
  });

  function highlightNode(id) {
    if (id == null) {
      circles.forEach(({el}) => el.style.opacity = '');
      lines.forEach(({el}) => { el.style.opacity = ''; el.setAttribute('stroke-width','1.25'); });
      return;
    }
    const neigh = neighbors.get(id) || new Set();
    circles.forEach(({el, node}) => {
      el.style.opacity = (node.id === id || neigh.has(node.id)) ? '1' : '0.15';
    });
    lines.forEach(({el, source, target}) => {
      const active = source === id || target === id;
      el.style.opacity = active ? '1' : '0.08';
      el.setAttribute('stroke-width', active ? '2' : '1.25');
      if (active) el.setAttribute('stroke', SAGE_MODULE_COLORS[nodeById.get(id).module] || 'var(--t3)');
      else el.setAttribute('stroke', 'var(--border)');
    });
  }

  function applyModuleFilter() {
    circles.forEach(({el, node}) => { el.style.display = hiddenModules.has(node.module) ? 'none' : ''; });
    lines.forEach(({el, source, target}) => {
      const s = nodeById.get(source), t = nodeById.get(target);
      const hide = !s || !t || hiddenModules.has(s.module) || hiddenModules.has(t.module);
      el.style.display = hide ? 'none' : '';
    });
  }

  function updatePositions() {
    circles.forEach(({ el, node }) => { el.setAttribute('transform', `translate(${node.x},${node.y})`); });
    lines.forEach(({ el, source, target }) => {
      const s = nodeById.get(source), t = nodeById.get(target);
      if (!s||!t) return;
      el.setAttribute('x1',s.x); el.setAttribute('y1',s.y);
      el.setAttribute('x2',t.x); el.setAttribute('y2',t.y);
    });
  }

  // Simple force layout (repulsion + spring edges), hidden nodes excluded from forces.
  function tick() {
    const k = 0.01, repel = 1400;
    const active = nodes.filter(n => !hiddenModules.has(n.module));
    for (const n of active) { n.vx = (n.vx||0)*0.85; n.vy = (n.vy||0)*0.85; }
    for (let i=0;i<active.length;i++) {
      for (let j=i+1;j<active.length;j++) {
        const dx=active[j].x-active[i].x, dy=active[j].y-active[i].y;
        const d=Math.max(1,Math.sqrt(dx*dx+dy*dy));
        const f=repel/(d*d);
        active[i].vx -= f*dx/d; active[i].vy -= f*dy/d;
        active[j].vx += f*dx/d; active[j].vy += f*dy/d;
      }
    }
    for (const e of data.edges) {
      const s=nodeById.get(e.source), tg=nodeById.get(e.target);
      if (!s||!tg||hiddenModules.has(s.module)||hiddenModules.has(tg.module)) continue;
      const dx=tg.x-s.x, dy=tg.y-s.y, d=Math.max(1,Math.sqrt(dx*dx+dy*dy));
      const f=(d-120)*k;
      s.vx+=f*dx/d; s.vy+=f*dy/d; tg.vx-=f*dx/d; tg.vy-=f*dy/d;
    }
    for (const n of active) {
      n.x = Math.max(20,Math.min(W-20,n.x+(n.vx||0)));
      n.y = Math.max(20,Math.min(H-20,n.y+(n.vy||0)));
    }
    updatePositions();
  }

  let animating = true;
  let frame = 0;
  function animate() {
    if (!animating || !q('#sage-graph-wrap')) { return; }
    if (frame++ < 220) { tick(); requestAnimationFrame(animate); }
    else updatePositions();
  }
  updatePositions();
  applyModuleFilter();
  animate();

  // ── module filter checkboxes (top-left overlay) ────────
  const counts = { director:0, navigator:0, hero:0, writer:0, global:0 };
  nodes.forEach(n => { counts[n.module] = (counts[n.module]||0)+1; });
  const panel = document.createElement('div');
  panel.style.cssText = 'position:absolute;top:12px;left:12px;display:flex;flex-direction:column;gap:6px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-size:12px;z-index:2';
  const moduleLabels = { director:t('director'), navigator:t('navigator'), hero:t('hero'), writer:t('writer'), global:t('hashtag') };
  panel.innerHTML = Object.keys(SAGE_MODULE_COLORS).map(mod => `
    <label style="display:flex;align-items:center;gap:6px;color:var(--t2);cursor:pointer;user-select:none">
      <input type="checkbox" class="sage-graph-mod-cb" data-mod="${mod}" ${hiddenModules.has(mod)?'':'checked'}>
      <span style="width:10px;height:10px;border-radius:50%;background:${SAGE_MODULE_COLORS[mod]};display:inline-block;flex-shrink:0"></span>
      <span style="flex:1">${moduleLabels[mod]}</span>
      <span style="color:var(--t3)">${counts[mod]||0}</span>
    </label>`).join('');
  wrap.appendChild(panel);
  panel.querySelectorAll('.sage-graph-mod-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      const mod = cb.dataset.mod;
      if (cb.checked) hiddenModules.delete(mod); else hiddenModules.add(mod);
      applyModuleFilter();
    });
  });
}
