async function renderProjectHashtagView(){
  if(!S.project){
    q('#left-panel-inner').innerHTML=`<div class="empty" style="padding:40px 10px"><div class="ei">${I.hashtag}</div><p style="text-align:center">กรุณาเลือกโปรเจกต์ก่อน</p></div>`;
    q('#main-inner').innerHTML=`<div class="empty" style="margin-top:80px"><div class="ei">${I.hashtag}</div><h3>Project Tags</h3><p>กรุณาเลือกโปรเจกต์ก่อน</p></div>`;
    return;
  }
  const tags = await api.project.getAllUsedTags(S.project.id);
  let lh = `<div class="ph"><h4>Project Tags</h4></div>`;
  if(tags.length){
    lh += tags.map(t => {
      const col = t.color_code || '#6366f1';
      const act = S.projectHashtagId === t.id;
      return `<div class="li ${act?'active':''}" onclick="selectProjectHashtag(${t.id})">
        <span class="hn" style="color:${col};font-weight:700">#${x(t.tag_name)}</span>
      </div>`;
    }).join('');
  } else {
    lh += `<div class="empty" style="padding:20px 10px"><p style="font-size:12px;color:var(--t3);text-align:center">ยังไม่มี Tag ในโปรเจกต์นี้</p></div>`;
  }
  q('#left-panel-inner').innerHTML = lh;

  if(!S.projectHashtagId || !tags.find(t=>t.id===S.projectHashtagId)){
    q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px"><div class="ei">${I.hashtag}</div><h3>Project Tags</h3><p>เลือก Tag เพื่อดูรายการ Object และ Event ที่ใช้ Tag นี้</p></div>`;
    return;
  }
  const tag = tags.find(t=>t.id===S.projectHashtagId);
  const [objects, events] = await Promise.all([
    api.hashtag.getObjectsByTag(S.projectHashtagId, S.project.id),
    api.hashtag.getEventsByTag(S.projectHashtagId, S.project.id)
  ]);
  const col = tag?.color_code || '#6366f1';
  const total = objects.length + events.length;
  let h = `<div class="ch"><span class="hn" style="color:${col};font-size:1.4em;font-weight:700">#${x(tag?.tag_name||'')}</span>
    <span style="font-size:12px;color:var(--t3);margin-left:8px">${total} รายการ</span>
  </div>`;
  if(!total){
    h += `<div class="empty"><div class="ei">${I.hashtag}</div><h3>ยังไม่มี Object หรือ Event ใช้ Tag นี้</h3></div>`;
  } else {
    if(objects.length){
      h += `<div style="padding:4px 16px 2px;font-size:11px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.05em">Objects (${objects.length})</div>`;
      h += `<div class="objlist">`;
      for(const o of objects){
        const oc = o.color_code || '#6366f1';
        h += `<div class="objrow" onclick="selectSearchObject(${o.project_id},${o.category_id},${o.id})">
          <div class="odot" style="background:${oc}"></div>
          <div style="flex:1;min-width:0">
            <div class="oname">${x(o.name)}</div>
            <div style="font-size:12px;color:var(--t3);margin-top:2px">${x(o.category_name)}</div>
          </div>
        </div>`;
      }
      h += `</div>`;
    }
    if(events.length){
      h += `<div style="padding:4px 16px 2px;font-size:11px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.05em">Events (${events.length})</div>`;
      h += `<div class="objlist">`;
      for(const e of events){
        const ec = e.color_code || '#6366f1';
        h += `<div class="objrow">
          <div class="odot" style="background:${ec}"></div>
          <div style="flex:1;min-width:0">
            <div class="oname">${x(e.event_name||'Untitled Event')}</div>
            <div style="font-size:12px;color:var(--t3);margin-top:2px">${x(e.line_name||'')}</div>
          </div>
        </div>`;
      }
      h += `</div>`;
    }
  }
  q('#main-inner').innerHTML = h;
}

async function selectProjectHashtag(tagId){
  S.projectHashtagId = tagId;
  await renderProjectHashtagView();
}

async function renderHashtagView(){
  q('#left-panel-inner').innerHTML=`<div class="ph"><h4>ป้ายกำกับ</h4></div><div class="empty" style="padding:30px 10px"><div class="ei" style="font-size:28px;opacity:.3">🏷️</div></div>`;
  const tags=await api.hashtag.getAll();
  let h=`<div class="ch"><h2>🏷️ ป้ายกำกับ</h2><button class="btn btn-p" onclick="openHashtagModal()">+ เพิ่ม Tag</button></div>`;
  if(!tags.length){ h+=`<div class="empty"><div class="ei">🏷️</div><h3>ยังไม่มี Tag</h3></div>`; }
  else {
    h+=`<div class="htags-grid">`;
    for(const t of tags){
      const col=t.color_code||'#6366f1';
      h+=`<div class="htag-item" id="tag-item-${t.id}" style="--tc:${col}"><span class="hn">#${x(t.tag_name)}</span><button class="btn btn-g btn-i" onclick="openHashtagModal(${t.id})" style="opacity:.6;color:var(--tc)">✏️</button></div>`;
    }
    h+=`</div>`;
  }
  q('#main-inner').innerHTML=h;
}

// ═══ COLOR SETTINGS ════════════════════════════════════
let _wheelHue=239, _wheelSat=86, _wheelLight=67, _wheelDragging=false;
function hslToRgb(h,s,l){ s/=100;l/=100; const c=(1-Math.abs(2*l-1))*s,xc=c*(1-Math.abs((h/60)%2-1)),m=l-c/2; let r,g,b; if(h<60){r=c;g=xc;b=0;}else if(h<120){r=xc;g=c;b=0;}else if(h<180){r=0;g=c;b=xc;}else if(h<240){r=0;g=xc;b=c;}else if(h<300){r=xc;g=0;b=c;}else{r=c;g=0;b=xc;} return[Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)]; }
function rgbToHex(r,g,b){ return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join(''); }
function rgbToHsl(r,g,b){ r/=255;g/=255;b/=255; const max=Math.max(r,g,b),min=Math.min(r,g,b); let h=0,s=0,l=(max+min)/2; if(max!==min){ const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min); if(max===r)h=((g-b)/d+(g<b?6:0))*60; else if(max===g)h=((b-r)/d+2)*60; else h=((r-g)/d+4)*60; } return[h,Math.round(s*100),Math.round(l*100)]; }

async function renderColorSettings(){
  S.colors = await api.color.getAll();
  const paletteHTML = S.colors.map(c=>`<div class="palette-item">
    <div class="palette-swatch" style="background:${c.color_code}"></div>
    <span class="palette-code">${c.color_code}</span>
    <button class="btn btn-g btn-i" onclick="deleteColorSwatch(${c.id})" style="color:var(--danger)" title="ลบสีนี้">❌</button>
  </div>`).join('');
  q('#main-inner').innerHTML=`<div class="ch"><h2>🎨 จัดการสี</h2></div>
    <div class="color-settings-grid">
      <div class="cwheel-section">
        <h3 class="cs-title">Color Wheel</h3>
        <div class="cwheel-wrap">
          <canvas id="color-wheel" width="220" height="220"></canvas>
          <div class="cwheel-indicator" id="wheel-indicator"></div>
        </div>
        <div class="cwheel-preview">
          <div class="cpreview-swatch" id="cpreview-swatch"></div>
          <input id="cpreview-hex" value="#6366f1" spellcheck="false" oninput="onHexInput(this.value)">
          <input type="color" id="cnative-picker" value="#6366f1" oninput="onNativePick(this.value)" title="ตัวเลือกสีระบบ">
        </div>
        <button class="btn btn-p" onclick="addColorFromWheel()" style="width:100%">+ เพิ่มลงพาเลท</button>
      </div>
      <div class="cpalette-section">
        <h3 class="cs-title">ชุดสีทั้งหมด <span class="cs-count">${S.colors.length}</span></h3>
        <div class="palette-grid" id="palette-grid">${paletteHTML}</div>
      </div>
    </div>`;
  initColorWheel(); updateWheelPreview();
}

function initColorWheel(){ const canvas=q('#color-wheel'); if(!canvas) return; drawWheel(canvas); canvas.addEventListener('pointerdown',e=>{_wheelDragging=true;pickFromWheel(e);}); canvas.addEventListener('pointermove',e=>{if(_wheelDragging)pickFromWheel(e);}); canvas.addEventListener('pointerup',()=>{_wheelDragging=false;}); canvas.addEventListener('pointerleave',()=>{_wheelDragging=false;}); }
function drawWheel(canvas){ const ctx=canvas.getContext('2d'),size=canvas.width,cx=size/2,cy=size/2,radius=size/2-6; ctx.clearRect(0,0,size,size); const img=ctx.createImageData(size,size); for(let py=0;py<size;py++){for(let px=0;px<size;px++){const dx=px-cx,dy=py-cy,dist=Math.sqrt(dx*dx+dy*dy); if(dist<=radius){const ang=((Math.atan2(dy,dx)*180/Math.PI)+360)%360,sat=(dist/radius)*100,[r,g,b]=hslToRgb(ang,sat,_wheelLight),i=(py*size+px)*4;img.data[i]=r;img.data[i+1]=g;img.data[i+2]=b;img.data[i+3]=255;}}} ctx.putImageData(img,0,0); ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1.5;ctx.stroke(); positionWheelIndicator(); }
function positionWheelIndicator(){ const ind=q('#wheel-indicator'),canvas=q('#color-wheel'); if(!ind||!canvas) return; const size=canvas.width,cx=size/2,cy=size/2,radius=size/2-6,rad=_wheelHue*Math.PI/180,dist=(_wheelSat/100)*radius; ind.style.left=(cx+Math.cos(rad)*dist)+'px'; ind.style.top=(cy+Math.sin(rad)*dist)+'px'; }
function pickFromWheel(e){ const canvas=q('#color-wheel'),rect=canvas.getBoundingClientRect(),sx=canvas.width/rect.width,sy=canvas.height/rect.height,px=(e.clientX-rect.left)*sx,py=(e.clientY-rect.top)*sy,cx=canvas.width/2,cy=canvas.height/2,radius=canvas.width/2-6,dx=px-cx,dy=py-cy; let dist=Math.sqrt(dx*dx+dy*dy); if(dist>radius)dist=radius; _wheelHue=((Math.atan2(dy,dx)*180/Math.PI)+360)%360; _wheelSat=(dist/radius)*100; updateWheelPreview(); positionWheelIndicator(); }
function updateWheelPreview(){ const [r,g,b]=hslToRgb(_wheelHue,_wheelSat,_wheelLight),hex=rgbToHex(r,g,b); const sw=q('#cpreview-swatch');if(sw){sw.style.background=hex;sw.style.boxShadow=`0 0 16px ${hex}40`;} const hi=q('#cpreview-hex');if(hi)hi.value=hex; const np=q('#cnative-picker');if(np)np.value=hex; }
function onHexInput(val){ if(/^#[0-9a-fA-F]{6}$/.test(val)){const r=parseInt(val.substr(1,2),16),g=parseInt(val.substr(3,2),16),b=parseInt(val.substr(5,2),16),[h,s,l]=rgbToHsl(r,g,b);_wheelHue=h;_wheelSat=s;_wheelLight=l; const canvas=q('#color-wheel');if(canvas)drawWheel(canvas); const sw=q('#cpreview-swatch');if(sw){sw.style.background=val;sw.style.boxShadow=`0 0 16px ${val}40`;} const np=q('#cnative-picker');if(np)np.value=val;} }
function onNativePick(val){ const hi=q('#cpreview-hex');if(hi)hi.value=val; onHexInput(val); }
async function addColorFromWheel(){ const code=q('#cpreview-hex').value.trim(); if(!/^#[0-9a-fA-F]{6}$/.test(code)){toast('รูปแบบสีไม่ถูกต้อง','err');return;} await api.color.add(code); S.colors=await api.color.getAll(); renderColorSettings(); toast('เพิ่มสีเรียบร้อยแล้ว','ok'); }
async function deleteColorSwatch(id){ const result=await api.color.delete(id); if(!result){toast('ไม่สามารถลบได้ -- สีนี้ถูกใช้งานอยู่','err');return;} S.colors=await api.color.getAll(); renderColorSettings(); toast('ลบสีแล้ว','ok'); }

// ═══ MODALS: FOLDER ════════════════════════════════════
