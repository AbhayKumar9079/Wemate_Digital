/* Wemate Digital – site scripts */
const WA_NUMBER='919587677685';
const DEMO_MAIL='abhaykumarakela2004@gmail.com';

const header=document.querySelector('.site-header');
window.addEventListener('scroll',()=>{if(header) header.classList.toggle('scrolled',scrollY>30)},{passive:true});

const menu=document.querySelector('.menu-toggle'), nav=document.querySelector('.nav-links');
if(menu&&nav) menu.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav&&nav.classList.remove('open')));

const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}})
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

document.querySelectorAll('[data-counter]').forEach(el=>{
  const target=parseInt(el.dataset.counter,10), suffix=el.dataset.suffix||'';
  let started=false;
  const obs=new IntersectionObserver(es=>{
    if(es[0].isIntersecting&&!started){
      started=true; const dur=1300, t0=performance.now();
      const tick=now=>{const p=Math.min((now-t0)/dur,1);el.textContent=Math.floor(target*(1-Math.pow(1-p,3)))+suffix;if(p<1)requestAnimationFrame(tick)};
      requestAnimationFrame(tick);obs.disconnect();
    }
  },{threshold:.6});obs.observe(el);
});

const glow=document.querySelector('.cursor-glow');
if(glow&&matchMedia('(pointer:fine)').matches){
  window.addEventListener('pointermove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'},{passive:true});
}

const toast=document.getElementById('toast');
function showToast(msg){
  if(!toast) return;
  toast.textContent=msg; toast.classList.add('show');
  clearTimeout(showToast.t); showToast.t=setTimeout(()=>toast.classList.remove('show'),3600);
}

/* ---------- WhatsApp: contact form + service buttons ---------- */
function whatsappMessage(form){
  const d=new FormData(form);
  const text=`Hello Wemate Digital,\n\nName: ${d.get('name')||''}\nService: ${d.get('service')||''}\nProject details: ${d.get('details')||''}`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`,'_blank','noopener');
}
document.querySelectorAll('.whatsapp-form').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();whatsappMessage(f);}));
document.querySelectorAll('[data-wa]').forEach(btn=>btn.addEventListener('click',()=>{
  const msg='Hello Wemate Digital, I am interested in '+btn.dataset.wa+'. Please guide me.';
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,'_blank','noopener');
}));

/* ---------- Live demo: form first, then email ---------- */
(function demoModal(){
  const modal=document.getElementById('demoModal');
  if(!modal) return;
  const form=document.getElementById('demoForm');
  const formWrap=document.getElementById('demoFormWrap');
  const done=document.getElementById('demoDone');
  const select=form.elements['software'];
  let mailData=null, lastFocus=null;

  function open(software){
    lastFocus=document.activeElement;
    formWrap.hidden=false; done.hidden=true;
    const has=[...select.options].some(o=>o.value===software);
    select.value=has?software:'';
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    setTimeout(()=>form.elements['name'].focus(),60);
  }
  function close(){
    modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    if(lastFocus) lastFocus.focus();
  }
  document.querySelectorAll('[data-demo]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();open(b.dataset.demo)}));
  modal.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',close));
  modal.addEventListener('click',e=>{if(e.target===modal) close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open')) close()});

  form.addEventListener('submit',e=>{
    e.preventDefault();
    const d=new FormData(form);
    const software=d.get('software');
    const subject=`Live demo request - ${software}`;
    const body=[
      'Hello Wemate Digital,','',
      `I would like to request a live demo of the ${software}.`,'',
      `Name: ${d.get('name')}`,
      `Phone: ${d.get('phone')}`,
      `Email: ${d.get('email')}`,
      `Business: ${d.get('business')||'-'}`,
      `Message: ${d.get('message')||'-'}`,'',
      'Thank you.'
    ].join('\r\n');
    mailData={subject,body};
    const q=`subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    document.getElementById('demoGmail').href=`https://mail.google.com/mail/?view=cm&fs=1&to=${DEMO_MAIL}&${q}`;
    formWrap.hidden=true; done.hidden=false;
    showToast('Opening your email app…');
    window.location.href=`mailto:${DEMO_MAIL}?${q}`;
  });

  const copyBtn=document.getElementById('demoCopy');
  if(copyBtn) copyBtn.addEventListener('click',async()=>{
    if(!mailData) return;
    try{
      await navigator.clipboard.writeText(`To: ${DEMO_MAIL}\nSubject: ${mailData.subject}\n\n${mailData.body.replace(/\r\n/g,'\n')}`);
      showToast('Details copied');
    }catch(err){showToast('Could not copy. Please select the text manually.')}
  });
  const again=document.getElementById('demoAgain');
  if(again) again.addEventListener('click',()=>{formWrap.hidden=false;done.hidden=true});
})();

/* ---------- Animated star field ---------- */
(function initStarfield(){
  const canvas=document.createElement('canvas');
  canvas.id='starfield';
  document.body.prepend(canvas);
  const ctx=canvas.getContext('2d');
  if(!ctx) return;
  let stars=[], width=0, height=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colors=['rgba(255,255,255,','rgba(24,182,255,','rgba(255,92,122,'];
  function resize(){
    const dpr=Math.min(window.devicePixelRatio||1,2);
    width=innerWidth; height=innerHeight;
    canvas.width=Math.floor(width*dpr); canvas.height=Math.floor(height*dpr);
    canvas.style.width=width+'px'; canvas.style.height=height+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const count=Math.min(190,Math.max(75,Math.floor(width*height/10500)));
    stars=Array.from({length:count},()=>({
      x:Math.random()*width,y:Math.random()*height,
      r:Math.random()<.9?Math.random()*1.15+.35:Math.random()*1.6+.7,
      a:Math.random()*.48+.18,speed:Math.random()*.22+.035,phase:Math.random()*Math.PI*2,
      color:Math.random()<.76?0:(Math.random()<.65?1:2)
    }));
  }
  function draw(t){
    ctx.clearRect(0,0,width,height);
    for(const s of stars){
      const tw=reduced?1:(.72+.28*Math.sin(t*.0012*s.speed*8+s.phase));
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=colors[s.color]+(s.a*tw)+')';ctx.fill();
      if(s.r>1.2){
        ctx.strokeStyle=colors[s.color]+(s.a*.22*tw)+')';ctx.lineWidth=.7;
        ctx.beginPath();ctx.moveTo(s.x-s.r*2.8,s.y);ctx.lineTo(s.x+s.r*2.8,s.y);ctx.moveTo(s.x,s.y-s.r*2.8);ctx.lineTo(s.x,s.y+s.r*2.8);ctx.stroke();
      }
      if(!reduced){s.y-=s.speed*.035;if(s.y<-4)s.y=height+4}
    }
    if(!reduced) requestAnimationFrame(draw);
  }
  resize(); addEventListener('resize',resize,{passive:true});
  requestAnimationFrame(draw);
})();
