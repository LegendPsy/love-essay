(()=>{
  'use strict';

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
  const lerp=(a,b,t)=>a+(b-a)*t;

  /* -------------------------------------------------------
     Reveal + progress
  ------------------------------------------------------- */
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('is-visible');
        revealObserver.unobserve(e.target);
      }
    });
  },{threshold:.13,rootMargin:'0px 0px -8% 0px'});
  $$('.reveal').forEach(el=>revealObserver.observe(el));

  const progressFill=$('#progressFill');
  const progressDot=$('#progressDot');

  function updateProgress(){
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    const p=clamp(scrollY/max);
    if(progressFill)progressFill.style.height=(p*100)+'%';
    if(progressDot)progressDot.style.top=(p*100)+'%';
  }

  /* -------------------------------------------------------
     Hero
  ------------------------------------------------------- */
  const hero=$('.hero');
  const heroStart=$('#startBtn');
  heroStart?.addEventListener('click',()=>{
    $('#intuition')?.scrollIntoView({behavior:'smooth',block:'start'});
  });

  let pointerX=.5,pointerY=.5;
  addEventListener('pointermove',e=>{
    pointerX=e.clientX/innerWidth;
    pointerY=e.clientY/innerHeight;
    if(hero){
      hero.style.setProperty('--lightX',((pointerX-.5)*26)+'px');
      hero.style.setProperty('--lightY',((pointerY-.5)*22)+'px');
    }
  },{passive:true});

  /* -------------------------------------------------------
     Choice
  ------------------------------------------------------- */
  const choiceResult=$('#choiceResult');
  $$('.choice-card').forEach(card=>{
    card.addEventListener('click',()=>{
      $$('.choice-card').forEach(c=>c.classList.toggle('is-selected',c===card));
      const intense=card.dataset.choice==='intense';
      choiceResult.textContent=intense
        ? 'Это самый интуитивный выбор: больше страдания кажется большей любовью. Но сейчас мы увидели интенсивность реакции — не величину любви.'
        : 'Более спокойная реакция не означает меньшей любви. Пока мы увидели только то, как человек выдерживает тревогу.';
      choiceResult.classList.add('is-visible');
      document.body.dataset.choice=intense?'intense':'calm';
    });
  });

  /* -------------------------------------------------------
     Reaction scrollytelling
  ------------------------------------------------------- */
  const reaction=$('#reaction');
  const bars={
    anxiety:$('[data-bar="anxiety"]'),
    pain:$('[data-bar="pain"]'),
    control:$('[data-bar="control"]')
  };
  const outs={
    anxiety:$('[data-out="anxiety"]'),
    pain:$('[data-out="pain"]'),
    control:$('[data-out="control"]')
  };
  const equation=$('#equation');
  const reactionSteps=$$('.reaction-step');

  function reactionProgress(){
    if(!reaction)return 0;
    const r=reaction.getBoundingClientRect();
    const travel=Math.max(1,r.height-innerHeight);
    return clamp((-r.top)/travel);
  }

  function updateReaction(){
    const p=reactionProgress();
    const eased=p*p*(3-2*p);
    const vals={
      anxiety:Math.round(lerp(36,94,eased)),
      pain:Math.round(lerp(32,91,eased)),
      control:Math.round(lerp(28,84,eased))
    };
    Object.keys(vals).forEach(k=>{
      bars[k]?.style.setProperty('--bar',vals[k]+'%');
      if(outs[k])outs[k].textContent=String(vals[k]);
    });

    equation?.classList.toggle('is-broken',p>.79);

    const idx=Math.min(3,Math.floor(p*4.05));
    reactionSteps.forEach((el,i)=>{
      el.style.opacity=i===idx?'1':'.22';
      el.style.transform=i===idx?'translateY(0)':'translateY(20px)';
      el.style.transition='opacity .5s ease,transform .6s cubic-bezier(.16,1,.3,1)';
    });
  }

  /* -------------------------------------------------------
     Fracture scene
  ------------------------------------------------------- */
  const fracture=$('#fracture');
  const fractureParts=$$('#fractureWord > *');
  function updateFracture(){
    if(!fracture||!fractureParts.length)return;
    const r=fracture.getBoundingClientRect();
    const p=clamp((innerHeight-r.top)/(innerHeight+r.height));
    const q=clamp((p-.28)/.46);
    fractureParts.forEach((el,i)=>{
      const dir=i===0?-1:i===2?1:0;
      const y=(i===1?-1:1)*q*q*28;
      const x=dir*q*q*86;
      const rot=dir*q*7;
      el.style.transform=`translate3d(${x}px,${y}px,0) rotate(${rot}deg)`;
      el.style.filter=`blur(${q*1.6}px)`;
    });
  }

  /* -------------------------------------------------------
     Meter
  ------------------------------------------------------- */
  const range=$('#intensityRange');
  const needle=$('#dialNeedle');
  const dialValue=$('#dialValue');
  function syncMeter(){
    if(!range)return;
    const v=Number(range.value);
    if(dialValue)dialValue.textContent=v+'%';
    if(needle)needle.style.setProperty('--needle',lerp(-128,38,v/100)+'deg');
  }
  range?.addEventListener('input',syncMeter);
  syncMeter();

  /* -------------------------------------------------------
     Orbit factors
  ------------------------------------------------------- */
  const orbitStage=$('#orbitStage');
  const orbitNodes=$$('.orbit-node');
  const factorCard=$('#factorCard');
  const factorData={
    uncertainty:['Переносимость неопределённости','Насколько человек способен не знать, что происходит, и всё равно оставаться в контакте с реальностью.'],
    thoughts:['Слияние с мыслями','Насколько легко пугающий сценарий в голове начинает ощущаться как уже произошедший факт.'],
    flexibility:['Психологическая гибкость','Способность чувствовать сильные эмоции и при этом выбирать действия, которые важны здесь и сейчас.'],
    experience:['Прошлый опыт','Опыт потерь, нестабильности или безопасности влияет на реакцию нервной системы в похожих ситуациях.'],
    control:['Потребность в контроле','Чем труднее переносится отсутствие контроля, тем сильнее может становиться тревога — даже при той же любви.'],
    sensitivity:['Чувствительность нервной системы','Люди различаются по интенсивности и скорости эмоциональной реакции. Это тоже не шкала любви.']
  };
  let orbitRotation=0,orbitTarget=0;

  function selectFactor(node){
    orbitNodes.forEach(n=>n.classList.toggle('is-active',n===node));
    const data=factorData[node.dataset.factor];
    if(!data||!factorCard)return;
    factorCard.animate(
      [{opacity:.2,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],
      {duration:360,easing:'cubic-bezier(.16,1,.3,1)'}
    );
    factorCard.innerHTML=`<small>Сейчас подсвечено</small><h3>${data[0]}</h3><p>${data[1]}</p>`;
  }
  orbitNodes.forEach(n=>n.addEventListener('click',()=>selectFactor(n)));

  orbitStage?.addEventListener('pointermove',e=>{
    const r=orbitStage.getBoundingClientRect();
    orbitTarget=((e.clientX-r.left)/r.width-.5)*18;
  },{passive:true});
  orbitStage?.addEventListener('pointerleave',()=>orbitTarget=0,{passive:true});

  function animateOrbit(){
    orbitRotation+=((orbitTarget+scrollY*.012)-orbitRotation)*.035;
    orbitStage?.style.setProperty('--orbitRot',orbitRotation+'deg');
    requestAnimationFrame(animateOrbit);
  }
  animateOrbit();

  /* -------------------------------------------------------
     Flashlight
  ------------------------------------------------------- */
  const flashlight=$('#flashlight');
  const flashBeam=$('#flashBeam');
  const torch=$('#torchBtn');
  const questions=$$('.question');
  let lightOn=false;

  function setLight(v){
    lightOn=v;
    flashlight?.classList.toggle('is-on',v);
    torch?.setAttribute('aria-pressed',String(v));
    if(torch)torch.lastChild.textContent=v?' Выключить свет':' Включить свет';
    if(!v)questions.forEach(q=>q.classList.remove('is-lit'));
  }
  torch?.addEventListener('click',()=>setLight(!lightOn));

  function moveLight(x,y){
    if(!lightOn||!flashlight||!flashBeam)return;
    const r=flashlight.getBoundingClientRect();
    flashBeam.style.setProperty('--x',((x-r.left)/r.width*100)+'%');
    flashBeam.style.setProperty('--y',((y-r.top)/r.height*100)+'%');

    let best=null,dist=Infinity;
    questions.forEach(q=>{
      const qr=q.getBoundingClientRect();
      const cx=Math.max(qr.left,Math.min(x,qr.right));
      const cy=Math.max(qr.top,Math.min(y,qr.bottom));
      const d=Math.hypot(cx-x,cy-y);
      if(d<dist){dist=d;best=q}
    });
    questions.forEach(q=>q.classList.toggle('is-lit',q===best));
  }
  flashlight?.addEventListener('pointermove',e=>moveLight(e.clientX,e.clientY));
  flashlight?.addEventListener('touchmove',e=>{
    const t=e.touches[0];if(t)moveLight(t.clientX,t.clientY);
  },{passive:true});

  questions.forEach(q=>q.addEventListener('click',()=>{
    if(!lightOn)setLight(true);
    questions.forEach(x=>x.classList.remove('is-lit'));
    q.classList.add('is-lit');
  }));

  /* -------------------------------------------------------
     Finale + epilogue
  ------------------------------------------------------- */
  const stars=$$('#stars button');
  const epilogue=$('#epilogue');
  stars.forEach(star=>{
    const value=Number(star.dataset.rating);
    star.addEventListener('pointerenter',()=>{
      stars.forEach(s=>s.classList.toggle('is-on',Number(s.dataset.rating)<=value));
    });
    star.addEventListener('pointerleave',()=>{
      if(!epilogue?.classList.contains('is-revealed'))stars.forEach(s=>s.classList.remove('is-on'));
    });
    star.addEventListener('click',()=>{
      stars.forEach(s=>{
        s.classList.toggle('is-on',Number(s.dataset.rating)<=value);
        s.disabled=true;
      });
      if(lightOn)setLight(false);
      epilogue?.classList.add('is-revealed');
      epilogue?.animate(
        [{filter:'blur(10px)',opacity:.4},{filter:'blur(0)',opacity:1}],
        {duration:1200,easing:'cubic-bezier(.16,1,.3,1)'}
      );
    });
  });

  $('#shareBtn')?.addEventListener('click',async()=>{
    const data={
      title:'Любовь не измеряется страданием',
      text:'Интерактивное эссе о том, почему интенсивность страдания не является мерой любви.',
      url:location.href
    };
    try{
      if(navigator.share)await navigator.share(data);
      else if(navigator.clipboard)await navigator.clipboard.writeText(location.href);
    }catch(err){
      if(err?.name!=='AbortError')console.error(err);
    }
  });

  /* -------------------------------------------------------
     Scroll loop
  ------------------------------------------------------- */
  let raf=0;
  function frame(){
    raf=0;
    updateProgress();
    updateReaction();
    updateFracture();
    if(hero){
      const y=Math.min(60,scrollY*.07);
      hero.style.setProperty('--heroY',y+'px');
    }
  }
  function schedule(){
    if(!raf)raf=requestAnimationFrame(frame);
  }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  frame();

  /* -------------------------------------------------------
     WebGL cinematic background
     Lightweight fragment shader; CSS remains as fallback.
  ------------------------------------------------------- */
  const canvas=$('#shader');
  if(!canvas||matchMedia('(prefers-reduced-motion: reduce)').matches)return;

  const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});
  if(!gl){canvas.style.display='none';return}

  const vertex=`
    attribute vec2 p;
    void main(){gl_Position=vec4(p,0.,1.);}
  `;
  const fragment=`
    precision mediump float;
    uniform vec2 r;
    uniform float t;
    uniform vec2 m;
    uniform float s;

    float hash(vec2 p){
      p=fract(p*vec2(123.34,456.21));
      p+=dot(p,p+45.32);
      return fract(p.x*p.y);
    }
    float noise(vec2 p){
      vec2 i=floor(p),f=fract(p);
      f=f*f*(3.0-2.0*f);
      return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),
                 mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
    }
    float fbm(vec2 p){
      float v=0.,a=.5;
      for(int i=0;i<4;i++){v+=a*noise(p);p*=2.03;a*=.5;}
      return v;
    }
    void main(){
      vec2 uv=(gl_FragCoord.xy-.5*r.xy)/min(r.x,r.y);
      vec2 mm=(m-.5)*.38;
      float tt=t*.045;
      float n=fbm(uv*2.1+vec2(tt,-tt*.72));
      float w=sin(uv.x*2.4+n*2.0+tt*3.0)*.5+.5;
      float d=length(uv-mm);
      float glow=exp(-3.1*d*d);
      vec3 dark=vec3(.018,.024,.031);
      vec3 gold=vec3(.34,.205,.095);
      vec3 cold=vec3(.07,.19,.215);
      vec3 col=dark;
      col+=gold*(n*.12+w*.025)*(0.38+s*.6);
      col+=cold*glow*.075*(1.0-s*.25);
      float edge=smoothstep(1.0,.05,length(uv*.78));
      col*=.72+.28*edge;
      gl_FragColor=vec4(col,.92);
    }
  `;

  function compile(type,src){
    const sh=gl.createShader(type);
    gl.shaderSource(sh,src);gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){
      console.warn(gl.getShaderInfoLog(sh));return null;
    }
    return sh;
  }
  const vs=compile(gl.VERTEX_SHADER,vertex);
  const fs=compile(gl.FRAGMENT_SHADER,fragment);
  if(!vs||!fs){canvas.style.display='none';return}
  const program=gl.createProgram();
  gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){canvas.style.display='none';return}
  gl.useProgram(program);

  const buffer=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,'p');
  gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);

  const uR=gl.getUniformLocation(program,'r');
  const uT=gl.getUniformLocation(program,'t');
  const uM=gl.getUniformLocation(program,'m');
  const uS=gl.getUniformLocation(program,'s');

  let webglRunning=true;
  function resizeGL(){
    const dpr=Math.min(devicePixelRatio||1,1.5);
    const w=Math.floor(innerWidth*dpr),h=Math.floor(innerHeight*dpr);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}
  }
  function renderGL(ms){
    if(!webglRunning)return;
    resizeGL();
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    const sp=clamp(scrollY/max);
    gl.uniform2f(uR,canvas.width,canvas.height);
    gl.uniform1f(uT,ms*.001);
    gl.uniform2f(uM,pointerX,pointerY);
    gl.uniform1f(uS,sp);
    gl.drawArrays(gl.TRIANGLES,0,6);
    requestAnimationFrame(renderGL);
  }
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)webglRunning=false;
    else if(!webglRunning){webglRunning=true;requestAnimationFrame(renderGL)}
  });
  requestAnimationFrame(renderGL);
})();