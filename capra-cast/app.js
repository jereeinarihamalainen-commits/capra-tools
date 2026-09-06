const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const poster=$('#poster'), photo=$('#photoImg'), photoBg=$('#photoBgImg'), placeholder=$('#placeholder'), mark=$('#mark');

const FORMAT_SIZES={youtube:{w:1280,h:720},instagram:{w:1080,h:1350},reels:{w:1080,h:1920},tiktok:{w:1080,h:1920}};
const POS_DEFAULTS={
  youtube:{brand:{x:4.5,y:6,s:100},episodeLabel:{x:4.6,y:18,s:100},hook:{x:4.5,y:48,s:100},guest:{x:4.7,y:83,s:100},topics:{x:73,y:94,s:100},signature:{x:4.7,y:94,s:100}},
  instagram:{brand:{x:5.5,y:4.5,s:100},episodeLabel:{x:5.7,y:14,s:100},hook:{x:5.5,y:58,s:100},guest:{x:5.8,y:85,s:100},topics:{x:68,y:95,s:100},signature:{x:5.8,y:95,s:100}},
  reels:{brand:{x:6,y:5,s:100},episodeLabel:{x:6.2,y:14,s:100},hook:{x:5.8,y:60,s:100},guest:{x:6,y:84,s:100},topics:{x:6,y:93,s:100},signature:{x:6,y:96,s:100}},
  tiktok:{brand:{x:6,y:5,s:100},episodeLabel:{x:6.2,y:14,s:100},hook:{x:5.8,y:57,s:96},guest:{x:6,y:82,s:100},topics:{x:6,y:91,s:100},signature:{x:6,y:95,s:100}}
};

const defaults={format:'youtube',headline:'ONKO PENKKIPUNNERRUS\nKAMPPAILIJAN\nTÄRKEIN LIIKE?',accent:'',guestName:'KALLE MÄENHARJU',guestRole:'LIIKUNTALÄÄKETIETEEN KANDIDAATTI',episode:'1',topics:'URHEILU · TERVEYS · SUORITUSKYKY',fitMode:'contain',blurBg:true,posX:50,posY:50,zoom:100,brightness:82,contrast:112,grayscale:8,markOpacity:7,markScale:110,markX:0,markY:0,selectedElement:'hook',positions:structuredClone(POS_DEFAULTS),photoData:''};
let persisted={};try{persisted=JSON.parse(localStorage.getItem('capraCastStateV2')||'{}')}catch(e){}
let state={...defaults,...persisted,photoData:'',positions:mergePositions(persisted.positions)};
if(!FORMAT_SIZES[state.format])state.format='youtube';

function mergePositions(saved){const out=structuredClone(POS_DEFAULTS);if(!saved)return out;for(const f of Object.keys(out))for(const k of Object.keys(out[f]))if(saved[f]&&saved[f][k])out[f][k]={...out[f][k],...saved[f][k]};return out}
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function highlight(text,term){let safe=esc(text).replace(/\n/g,'<br>');if(!term)return safe;const t=esc(term);try{return safe.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'ig'),m=>`<span class="accent">${m}</span>`)}catch(e){return safe}}
function save(){const clean={...state};delete clean.photoData;try{localStorage.setItem('capraCastStateV2',JSON.stringify(clean))}catch(e){}}
function applyFormatSize(el,format){const z=FORMAT_SIZES[format]||FORMAT_SIZES.youtube;el.dataset.format=format;el.style.width=z.w+'px';el.style.height=z.h+'px';el.style.minWidth=z.w+'px';el.style.minHeight=z.h+'px';el.style.maxWidth='none';el.style.maxHeight='none'}

function render(){
  applyFormatSize(poster,state.format);poster.className='poster editing';if($('#safeToggle').checked)poster.classList.add('show-safe');
  $('#headlineOut').innerHTML=highlight(state.headline,state.accent);$('#guestNameOut').textContent=state.guestName;$('#guestRoleOut').textContent=state.guestRole;$('#epOut').textContent=state.episode;$('#topicsOut').textContent=state.topics;
  photo.src=state.photoData||'';photoBg.src=state.photoData||'';placeholder.style.display=state.photoData?'none':'grid';photo.style.objectFit=state.fitMode;photo.style.objectPosition=`${state.posX}% ${state.posY}%`;photo.style.transform=`scale(${state.zoom/100})`;photo.style.filter=`brightness(${state.brightness}%) contrast(${state.contrast}%) grayscale(${state.grayscale}%)`;photoBg.parentElement.style.display=state.photoData&&state.blurBg?'block':'none';
  mark.style.opacity=state.markOpacity/100;mark.style.transform=`translate(${state.markX}%,${state.markY}%) scale(${state.markScale/100})`;
  applyPositions();syncControls();fit();save();
}
function applyPositions(){const p=state.positions[state.format];$$('.drag-item').forEach(el=>{const q=p[el.dataset.key];if(!q)return;el.style.left=q.x+'%';el.style.top=q.y+'%';el.style.right='auto';el.style.bottom='auto';el.style.transform=`scale(${q.s/100})`;el.classList.toggle('selected',el.dataset.key===state.selectedElement)})}
function syncControls(){
  const textIds=['headline','accent','guestName','guestRole','episode','topics'];textIds.forEach(k=>{if(document.activeElement!==$('#'+k))$('#'+k).value=state[k]});
  $('#fitMode').value=state.fitMode;$('#blurBg').checked=!!state.blurBg;$('#selectedElement').value=state.selectedElement;
  ['posX','posY','zoom','brightness','contrast','grayscale','markOpacity','markScale','markX','markY'].forEach(k=>{if($('#'+k))$('#'+k).value=state[k]});
  $$('.format-btn').forEach(b=>b.classList.toggle('active',b.dataset.format===state.format));
  const q=state.positions[state.format][state.selectedElement];if(q){$('#textX').value=q.x;$('#textY').value=q.y;$('#textScale').value=q.s}
  updateRangeOutputs();
}
function updateRangeOutputs(){$$('.range-row').forEach(r=>{const i=r.querySelector('input'),o=r.querySelector('output');if(!i||!o)return;let v=i.value;if(['zoom','brightness','contrast','grayscale','markOpacity','markScale','textX','textY','textScale'].includes(i.id))v+='%';o.textContent=v})}
function fit(){const stage=$('.stage-wrap'),shell=$('.preview-shell'),z=FORMAT_SIZES[state.format];const pad=window.innerWidth<880?16:52;const availW=Math.max(260,stage.clientWidth-pad);const availH=window.innerWidth<880?Math.min(window.innerHeight*.72,800):Math.max(340,window.innerHeight-pad);const s=Math.min(availW/z.w,availH/z.h,1);$('#scale').style.width=z.w+'px';$('#scale').style.height=z.h+'px';$('#scale').style.transform=`scale(${s})`;shell.style.width=z.w*s+'px';shell.style.height=z.h*s+'px'}

$$('.format-btn').forEach(b=>b.onclick=()=>{state.format=b.dataset.format;render()});
['headline','accent','guestName','guestRole','episode','topics'].forEach(k=>$('#'+k).addEventListener('input',e=>{state[k]=e.target.value;render()}));
['posX','posY','zoom','brightness','contrast','grayscale','markOpacity','markScale','markX','markY'].forEach(k=>$('#'+k).addEventListener('input',e=>{state[k]=+e.target.value;render()}));
$('#fitMode').addEventListener('change',e=>{state.fitMode=e.target.value;render()});$('#blurBg').addEventListener('change',e=>{state.blurBg=e.target.checked;render()});$('#safeToggle').addEventListener('change',render);
$('#selectedElement').addEventListener('change',e=>{state.selectedElement=e.target.value;render()});
['textX','textY','textScale'].forEach(id=>$('#'+id).addEventListener('input',e=>{const q=state.positions[state.format][state.selectedElement];if(id==='textX')q.x=+e.target.value;if(id==='textY')q.y=+e.target.value;if(id==='textScale')q.s=+e.target.value;render()}));
$('#resetPositions').onclick=()=>{state.positions[state.format]=structuredClone(POS_DEFAULTS[state.format]);render()};
function loadImageFile(file){if(!file)return;const r=new FileReader();r.onload=()=>{state.photoData=r.result;render()};r.readAsDataURL(file)}$('#photoInput').addEventListener('change',e=>loadImageFile(e.target.files[0]));
$('#reset').onclick=()=>{const keepPhoto=state.photoData;state={...defaults,photoData:keepPhoto,positions:structuredClone(POS_DEFAULTS)};render()};

let drag=null;
$$('.drag-item').forEach(el=>el.addEventListener('pointerdown',e=>{
  e.preventDefault();const key=el.dataset.key;state.selectedElement=key;const rect=poster.getBoundingClientRect();const q=state.positions[state.format][key];const px=(e.clientX-rect.left)/rect.width*100,py=(e.clientY-rect.top)/rect.height*100;drag={id:e.pointerId,key,dx:px-q.x,dy:py-q.y};el.setPointerCapture?.(e.pointerId);render();
}));
poster.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;e.preventDefault();const rect=poster.getBoundingClientRect();const q=state.positions[state.format][drag.key];q.x=Math.max(0,Math.min(96,(e.clientX-rect.left)/rect.width*100-drag.dx));q.y=Math.max(0,Math.min(96,(e.clientY-rect.top)/rect.height*100-drag.dy));applyPositions();syncControls();save()});
function endDrag(e){if(drag&&(!e||e.pointerId===drag.id)){drag=null;save()}}poster.addEventListener('pointerup',endDrag);poster.addEventListener('pointercancel',endDrag);

function waitFrame(){return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}async function waitForImages(root){const imgs=[...root.querySelectorAll('img')].filter(i=>i.src&&!i.hidden);await Promise.all(imgs.map(i=>i.complete&&i.naturalWidth?i.decode?.().catch(()=>{})||Promise.resolve():new Promise(r=>{i.onload=i.onerror=r;setTimeout(r,1600)})))}
async function capture(format=state.format){const z=FORMAT_SIZES[format],prev=state.format,safe=$('#safeToggle').checked;state.format=format;$('#safeToggle').checked=false;render();if(document.fonts?.ready)await document.fonts.ready;await waitFrame();const clone=poster.cloneNode(true);clone.classList.remove('editing','show-safe');clone.querySelectorAll('.selected').forEach(e=>e.classList.remove('selected'));applyFormatSize(clone,format);clone.style.position='absolute';clone.style.left='-20000px';clone.style.top='0';clone.style.transform='none';clone.style.boxShadow='none';document.body.appendChild(clone);try{await waitForImages(clone);await waitFrame();return await html2canvas(clone,{backgroundColor:'#080907',scale:1,useCORS:true,logging:false,width:z.w,height:z.h,windowWidth:z.w,windowHeight:z.h,scrollX:0,scrollY:0})}finally{clone.remove();state.format=prev;$('#safeToggle').checked=safe;render()}}
function canvasBlob(c){return new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error('PNG-luonti epäonnistui')),'image/png',1))}function dlBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1200)}
$('#download').onclick=async()=>{const b=$('#download');b.disabled=true;b.textContent='Viedään…';try{dlBlob(await canvasBlob(await capture(state.format)),`capra-cast-${state.format}-${state.episode}.png`)}catch(e){alert('Vienti epäonnistui: '+e.message)}finally{b.disabled=false;b.textContent='Tallenna PNG'}};
$('#downloadAll').onclick=async()=>{const b=$('#downloadAll');b.disabled=true;try{const zip=new JSZip();for(const f of Object.keys(FORMAT_SIZES)){b.textContent='Viedään '+f+'…';zip.file(`capra-cast-${f}-${state.episode}.png`,await canvasBlob(await capture(f)))}dlBlob(await zip.generateAsync({type:'blob'}),`capra-cast-${state.episode}-kaikki-koot.zip`)}catch(e){alert('ZIP-vienti epäonnistui: '+e.message)}finally{b.disabled=false;b.textContent='Vie kaikki 4 kokoa ZIP'}};
window.addEventListener('resize',fit);render();