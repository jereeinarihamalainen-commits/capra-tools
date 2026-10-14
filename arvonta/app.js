(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('poster');
  const ctx = canvas.getContext('2d');
  const W = 1080, H = 1080;
  const logo = new Image();
  const photo = new Image();
  logo.src = '../assets/capra-logo-light.jpeg';
  const defaultPhoto = './default.webp';

  const definitions = [
    ['logo', 'Virallinen logo', null, 25, 4, 250, 0, 0, 0],
    ['kicker', 'Pieni otsikko', 'ARVONTA', 291, 88, 40, 20, 90, 0],
    ['headline1', 'Pääotsikko 1', 'VOITA', 46, 246, 125, 45, 165, 0],
    ['headline2', 'Pääotsikko 2', 'PERUSKURSSI', 47, 366, 75, 35, 110, 0],
    ['headline3', 'Pääotsikko 3', 'SINULLE JA', 48, 463, 61, 30, 100, 0],
    ['headline4', 'Pääotsikko 4', 'KAVERILLE', 45, 533, 91, 40, 125, 0],
    ['prize', 'Palkinto', '2 PERUSKURSSIPAIKKAA', 49, 722, 48, 25, 75, 0],
    ['value', 'Palkinnon arvo', 'ARVO 240 €', 51, 782, 46, 25, 80, 0],
    ['steps', 'Osallistumisen vaiheet', 'TYKKÄÄ + JAA + KOMMENTOI', 49, 863, 47, 25, 75, 0],
    ['question', 'Kommentointikehotus', 'Kenet ottaisit mukaan?', 51, 918, 34, 20, 70, 0],
    ['deadline', 'Päättymispäivä', 'OSALLISTUMINEN PÄÄTTYY 24.11.', 49, 1000, 34, 20, 65, 0],
  ];
  const fresh = () => Object.fromEntries(definitions.map(([id,,text,x,y,size,min,max]) => [id,{text,x,y,size,min,max,visible:true}]));
  const state = {layers:fresh(),selected:'headline1',photoSrc:defaultPhoto,photoX:0,photoY:0,zoom:1,shade:.08,accent:'#c8ae4d',paper:'#f6f4ef'};
  let drag = null;
  let hitBoxes = [];
  const imageBox = {x:565,y:0,w:515,h:688};
  const textIds = definitions.filter(d => d[2] !== null).map(d => d[0]);

  function status(message){$('status').textContent=message}
  function loadPhoto(src){photo.onload=render;photo.onerror=()=>status('Kuvan avaaminen epäonnistui.');photo.src=src;state.photoSrc=src}
  function fontFor(id,size){return ['headline1','headline2','headline3','headline4','prize','steps'].includes(id)
    ? `900 ${size}px "Barlow Condensed",Impact,Arial,sans-serif`
    : `800 ${size}px Inter,Arial,sans-serif`}
  function fitted(id,text,size,maxWidth){let s=size;ctx.font=fontFor(id,s);while(s>16 && ctx.measureText(text).width>maxWidth){s--;ctx.font=fontFor(id,s)}return s}
  function drawImageCover(){
    ctx.save();ctx.beginPath();ctx.rect(imageBox.x,imageBox.y,imageBox.w,imageBox.h);ctx.clip();
    ctx.fillStyle='#22261f';ctx.fillRect(imageBox.x,imageBox.y,imageBox.w,imageBox.h);
    if(photo.complete&&photo.naturalWidth){
      const scale=Math.max(imageBox.w/photo.naturalWidth,imageBox.h/photo.naturalHeight)*state.zoom;
      const dw=photo.naturalWidth*scale,dh=photo.naturalHeight*scale;
      ctx.drawImage(photo,imageBox.x+(imageBox.w-dw)/2+state.photoX,imageBox.y+(imageBox.h-dh)/2+state.photoY,dw,dh);
    }
    ctx.fillStyle=`rgba(0,0,0,${state.shade})`;ctx.fillRect(imageBox.x,imageBox.y,imageBox.w,imageBox.h);
    const fade=ctx.createLinearGradient(imageBox.x,0,imageBox.x+imageBox.w*.35,0);
    fade.addColorStop(0,'rgba(0,0,0,.86)');fade.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=fade;ctx.fillRect(imageBox.x,imageBox.y,imageBox.w*.35,imageBox.h);
    ctx.restore();
  }
  function drawLayer(id){
    const s=state.layers[id];if(!s.visible)return;
    if(id==='logo'){
      if(logo.complete&&logo.naturalWidth){ctx.drawImage(logo,s.x,s.y,s.size,s.size);hitBoxes.push({id,x:s.x,y:s.y,w:s.size,h:s.size})}
      return;
    }
    const raw=String(s.text||'').replace(/\s+/g,' ').trim();if(!raw)return;
    const maxWidth=id.startsWith('headline')?492:id==='kicker'?260:id==='deadline'?982:id==='question'?982:980;
    const actual=fitted(id,raw,s.size,maxWidth);
    ctx.font=fontFor(id,actual);ctx.textBaseline='top';ctx.textAlign='left';
    ctx.fillStyle=['kicker','headline4','value'].includes(id)?state.accent:
      id==='headline1'||id==='headline2'||id==='headline3'?'#f6f4ef':
      id==='deadline'?'#f6f4ef':'#171914';
    ctx.fillText(raw,s.x,s.y);
    const measured=ctx.measureText(raw);
    hitBoxes.push({id,x:s.x-4,y:s.y-4,w:Math.min(measured.width+8,maxWidth+8),h:actual*1.15+8});
  }
  function render(guides=true){
    hitBoxes=[];
    ctx.fillStyle='#000000';ctx.fillRect(0,0,W,H);
    drawImageCover();
    ctx.fillStyle=state.accent;ctx.fillRect(imageBox.x-8,0,8,688);ctx.fillRect(0,688,W,9);
    ctx.fillStyle=state.paper;ctx.fillRect(0,697,W,278);
    ctx.fillStyle='#cfcfc5';ctx.fillRect(48,847,984,2);
    ctx.fillStyle='#000000';ctx.fillRect(0,975,W,105);
    definitions.forEach(([id])=>drawLayer(id));
    if(guides){const box=hitBoxes.find(b=>b.id===state.selected);if(box){ctx.strokeStyle=state.accent;ctx.lineWidth=2;ctx.setLineDash([8,7]);ctx.strokeRect(box.x,box.y,box.w,box.h);ctx.setLineDash([])}}
  }
  function drawToOffscreen(offscreen){
    render(false);offscreen.drawImage(canvas,0,0);render(true);
  }
  function renderFields(){
    const host=$('textFields');
    for(const [id,name] of definitions){if(id==='logo')continue;
      const label=document.createElement('label');label.htmlFor=`field-${id}`;label.textContent=name;
      const input=document.createElement('input');input.id=`field-${id}`;input.type='text';input.value=state.layers[id].text;
      input.addEventListener('input',()=>{state.layers[id].text=input.value;render()});
      host.append(label,input);
    }
    const select=$('layer');
    for(const [id,name] of definitions){const option=document.createElement('option');option.value=id;option.textContent=name;select.append(option)}
    select.value=state.selected;updateLayerControls();
  }
  function updateLayerControls(){
    const layer=state.layers[state.selected],range=$('layerSize');
    $('layer').value=state.selected;range.min=layer.min||40;range.max=layer.max||330;range.value=layer.size;
    $('layerSizeValue').textContent=`${layer.size} px`;
    $('layerVisible').checked=layer.visible;
  }
  function pointerPosition(event){const r=canvas.getBoundingClientRect();return{x:(event.clientX-r.left)*W/r.width,y:(event.clientY-r.top)*H/r.height}}
  canvas.addEventListener('pointerdown',event=>{
    const p=pointerPosition(event),hit=[...hitBoxes].reverse().find(b=>p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h);
    if(hit){state.selected=hit.id;updateLayerControls();drag={kind:'layer',id:hit.id,x:p.x,y:p.y,startX:state.layers[hit.id].x,startY:state.layers[hit.id].y}}
    else if(p.x>=imageBox.x&&p.y<=imageBox.h){drag={kind:'photo',x:p.x,y:p.y,startX:state.photoX,startY:state.photoY}}
    if(drag){canvas.setPointerCapture(event.pointerId);render()}
  });
  canvas.addEventListener('pointermove',event=>{
    if(!drag)return;const p=pointerPosition(event),dx=p.x-drag.x,dy=p.y-drag.y;
    if(drag.kind==='layer'){state.layers[drag.id].x=Math.max(0,Math.min(W-25,drag.startX+dx));state.layers[drag.id].y=Math.max(0,Math.min(H-25,drag.startY+dy))}
    else{state.photoX=drag.startX+dx;state.photoY=drag.startY+dy}render();
  });
  for(const type of ['pointerup','pointercancel'])canvas.addEventListener(type,()=>{drag=null});
  $('layer').onchange=e=>{state.selected=e.target.value;updateLayerControls();render()};
  $('layerSize').oninput=e=>{state.layers[state.selected].size=Number(e.target.value);updateLayerControls();render()};
  $('layerVisible').onchange=e=>{state.layers[state.selected].visible=e.target.checked;render()};
  $('zoom').oninput=e=>{state.zoom=Number(e.target.value)/100;$('zoomValue').textContent=`${e.target.value} %`;render()};
  $('shade').oninput=e=>{state.shade=Number(e.target.value)/100;$('shadeValue').textContent=`${e.target.value} %`;render()};
  $('accent').oninput=e=>{state.accent=e.target.value;render()};
  $('paper').oninput=e=>{state.paper=e.target.value;render()};
  $('photoFile').onchange=async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{const source=window.CapraImage?await CapraImage.read(file,{maxDimension:2600,quality:.9}):await readAsDataUrl(file);
      state.photoX=state.photoY=0;state.zoom=1;$('zoom').value=100;$('zoomValue').textContent='100 %';loadPhoto(source);status('Oma kuva lisätty.')
    }catch{status('Kuvaa ei voitu avata. Kokeile JPG-, PNG- tai WebP-tiedostoa.')}finally{e.target.value=''}
  };
  function readAsDataUrl(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)})}
  $('defaultPhoto').onclick=()=>{state.photoX=state.photoY=0;state.zoom=1;$('zoom').value=100;$('zoomValue').textContent='100 %';loadPhoto(defaultPhoto);status('Esimerkkikuva palautettu.')};
  $('resetLayout').onclick=()=>{const original=fresh();for(const id of Object.keys(original)){state.layers[id].x=original[id].x;state.layers[id].y=original[id].y;state.layers[id].size=original[id].size;state.layers[id].visible=true}updateLayerControls();render();status('Elementtien paikat palautettu.')};
  function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
  $('downloadPng').onclick=()=>{if(!photo.complete||!photo.naturalWidth||!logo.complete||!logo.naturalWidth){status('Odota, että kuva ja logo latautuvat.');return}const out=document.createElement('canvas');out.width=W;out.height=H;drawToOffscreen(out.getContext('2d'));out.toBlob(blob=>{if(blob){download(blob,'capra-peruskurssin-arvonta.png');status('PNG ladattu.')}else status('PNG-vienti epäonnistui.')},'image/png')};
  $('saveProject').onclick=()=>{const data={version:1,layers:state.layers,photoSrc:state.photoSrc,photoX:state.photoX,photoY:state.photoY,zoom:state.zoom,shade:state.shade,accent:state.accent,paper:state.paper};download(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),'capra-arvonta-projekti.json');status('Muokattava projekti ladattu.')};
  $('projectFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());if(data.version!==1||!data.layers)throw Error('version');for(const id of Object.keys(state.layers)){const incoming=data.layers[id];if(!incoming)continue;state.layers[id].text=String(incoming.text??state.layers[id].text);state.layers[id].x=Number(incoming.x)||0;state.layers[id].y=Number(incoming.y)||0;state.layers[id].size=Number(incoming.size)||state.layers[id].size;state.layers[id].visible=incoming.visible!==false}state.photoX=Number(data.photoX)||0;state.photoY=Number(data.photoY)||0;state.zoom=Number(data.zoom)||1;state.shade=Number(data.shade)||0;state.accent=data.accent||state.accent;state.paper=data.paper||state.paper;for(const id of textIds)$(`field-${id}`).value=state.layers[id].text;$('zoom').value=Math.round(state.zoom*100);$('zoomValue').textContent=`${$('zoom').value} %`;$('shade').value=Math.round(state.shade*100);$('shadeValue').textContent=`${$('shade').value} %`;$('accent').value=state.accent;$('paper').value=state.paper;updateLayerControls();loadPhoto(data.photoSrc||defaultPhoto);status('Projekti avattu.')}
    catch{status('Projektitiedostoa ei voitu avata.')}finally{e.target.value=''}};
  logo.onload=render;renderFields();loadPhoto(defaultPhoto);document.fonts.ready.then(render);
})();

