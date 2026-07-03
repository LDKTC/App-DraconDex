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

async function renderSageLinkerGraph(container) {
  container.innerHTML = `
    <div style="padding:16px 24px 8px">
      <h3 style="color:var(--t1);margin-bottom:4px">${t('sageLinkerGraph')}</h3>
    </div>
    <div id="sage-graph-wrap" style="flex:1;position:relative;overflow:hidden"></div>`;
  const data = await api.sage.getLinkerGraph();
  if (!data.nodes.length) {
    q('#sage-graph-wrap').innerHTML = `<div class="empty" style="margin-top:60px"><p>No linked data yet</p></div>`;
    return;
  }
  await loadModule('src/renderer/relation.js');
  const wrap = q('#sage-graph-wrap');
  const W = wrap.clientWidth || 800, H = wrap.clientHeight || 500;
  const typeColors = { project:'#6366f1', hashtag:'#d97706', world:'#22c55e', game:'#f59e0b', write:'#8b5cf6', series:'#6366f1' };

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width','100%');
  svg.setAttribute('height','100%');
  svg.style.cssText = 'position:absolute;inset:0;background:var(--bg)';
  wrap.appendChild(svg);

  const nodes = data.nodes.map(n => ({ ...n, x: W/2 + (Math.random()-.5)*300, y: H/2 + (Math.random()-.5)*300 }));
  const nodeById = new Map(nodes.map(n => [n.id, n]));

  const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg','marker');
  marker.id = 'sage-arrow';
  marker.setAttribute('markerWidth','6'); marker.setAttribute('markerHeight','6');
  marker.setAttribute('refX','6'); marker.setAttribute('refY','3'); marker.setAttribute('orient','auto');
  const arrow = document.createElementNS('http://www.w3.org/2000/svg','path');
  arrow.setAttribute('d','M0,0 L0,6 L6,3 z');
  arrow.setAttribute('fill','var(--t3)');
  marker.appendChild(arrow); defs.appendChild(marker); svg.appendChild(defs);

  const gLinks = document.createElementNS('http://www.w3.org/2000/svg','g');
  const gNodes = document.createElementNS('http://www.w3.org/2000/svg','g');
  svg.appendChild(gLinks); svg.appendChild(gNodes);

  const lines = data.edges.map(e => {
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('stroke','var(--border)'); line.setAttribute('stroke-width','1.5');
    gLinks.appendChild(line);
    return { el:line, source:e.source, target:e.target };
  });

  const circles = nodes.map(n => {
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.style.cursor = 'grab';
    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('r','18'); c.setAttribute('fill', typeColors[n.type]||'var(--raised)'); c.setAttribute('stroke','var(--bg)'); c.setAttribute('stroke-width','2');
    const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
    txt.setAttribute('text-anchor','middle'); txt.setAttribute('dominant-baseline','middle');
    txt.setAttribute('fill','#fff'); txt.setAttribute('font-size','9'); txt.setAttribute('pointer-events','none');
    txt.textContent = n.label.slice(0,8);
    g.appendChild(c); g.appendChild(txt);
    gNodes.appendChild(g);

    let dragging = false, dx=0, dy=0;
    g.addEventListener('mousedown', ev => {
      dragging = true; dx = ev.clientX - n.x; dy = ev.clientY - n.y;
      g.style.cursor = 'grabbing'; ev.preventDefault();
    });
    document.addEventListener('mousemove', ev => {
      if (!dragging) return;
      n.x = ev.clientX - dx; n.y = ev.clientY - dy;
      updatePositions();
    });
    document.addEventListener('mouseup', () => { dragging = false; g.style.cursor = 'grab'; });
    return { el:g, node:n };
  });

  function updatePositions() {
    circles.forEach(({ el, node }) => {
      el.setAttribute('transform', `translate(${node.x},${node.y})`);
    });
    lines.forEach(({ el, source, target }) => {
      const s = nodeById.get(source), t = nodeById.get(target);
      if (!s||!t) return;
      el.setAttribute('x1',s.x); el.setAttribute('y1',s.y);
      el.setAttribute('x2',t.x); el.setAttribute('y2',t.y);
    });
  }

  // Simple force layout
  function tick() {
    const k = 0.01, repel = 1200;
    for (const n of nodes) { n.vx = (n.vx||0)*0.85; n.vy = (n.vy||0)*0.85; }
    for (let i=0;i<nodes.length;i++) {
      for (let j=i+1;j<nodes.length;j++) {
        const dx=nodes[j].x-nodes[i].x, dy=nodes[j].y-nodes[i].y;
        const d=Math.max(1,Math.sqrt(dx*dx+dy*dy));
        const f=repel/(d*d);
        nodes[i].vx -= f*dx/d; nodes[i].vy -= f*dy/d;
        nodes[j].vx += f*dx/d; nodes[j].vy += f*dy/d;
      }
    }
    for (const e of data.edges) {
      const s=nodeById.get(e.source), tg=nodeById.get(e.target);
      if (!s||!tg) continue;
      const dx=tg.x-s.x, dy=tg.y-s.y, d=Math.max(1,Math.sqrt(dx*dx+dy*dy));
      const f=(d-120)*k;
      s.vx+=f*dx/d; s.vy+=f*dy/d; tg.vx-=f*dx/d; tg.vy-=f*dy/d;
    }
    for (const n of nodes) {
      n.x = Math.max(20,Math.min(W-20,n.x+(n.vx||0)));
      n.y = Math.max(20,Math.min(H-20,n.y+(n.vy||0)));
    }
    updatePositions();
  }

  let animating = true;
  let frame = 0;
  function animate() {
    if (!animating || !q('#sage-graph-wrap')) { return; }
    if (frame++ < 200) { tick(); requestAnimationFrame(animate); }
    else updatePositions();
  }
  updatePositions();
  animate();

  // Legend
  const legend = document.createElement('div');
  legend.style.cssText = 'position:absolute;bottom:12px;right:12px;display:flex;flex-direction:column;gap:4px;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:8px 12px';
  Object.entries(typeColors).forEach(([type,color]) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:11px;color:var(--t2)';
    row.innerHTML = `<span style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block"></span>${type}`;
    legend.appendChild(row);
  });
  wrap.appendChild(legend);
}
