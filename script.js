(function(){
  'use strict';
  const data = window.DOR_SITE;
  const soundGrid = document.getElementById('soundGrid');
  const bassGrid = document.getElementById('bassGrid');
  const dialog = document.getElementById('workDialog');
  const dialogImage = document.getElementById('dialogImage');
  const dialogTitle = document.getElementById('dialogTitle');
  const dialogDescription = document.getElementById('dialogDescription');
  const dialogRole = document.getElementById('dialogRole');
  const dialogNote = document.getElementById('dialogNote');
  let activeTrack=null;
  let priorFocus;
  let motion;
  let closing=false;
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

  function el(tag, className, content){
    const node=document.createElement(tag);
    if(className) node.className=className;
    if(content!==undefined) node.textContent=content;
    return node;
  }
  const platforms = {
    youtube: 'YouTube', spotify: 'Spotify', appleMusic: 'Apple Music',
    soundcloud: 'SoundCloud', bandcamp: 'Bandcamp', tidal: 'TIDAL'
  };
  function safeLink(value){
    try { const u=new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : null; }
    catch { return null; }
  }
  function iconLink(key,label,url,className){
    const href=safeLink(url);
    const node=el(href?'a':'button',className);
    if(href){ node.href=href; node.target='_blank'; node.rel='noopener noreferrer'; }
    else { node.type='button'; node.disabled=true; }
    node.setAttribute('aria-label',href?label:label+' — link coming soon');
    node.title=href?label:label+' — link coming soon';
    const icon=el('img'); icon.src='assets/icons/'+key+'.svg'; icon.alt='';
    icon.setAttribute('aria-hidden','true'); node.append(icon);
    return node;
  }
  function platformLinks(item){
    const wrapper=el('div','release-platforms');
    const links=el('div','platform-links');
    links.setAttribute('role','group');
    links.setAttribute('aria-label','Listen to '+item.title);
    const available=Object.entries(platforms).filter(([key])=>safeLink(item.platforms?.[key]));
    const entries=available.length?available:[['youtube','YouTube'],['spotify','Spotify'],['appleMusic','Apple Music']];
    entries.forEach(([key,name])=>links.append(iconLink(key,'Listen on '+name,item.platforms?.[key],'platform-link')));
    wrapper.append(links);
    if(!available.length)wrapper.append(el('p','platform-pending','Listening links coming soon.'));
    return wrapper;
  }
  function card(item, index, type){
    if(type==='bass')return track(item,index);
    const article=el('article','work-card');
    const button=el('button','media-button');
    button.type='button';
    button.setAttribute('aria-label',`Play ${item.title}`);
    button.setAttribute('aria-haspopup','dialog');
    const frame=el('div','media-frame');
    const image=el('img');image.src=item.image;image.alt=item.video?item.title+' — video still':'Concept artwork — replace with real project image';image.loading='eager';
    const play=el('span','media-play',type==='sound'?'▶':'↗');play.setAttribute('aria-hidden','true');
    image.className='thumbnail-primary';
    frame.append(image);
    if(item.hoverImage){
      frame.classList.add('has-alternate');
      const alternate=el('img','thumbnail-secondary');alternate.src=item.hoverImage;alternate.alt='';alternate.setAttribute('aria-hidden','true');
      frame.append(alternate);
    }
    frame.append(play);button.append(frame);
    button.addEventListener('click',()=>openWork(item,type,button));
    const info=el('div','work-card-info');
    const titles=el('div');titles.append(el('h3','',item.title),el('p','',type==='sound'?item.category:`${item.artist} · ${item.role}`));
    info.append(titles,el('span','index',String(index+1).padStart(2,'0')));
    article.append(button,info);
    if(type==='bass')article.append(platformLinks(item));
    return article;
  }
  function track(item,index){
    const row=el('article','track-row');
    const number=el('span','track-number',String(index+1).padStart(2,'0'));
    number.setAttribute('aria-hidden','true');
    const button=el('button','track-main');
    button.type='button';
    button.setAttribute('aria-label','Play '+item.title);
    button.setAttribute('aria-expanded','false');
    button.setAttribute('aria-controls','track-player-'+index);
    const art=el('span','track-art');
    const image=el('img'); image.src=item.image; image.alt='';
    const indicator=el('span','track-open','▶');indicator.setAttribute('aria-hidden','true');
    art.append(image,indicator);
    const copy=el('span','track-copy');
    copy.append(el('span','track-title',item.title),el('span','track-artist',item.artist));
    button.append(art,copy);
    const playerBox=el('div','track-player');playerBox.id='track-player-'+index;playerBox.hidden=true;
    let selectedPlatform=null;
    function playTrack(key){
      if(activeTrack?.button===button && selectedPlatform===key){stopTrack();return;}
      stopTrack();
      selectedPlatform=key;
      playerBox.hidden=false;button.setAttribute('aria-expanded','true');
      button.setAttribute('aria-label','Stop '+item.title);indicator.textContent='■';
      const session={button,playerBox,indicator,title:item.title,cleanup:null};
      activeTrack=session;
      const note=el('p','track-player-note');note.setAttribute('role','status');
      const mount=el('div','track-player-mount');
      const external=el('a','track-external');external.target='_blank';external.rel='noopener';
      const youtubeLink=el('a','track-external youtube-direct','Watch on YouTube ↗');
      youtubeLink.target='_blank';youtubeLink.rel='noopener';youtubeLink.hidden=true;
      if(item.platforms.youtube)youtubeLink.href=item.platforms.youtube;
      function loadPlatform(platform,fallbackMessage=''){
        session.cleanup?.();session.cleanup=null;mount.replaceChildren();
        selectedPlatform=platform;
        choices.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.platform===platform)));
        const url=platformSource(item,platform);
        const player=embed(url,item.title,true);
        external.href=item.platforms[platform];external.textContent='Open in '+platforms[platform]+' ↗';
        youtubeLink.hidden=platform==='youtube'||!item.platforms.youtube;
        note.textContent=fallbackMessage;
        note.hidden=!note.textContent;
        if(player){
          mount.append(player);
          if(platform==='youtube'){
            youtubeAPI().then(YT=>{
              if(activeTrack!==session || !player.isConnected)return;
              const controller=new YT.Player(player,{events:{
                onReady:event=>{if(activeTrack===session)event.target.playVideo();},
                onError:event=>{
                  playerBox.dataset.youtubeError=String(event.data);
                  if(activeTrack!==session)return;
                  const fallback=item.platforms.spotify?'spotify':item.platforms.appleMusic?'appleMusic':null;
                  if(fallback)loadPlatform(fallback,'YouTube does not allow this video to play here. Try '+platforms[fallback]+' below.');
                  else{note.hidden=false;note.textContent='YouTube playback is unavailable here. Open the track on YouTube below.';}
                }
              }});
              session.cleanup=()=>controller.destroy();
            }).catch(()=>{if(activeTrack===session){note.hidden=false;note.textContent='If YouTube cannot play here, choose another platform or open it below.';}});
          }
        }else {note.hidden=false;note.textContent='Open this recording on '+platforms[platform]+' below.';}
      }
      if(key==='youtube' && location.protocol==='file:'){
        const fallback=item.platforms.spotify?'spotify':item.platforms.appleMusic?'appleMusic':null;
        if(fallback)loadPlatform(fallback,'Using '+platforms[fallback]+'. YouTube requires the web preview rather than opening this file directly.');
        else loadPlatform(key);
      }else loadPlatform(key);
      playerBox.append(mount,note,external,youtubeLink);
    }
    const choices=el('div','release-platforms');const group=el('div','platform-links');
    group.setAttribute('role','group');group.setAttribute('aria-label','Play '+item.title+' on');
    Object.entries(platforms).forEach(([key,name])=>{
      if(!safeLink(item.platforms?.[key]))return;
      if(key==='youtube' && (item.youtubeEmbed===false || location.protocol==='file:')){
        const link=iconLink(key,'Watch '+item.title+' on YouTube (opens in a new tab)',item.platforms[key],'platform-link');
        link.addEventListener('click',()=>stopTrack());group.append(link);return;
      }
      const choice=el('button','platform-link');choice.type='button';choice.dataset.platform=key;
      choice.setAttribute('aria-label','Play '+item.title+' on '+name);choice.setAttribute('aria-pressed','false');choice.title='Play on '+name;
      const icon=el('img');icon.src='assets/icons/'+key+'.svg';icon.alt='';choice.append(icon);
      choice.addEventListener('click',()=>playTrack(key));group.append(choice);
    });choices.append(group);
    button.addEventListener('click',()=>{
      if(activeTrack?.button===button){stopTrack();return;}
      playTrack(item.platforms?.youtube && item.youtubeEmbed!==false && location.protocol!=='file:'?'youtube':item.platforms?.spotify?'spotify':'appleMusic');
    });
    row.append(number,button,el('span','track-role',item.role),choices,playerBox);
    return row;
  }
  data.soundDesign.forEach((item,i)=>soundGrid.append(card(item,i,'sound')));
  data.studioBass.forEach((item,i)=>bassGrid.append(card(item,i,'bass')));

  function stopTrack(){
    if(!activeTrack)return;
    const {button,playerBox,indicator,title}=activeTrack;
    activeTrack.cleanup?.();
    button.closest('.track-row').querySelectorAll('[aria-pressed]').forEach(b=>b.setAttribute('aria-pressed','false'));
    playerBox.querySelectorAll('video,audio').forEach(player=>player.pause());
    playerBox.replaceChildren();playerBox.hidden=true;
    button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Play '+title);
    indicator.textContent='▶';activeTrack=null;
  }
  let youtubePromise;
  function youtubeAPI(){
    if(window.YT?.Player)return Promise.resolve(window.YT);
    if(!youtubePromise)youtubePromise=new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(new Error('YouTube API unavailable')),12000);
      window.onYouTubeIframeAPIReady=()=>{clearTimeout(timeout);resolve(window.YT);};
      const script=el('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{clearTimeout(timeout);reject(new Error('YouTube API unavailable'));};document.head.append(script);
    });
    return youtubePromise;
  }
  function platformSource(item,key){
    try{
      const u=new URL(item.platforms[key]);
      if(key==='youtube'){
        const id=u.hostname==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v');
        return /^[a-zA-Z0-9_-]{11}$/.test(id)?'https://www.youtube.com/embed/'+id:null;
      }
      if(key==='spotify')return 'https://open.spotify.com/embed'+u.pathname;
      if(key==='appleMusic'){u.hostname='embed.music.apple.com';return u.href;}
    }catch{}return null;
  }
  function validMedia(url){
    if(!url) return false;
    try{const parsed=new URL(url,window.location.href);
      if(parsed.protocol==='file:' && /\.(mp4|webm)$/i.test(parsed.pathname))return true;
      if(parsed.protocol!=='https:'&&parsed.protocol!=='http:')return false;
      if(/^(www\.)?(youtube\.com|youtube-nocookie\.com)$/.test(parsed.hostname)&&parsed.pathname.startsWith('/embed/'))return true;
      if(parsed.hostname==='player.vimeo.com'&&parsed.pathname.startsWith('/video/'))return true;
      if(parsed.hostname==='open.spotify.com'&&parsed.pathname.startsWith('/embed/'))return true;
      if(parsed.hostname==='embed.music.apple.com')return true;
      if(/\.(mp4|webm)$/i.test(parsed.pathname))return true;
    }catch(e){}return false;
  }
  function embed(url,title,autoplay=false){
    if(!validMedia(url))return null;
    const parsed=new URL(url,window.location.href);
    if(/\.(mp4|webm)$/i.test(parsed.pathname)){
      const video=el('video');video.controls=true;video.playsInline=true;
      video.autoplay=autoplay;video.preload='metadata';video.src=url;
      video.setAttribute('aria-label',title);
      return video;
    }
    if(autoplay && (parsed.hostname.includes('youtube') || parsed.hostname==='player.vimeo.com')){
      parsed.searchParams.set('autoplay','1');
      parsed.searchParams.set('playsinline','1');
    }
    if(parsed.hostname.includes('youtube')){
      parsed.searchParams.set('enablejsapi','1');
      if(/^https?:$/.test(location.protocol))parsed.searchParams.set('origin',location.origin);
    }
    const iframe=el('iframe');iframe.src=parsed.href;iframe.title=title;
    iframe.referrerPolicy='strict-origin-when-cross-origin';
    if(parsed.hostname==='embed.music.apple.com')iframe.className='apple-player';
    if(parsed.hostname==='open.spotify.com')iframe.className='spotify-player';
    iframe.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';
    iframe.allowFullscreen=true;return iframe;
  }
  function originTransform(){
    const source=priorFocus?.querySelector('.media-frame') || priorFocus;
    if(!source)return 'scale(.96)';
    const from=source.getBoundingClientRect();
    const to=dialog.getBoundingClientRect();
    return `translate(${from.left-to.left}px,${from.top-to.top}px) scale(${from.width/to.width},${from.height/to.height})`;
  }
  function animateDialog(opening){
    motion?.cancel();
    if(reducedMotion.matches || !dialog.animate)return Promise.resolve();
    const origin=originTransform();
    const frames=opening
      ? [{transform:origin,opacity:.5},{transform:'none',opacity:1}]
      : [{transform:'none',opacity:1},{transform:origin,opacity:0}];
    motion=dialog.animate(frames,{duration:opening?440:280,easing:opening?'cubic-bezier(.22,1,.36,1)':'cubic-bezier(.4,0,.8,.4)',fill:'both'});
    return motion.finished.catch(()=>{});
  }
  function openWork(item,type,trigger){
    if(dialog.open || closing)return;
    stopTrack();
    priorFocus=trigger;
    dialog.classList.toggle('theater-mode',type==='sound');
    dialog.classList.remove('is-closing');
    document.getElementById('dialogMode').textContent='';
    dialogImage.replaceChildren();
    const player=embed(type==='sound'?item.video:item.embed,item.title,type==='sound');
    if(player)dialogImage.append(player);
    else{
      const poster=el('img',type==='bass'?'square-art':'');poster.src=item.image;poster.alt='Portfolio artwork placeholder';dialogImage.append(poster);
      if(type==='sound')dialogImage.append(el('span','video-pending','Video coming soon'));
    }
    document.getElementById('dialogKicker').textContent=type==='sound'?'Sound design & original scoring':'Studio bass';
    dialogTitle.textContent=item.title;
    dialogRole.textContent=type==='sound'?item.category:`${item.artist} · ${item.role}`;
    dialogDescription.textContent=item.description;
    dialogNote.replaceChildren();
    const destinations=document.getElementById('dialogPlatforms');
    destinations.replaceChildren();
    if(type==='bass')destinations.append(platformLinks(item));
    if(type==='bass'&&item.link){
      try{const u=new URL(item.link);if(u.protocol==='https:'||u.protocol==='http:'){
        const link=el('a','','Listen to official release ↗');link.href=item.link;link.target='_blank';link.rel='noopener noreferrer';dialogNote.append(link);
      }}catch(e){}
    }else if(!player){dialogNote.textContent='Sample project — media coming soon.';}
    dialog.showModal();
    dialog.scrollTop=0;
    const opening=animateDialog(true);
    opening.then(()=>{if(!closing && dialog.open)motion?.cancel();});
    if(player?.tagName==='VIDEO')player.play().catch(()=>{});
  }
  async function closeDialog(){
    if(!dialog.open || closing)return;
    closing=true;
    dialog.classList.add('is-closing');
    const video=dialogImage.querySelector('video');
    video?.pause();
    // Remove external players immediately so their audio stops during collapse.
    dialogImage.querySelectorAll('iframe').forEach(frame=>frame.remove());
    await animateDialog(false);
    dialog.close();
  }
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});
  document.getElementById('closeDialog').addEventListener('click',closeDialog);
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog();
  });
  dialog.addEventListener('close',()=>{motion?.cancel();closing=false;dialog.classList.remove('is-closing');dialogImage.replaceChildren();priorFocus?.focus({preventScroll:true});});
  const menuButton=document.getElementById('menuButton');
  const mobileMenu=document.getElementById('mobileMenu');
  menuButton.addEventListener('click',()=>{
    const isOpen=menuButton.getAttribute('aria-expanded')==='true';
    menuButton.setAttribute('aria-expanded',String(!isOpen));mobileMenu.hidden=isOpen;
    menuButton.querySelector('span').textContent=isOpen?'+':'−';
  });
  mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menuButton.setAttribute('aria-expanded','false');mobileMenu.hidden=true;menuButton.querySelector('span').textContent='+';}));
  const socialLinks=document.getElementById('socialLinks');
  [['linkedin','LinkedIn'],['instagram','Instagram']].forEach(([key,name])=>{
    socialLinks.append(iconLink(key,'Dor Sam on '+name,data.socials?.[key],'social-link'));
  });
  const emailLink=document.getElementById('emailLink');
  const emailWarning=document.getElementById('emailWarning');
  if(data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)){
    emailLink.hidden=false;
    emailLink.href='mailto:'+data.email;
    emailLink.innerHTML='';emailLink.append(document.createTextNode(data.email+' '),el('span','','↗'));
    emailWarning.hidden=true;
    const emailIcon=el('a','social-link');emailIcon.href='mailto:'+data.email;
    emailIcon.setAttribute('aria-label','Email Dor at '+data.email);emailIcon.title='Email Dor';
    const envelope=el('img');envelope.src='assets/icons/email.svg';envelope.alt='';
    envelope.setAttribute('aria-hidden','true');emailIcon.append(envelope);socialLinks.append(emailIcon);
  }else{emailLink.addEventListener('click',e=>e.preventDefault());}
  document.getElementById('copyrightYear').textContent=new Date().getFullYear();
})();
