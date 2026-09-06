const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const poster=$('#poster'), photo=$('#photoImg'), placeholder=$('#placeholder'), mark=$('#mark'), fallbackMark=$('#fallbackMark'), customMark=$('#customMark');

const FORMAT_SIZES={
  youtube:{w:1280,h:720},
  instagram:{w:1080,h:1350},
  reels:{w:1080,h:1920},
  tiktok:{w:1080,h:1920}
};

const defaults={format:'youtube',layout:'editorial',headline:'MITÄ LAADUKAS\nHARJOITTELU\nOIKEASTI VAATII?',accent:'HARJOITTELU',guestName:'KALLE MÄENHARJU',guestRole:'LIIKUNTALÄÄKETIETEEN KANDIDAATTI',episode:'01',topics:'URHEILU · TERVEYS · SUORITUSKYKY',posX:68,posY:50,zoom:112,brightness:82,contrast:118,grayscale:18,warmth:7,markOpacity:9,markScale:110,markX:0,markY:0,photoData:'',markData:''};
let persisted={};
try{persisted=JSON.parse(localStorage.getItem('capraCastState')||'{}')}catch(e){}
let state={...defaults,...persisted,photoData:'',markData:''};
if(!FORMAT_SIZES[state.format]) state.format='youtube';

function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function highlight(text,term){let safe=esc(text).replace(/\n/g,'<br>');if(!term)return safe;const t=esc(term);try{return safe.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'ig'),m=>`<span class="accent">${m}</span>`)}catch(e){return safe}}
function save(){const clean={...state};delete clean.photoData;delete clean.markData;try{localStorage.setItem('capraCastState',JSON.stringify(clean))}catch(e){}}
function syncInputs(){['headline','accent','guestName','guestRole','episode','topics'].forEach(k=>$('#'+k).value=state[k]);['posX','posY','zoom','brightness','contrast','grayscale','warmth','markOpacity','markScale','markX','markY'].forEach(k=>$('#'+k).value=state[k]);$$('.format-btn').forEach(b=>b.classList.toggle('active',b.dataset.format===state.format));$$('.layout-btn').forEach(b=>b.classList.toggle('active',b.dataset.layout===state.layout))}

function applyFormatSize(el,format){
  const size=FORMAT_SIZES[format]||FORMAT_SIZES.youtube;
  el.dataset.format=format;
  el.style.width=size.w+'px';
  el.style.height=size.h+'px';
  el.style.minWidth=size.w+'px';
  el.style.minHeight=size.h+'px';
  el.style.maxWidth='none';
  el.style.maxHeight='none';
}

function render(){
  applyFormatSize(poster,state.format);
  poster.className=`poster layout-${state.layout}`;
  if($('#safeToggle').checked)poster.classList.add('show-safe');
  $('#headlineOut').innerHTML=highlight(state.headline,state.accent);
  $('#guestNameOut').textContent=state.guestName;
  $('#guestRoleOut').textContent=state.guestRole;
  $('#epOut').textContent=String(state.episode).padStart(2,'0');
  $('#topicsOut').textContent=state.topics;
  photo.src=state.photoData||'';
  placeholder.style.display=state.photoData?'none':'grid';
  photo.style.objectPosition=`${state.posX}% ${state.posY}%`;
  photo.style.transform=`scale(${state.zoom/100})`;
  photo.style.filter=`brightness(${state.brightness}%) contrast(${state.contrast}%) grayscale(${state.grayscale}%) sepia(${state.warmth}%)`;
  mark.style.opacity=state.markOpacity/100;
  mark.style.transform=`translate(${state.markX}%,${state.markY}%) scale(${state.markScale/100})`;
  if(state.markData){customMark.src=state.markData;customMark.hidden=false;fallbackMark.style.display='none'}else{customMark.hidden=true;fallbackMark.style.display='block'}
  updateRangeOutputs();
  syncInputs();
  fit();
  save();
}
function updateRangeOutputs(){$$('.range-row').forEach(r=>{const i=r.querySelector('input'),o=r.querySelector('output');if(!i||!o)return;let v=i.value;if(['zoom','brightness','contrast','grayscale','warmth','markOpacity','markScale'].includes(i.id))v+='%';o.value=v;o.textContent=v})}
function fit(){
  const stage=$('.stage-wrap'), shell=$('.preview-shell');if(!stage||!poster)return;
  const size=FORMAT_SIZES[state.format]||FORMAT_SIZES.youtube;
  const pad=window.innerWidth<880?16:52;
  const availW=Math.max(260,stage.clientWidth-pad);
  const availH=window.innerWidth<880?Math.min(window.innerHeight*.68,760):Math.max(340,window.innerHeight-pad);
  const s=Math.min(availW/size.w,availH/size.h,1);
  $('#scale').style.width=size.w+'px';
  $('#scale').style.height=size.h+'px';
  $('#scale').style.transform=`scale(${s})`;
  shell.style.width=(size.w*s)+'px';
  shell.style.height=(size.h*s)+'px';
}

$$('.format-btn').forEach(b=>b.onclick=()=>{state.format=b.dataset.format;render()});
$$('.layout-btn').forEach(b=>b.onclick=()=>{state.layout=b.dataset.layout;render()});
['headline','accent','guestName','guestRole','episode','topics'].forEach(k=>$('#'+k).addEventListener('input',e=>{state[k]=e.target.value;render()}));
['posX','posY','zoom','brightness','contrast','grayscale','warmth','markOpacity','markScale','markX','markY'].forEach(k=>$('#'+k).addEventListener('input',e=>{state[k]=+e.target.value;render()}));
$('#safeToggle').addEventListener('change',render);
function loadImageFile(file,key){if(!file)return;const r=new FileReader();r.onload=()=>{state[key]=r.result;render()};r.readAsDataURL(file)}
$('#photoInput').addEventListener('change',e=>loadImageFile(e.target.files[0],'photoData'));
$('#markInput').addEventListener('change',e=>loadImageFile(e.target.files[0],'markData'));
$$('.preset-btn').forEach(b=>b.onclick=()=>{if(b.dataset.preset==='core')Object.assign(state,{brightness:82,contrast:118,grayscale:18,warmth:7});if(b.dataset.preset==='bw')Object.assign(state,{brightness:84,contrast:128,grayscale:100,warmth:0});if(b.dataset.preset==='warm')Object.assign(state,{brightness:88,contrast:116,grayscale:8,warmth:18});render()});
$('#reset').onclick=()=>{state={...defaults,photoData:state.photoData,markData:state.markData};render()};

function waitFrame(){return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))}
async function waitForImages(root){
  const images=[...root.querySelectorAll('img')].filter(img=>img.src&&!img.hidden);
  await Promise.all(images.map(img=>{
    if(img.complete&&img.naturalWidth>0){if(typeof img.decode==='function')return img.decode().catch(()=>{});return Promise.resolve();}
    return new Promise(resolve=>{const done=()=>resolve();img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});setTimeout(done,1800)});
  }));
}

async function capture(format=state.format){
  const size=FORMAT_SIZES[format]||FORMAT_SIZES.youtube;
  const prevFormat=state.format;
  const safeWas=$('#safeToggle').checked;
  state.format=format;
  $('#safeToggle').checked=false;
  render();
  if(document.fonts&&document.fonts.ready)await document.fonts.ready;
  await waitFrame();

  const clone=poster.cloneNode(true);
  clone.classList.remove('show-safe');
  applyFormatSize(clone,format);
  clone.style.position='absolute';
  clone.style.left='0';
  clone.style.top='0';
  clone.style.margin='0';
  clone.style.transform='none';
  clone.style.boxShadow='none';
  clone.style.zIndex='-99999';
  clone.style.pointerEvents='none';
  clone.style.opacity='1';
  clone.setAttribute('aria-hidden','true');
  document.body.appendChild(clone);

  try{
    await waitForImages(clone);
    await waitFrame();
    const canvas=await html2canvas(clone,{
      backgroundColor:'#10110e',
      scale:1,
      useCORS:true,
      allowTaint:false,
      logging:false,
      width:size.w,
      height:size.h,
      windowWidth:size.w,
      windowHeight:size.h,
      scrollX:0,
      scrollY:0
    });
    if(canvas.width!==size.w||canvas.height!==size.h)throw new Error(`Väärä vientikoko ${canvas.width}x${canvas.height}`);
    return canvas;
  }finally{
    clone.remove();
    state.format=prevFormat;
    $('#safeToggle').checked=safeWas;
    render();
  }
}
function canvasBlob(canvas,type='image/png',quality=1){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG-luonti epäonnistui')),type,quality))}
function dlBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1200)}
$('#download').onclick=async()=>{const b=$('#download');b.disabled=true;b.textContent='Viedään…';try{const c=await capture(state.format),blob=await canvasBlob(c);dlBlob(blob,`capra-cast-${state.format}-${state.episode}.png`)}catch(e){console.error(e);alert('Vienti epäonnistui: '+(e.message||'päivitä sivu ja kokeile uudelleen.'))}finally{b.disabled=false;b.textContent='Tallenna PNG'}};
$('#downloadAll').onclick=async()=>{const b=$('#downloadAll');b.disabled=true;b.textContent='Rakennetaan ZIP…';try{const zip=new JSZip();for(const f of ['youtube','instagram','reels','tiktok']){b.textContent=`Viedään ${f}…`;const c=await capture(f),blob=await canvasBlob(c);zip.file(`capra-cast-${f}-${state.episode}.png`,blob)}const out=await zip.generateAsync({type:'blob'});dlBlob(out,`capra-cast-${state.episode}-kaikki-koot.zip`)}catch(e){console.error(e);alert('ZIP-vienti epäonnistui: '+(e.message||'vie koot yksittäin.'))}finally{b.disabled=false;b.textContent='Vie kaikki 4 kokoa ZIP'}};

window.addEventListener('resize',fit);
render();