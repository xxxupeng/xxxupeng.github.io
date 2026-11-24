'use strict';
const $=s=>document.querySelector(s), byId=new Map(scenes.map(s=>[s.id,s])), reduced=matchMedia('(prefers-reduced-motion: reduce)');
const cloudIds=new Set(sceneSections.reconstruction), sections=[...document.querySelectorAll('.study')];
const labels=[[],['Stereo RGB','Matched disparity','Native disparity'],['All methods','FantasyWorld · StereoCrafter','FantasyWorld · Interleaved','LingBot-World v2 · StereoCrafter','LingBot-World v2 · Interleaved','StereoWorld','Bi-World (Ours)']];
const state=[0,2,0], players=new Set(), dialog=$('#viewer'), full=$('#movie');let moving=!reduced.matches, eyeMode=0;
const el=(tag,cls)=>Object.assign(document.createElement(tag),cls?{className:cls}:{});
function btn(text,fn){const b=el('button');b.type='button';b.textContent=text;b.onclick=fn;return b}
function choices(parent,name,items,initial,choose){
 const group=el('div','optionRow'),label=el('small');group.setAttribute('role','group');group.setAttribute('aria-label',name);label.textContent=name;group.append(label);
 items.forEach((text,i)=>{const b=btn(text,()=>{for(const other of group.querySelectorAll('button'))other.setAttribute('aria-pressed',other===b);choose(i)});b.setAttribute('aria-pressed',i===initial);group.append(b)});

 if(name==='Compare'){
   const buttons=[...group.querySelectorAll('button')];
   for(const indices of [[0,6,5],[1,2,3,4]]){
     const line=el('div','methodLine');indices.forEach(i=>line.append(buttons[i]));group.append(line);
   }
 }
 parent.append(group);
}
function view(c){
 if(c<0)return [1980,250,512,384,0,4.9];
 if(c===0)return [0,140,1930,1190,0,8.89];
 if(c===1){let x=eyeMode===2?1400:875;return [x,188+state[1]*405,eyeMode===0?1037:512,384,0,4.88]}
 const m=state[2]-1;
 return m<0?[0,112,2560,1254,0,6.49]:[36+m%2*1260,171+Math.floor(m/2)*408,1234,365,0,6.49]
}
function slug(s){return s.id}
function sectionVideo(s,c){return asset('media/'+sections[c].id+'/'+s.id+'.mp4')}
function showFilm(s,c){
 const opening=c===-1;
 $('#sceneTitle').textContent=opening?'Bi-World':s.title+' · '+sections[c].querySelector('h2').textContent;
 $('#screen').classList.toggle('openingView',opening);
 $('#caption').textContent='';dialog.showModal();sync();full.src=opening?asset('media/opening.mp4'):sectionVideo(s,c);full.play().catch(()=>{});
 history.replaceState(null,'',opening?'#opening':'#film='+slug(s)+'&section='+sections[c].id)
}
$('#openHero').onclick=()=>showFilm(null,-1);$('#close').onclick=()=>dialog.close();
dialog.addEventListener('close',()=>{full.pause();full.removeAttribute('src');full.load();$('#caption').textContent='';history.replaceState(null,'',location.href.split('#')[0]);sync()});
full.onerror=()=>{if(!dialog.open)return;const a=el('a');a.href=full.src;a.textContent='Open the original film';$('#caption').replaceChildren('This browser could not decode the film. ',a)};
let observer=new IntersectionObserver(entries=>{for(const entry of entries){const p=entry.target.player;p.visible=entry.isIntersecting;update(p)}},{threshold:0.02});
function update(p,reset=false){
 const [x,y,w,h,start,end]=view(p.c), active=p.visible&&moving&&!overlayOpen()&&!document.hidden&&!p.tile.hidden;
 const f='preview-'+p.c+'-'+p.s.id+(active&&p.fallback?'.webp':'.jpg');
 if(p.visible)p.img.loading='eager';
 const url=asset('images/'+f);if(p.img.getAttribute('src')!==url)p.img.src=url;
 p.box.style.aspectRatio=w+'/'+h;
 function crop(node){Object.assign(node.style,{width:(256000/w)+'%',left:(-100*x/w)+'%',top:(-100*y/h)+'%'})}
 crop(p.video);if(p.c>=0)crop(p.img);else Object.assign(p.img.style,{width:'100%',left:'0',top:'0'});
 p.start=start;p.end=end;
 if(!active){p.video.pause();if(!p.visible&&p.video.hasAttribute('src')){p.video.removeAttribute('src');p.video.load();p.video.hidden=true}return}
 if(p.fallback)return;
 if(!p.video.hasAttribute('src')){p.video.hidden=true;p.video.src=sectionVideo(p.s,p.c);p.video.load();return}
 if(p.video.readyState>=1){if(reset||p.video.currentTime<start||p.video.currentTime>=end)p.video.currentTime=start;p.video.play().catch(()=>{})}
}
function sync(){players.forEach(p=>update(p))}
function overlayOpen(){return dialog.open||$('#cloudDialog').open}
document.addEventListener('cloudvisibility',sync);
function refresh(c,reset){for(const p of players)if(p.c===c)update(p,reset)}
function tile(s,c,host){
 const b=el('button','tile'),box=el('span','previewBox'),v=el('video'),img=new Image(),title=el('strong');
 title.textContent=s.title;img.alt='';img.loading='lazy';v.muted=true;v.defaultMuted=true;v.playsInline=true;v.preload='none';v.hidden=true;v.setAttribute('aria-hidden','true');
 b.setAttribute('aria-label',sections[c].querySelector('h2').textContent+': '+s.title);b.onclick=()=>showFilm(s,c);
 box.append(img,v);b.append(box,title);
 if(c===0&&cloudIds.has(s.id)){const block=el('div','cloudCard'),explore=btn('Explore in 3D',()=>openCloud(s.id,s.title));
   explore.className='exploreCloud';explore.setAttribute('aria-label','Explore in 3D: '+s.title);explore.setAttribute('aria-haspopup','dialog');block.append(b,explore);host.append(block);
 }else host.append(b);
 const p={tile:b,box,video:v,img,s,c,visible:false,fallback:false};players.add(p);b.player=p;
 v.onloadedmetadata=()=>{if(p.visible&&moving&&!overlayOpen()){v.currentTime=p.start;v.play().catch(()=>{})}};
 v.onplaying=()=>{v.hidden=false};
 v.onseeked=()=>{if(p.visible&&moving&&!overlayOpen()&&!p.fallback)v.play().catch(()=>{})};
 const bound=()=>{if(!v.paused&&v.currentTime>=p.end)v.currentTime=p.start};
 v.ontimeupdate=bound;v.onended=()=>{if(p.visible&&moving&&!overlayOpen()){v.currentTime=p.start;v.play().catch(()=>{})}};
 v.onerror=()=>{if(!v.hasAttribute('src'))return;p.fallback=true;v.hidden=true;v.removeAttribute('src');v.load();update(p)};
 update(p);observer.observe(b);
}
sections.forEach((section,c)=>{
 const bar=section.querySelector('.choices');
 if(c!==0)choices(bar,c===2?'Compare':'View',labels[c],state[c],i=>{state[c]=i;refresh(c,false)});
 if(c===1)choices(bar,'Eyes',['Pair','Left','Right'],0,i=>{eyeMode=i;refresh(c,false)});
 if(!bar.childElementCount)bar.hidden=true;
 const rail=section.querySelector('.studies');rail.id='rail-'+c;
 const order=sceneSections[section.id].map(id=>byId.get(id));
 order.forEach(s=>tile(s,c,rail));

});
const intro=$('#introVideo'),introFallback=$('#introFallback');let introVisible=true,introFailed=false;
function introSync(){
 const active=introVisible&&moving&&!overlayOpen()&&!document.hidden;
 if(introFailed){intro.hidden=true;introFallback.hidden=!active;if(active&&!introFallback.hasAttribute('src'))introFallback.src=asset('images/opening.webp');return}
 if(active){if(!intro.hasAttribute('src'))intro.src=asset('media/opening.mp4');intro.play().catch(()=>{})}else intro.pause();
}
intro.onplaying=()=>intro.classList.add('ready');
intro.onerror=()=>{introFailed=true;introSync()};
new IntersectionObserver(([e])=>{introVisible=e.isIntersecting;introSync()}).observe(intro);
reduced.addEventListener('change',()=>{moving=!reduced.matches;sync();introSync()});
document.addEventListener('cloudvisibility',introSync);document.addEventListener('visibilitychange',introSync);dialog.addEventListener('close',introSync);dialog.addEventListener('toggle',introSync);
document.addEventListener('visibilitychange',sync);
const params=new URLSearchParams(location.hash.slice(1)),initial=scenes.find(s=>slug(s)===params.get('film'));
if(location.hash==='#opening')showFilm(null,-1);
else if(initial){const c=sections.findIndex(sec=>(!params.has('section')||sec.id===params.get('section'))&&sceneSections[sec.id].includes(initial.id));if(c>=0)showFilm(initial,c)}
