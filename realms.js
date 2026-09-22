(() => {
  const key='spellforge-realms-v1';
  const realms=[
    {id:'ember',name:'Ember Foundry',element:'Ember',color:'#ff744d',dark:'#30151a',accent:'#ffc06f',hazard:'lava',boss:'engine',enemies:['chaser','cinderhound','charger','crimson'],description:'Open lanes, readable attacks, and a gentler first ascent through the forge.'},
    {id:'frost',name:'Frost Bastion',element:'Frost',color:'#70dff3',dark:'#102b40',accent:'#d2fbff',hazard:'frost',boss:'frostboss',enemies:['rimeweaver','tank','shieldbearer','wisp'],description:'Crystal walls tighten the arena while armored enemies close in.'},
    {id:'storm',name:'Storm Crucible',element:'Storm',color:'#c68aff',dark:'#25163b',accent:'#f1d5ff',hazard:'storm',boss:'tempestboss',enemies:['thunderhead','vectorscribe','shooter','wisp','sniper'],description:'Fast ranged formations and mana-draining lightning fields.'},
    {id:'venom',name:'Venom Wilds',element:'Venom',color:'#79db72',dark:'#142d21',accent:'#caff9d',hazard:'poison',boss:'broodboss',enemies:['sporebrute','splitter','burrower','healer'],description:'Crowds multiply, heal, and force movement through toxic ground.'},
    {id:'radiant',name:'Radiant Court',element:'Radiant',color:'#ffe17e',dark:'#382c16',accent:'#fff5ba',hazard:'flare',boss:'sunboss',enemies:['sunlancer','golden','sentinel','healer'],description:'Disciplined formations cover each other with punishing crossfire.'},
    {id:'void',name:'Void Expanse',element:'Void',color:'#ad6cff',dark:'#211335',accent:'#e4c4ff',hazard:'void',boss:'voidboss',enemies:['riftstalker','mimic','voidmage','sniper'],description:'Spell-copying constructs and curses attack from beyond sight.'},
    {id:'crystal',name:'Crystal Labyrinth',element:'Crystal',color:'#5de1d1',dark:'#102f35',accent:'#c5fff8',hazard:'collapse',boss:'prismboss',enemies:['shardsmith','burrower','shieldbearer','sentinel'],description:'Cover grows and collapses until every firing lane becomes a choice.'},
    {id:'gravity',name:'Gravity Well',element:'Gravity',color:'#8f83ff',dark:'#171735',accent:'#d9d4ff',hazard:'gravity',boss:'mirror',enemies:['graviton','mimic','voidmage','tank'],description:'The final realm bends movement and combines the harshest formations.'},
  ];
  let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{}
  const state={
    rebirths:Math.max(0,Math.floor(saved.rebirths||0)),
    unlocked:Math.max(0,Math.min(realms.length-1,Math.floor(saved.unlocked||0))),
    active:Math.max(0,Math.min(realms.length-1,Math.floor(saved.active||0))),
    highest:Array.from({length:realms.length},(_,i)=>Math.max(0,Math.floor(saved.highest?.[i]||0))),
    runs:Array.isArray(saved.runs)?saved.runs.slice(0,30):[],
    achievements:saved.achievements||{},
    tutorialDone:!!saved.tutorialDone,
  };
  if(state.active>state.unlocked)state.active=state.unlocked;
  const achievements=[
    ['first-step','First Spark','Clear wave 5.',s=>Math.max(...s.highest)>=5],
    ['reborn','Rekindled','Perform your first rebirth.',s=>s.rebirths>=1],
    ['stormbound','Stormbound','Unlock the Storm Crucible.',s=>s.unlocked>=2],
    ['halfway','Beyond the Court','Unlock the Void Expanse.',s=>s.unlocked>=5],
    ['gravity','Weight of Magic','Reach the Gravity Well.',s=>s.unlocked>=7],
    ['cycle','Perfect Cycle','Rebirth after reaching the final realm.',s=>s.rebirths>=8],
    ['wave20','Unbroken Twenty','Clear wave 20 in any realm.',s=>Math.max(...s.highest)>=20],
    ['scholar','Field Scholar','Discover 15 enemies.',()=>window.EnemyJournal?.entries.filter(e=>window.EnemyJournal.records[e.id]?.seen).length>=15],
  ];
  const $=id=>document.getElementById(id);
  function save(){try{localStorage.setItem(key,JSON.stringify(state))}catch{}}
  function current(){return realms[state.active]}
  function requirement(){return 15+Math.min(7,Math.floor(state.rebirths*.8))}
  function intro(){return state.active===0&&state.rebirths===0}
  function progressionWave(wave=1,rebirths=state.rebirths){return Math.max(1,wave+Math.max(0,rebirths)*9)}
  function power(wave=1,rebirths=state.rebirths){const n=progressionWave(wave,rebirths)-1;return .72*(1+n*.08+n*n*.006)}
  function difficultyAt(index=state.active){return power(1,state.rebirths+Math.max(0,index-state.active))}
  function difficulty(){return difficultyAt()}
  function danger(wave=1){const n=progressionWave(wave)-1;return .7*(1+Math.min(2.5,n*.025))}
  function population(wave=1){return Math.min(1,.72+(progressionWave(wave)-1)*.015)}
  function reward(){return 1+state.active*.17+state.rebirths*.045}
  function eliteBonus(wave=1){return Math.min(.14,(progressionWave(wave)-1)*.002)}
  function enemyPool(wave){
    const r=current(),pool=[r.enemies[0],r.enemies[0],r.enemies[1]];
    if(intro()){
      const gentle=['chaser','chaser'];
      if(wave>=2)gentle.push('cinderhound');
      if(wave>=4)gentle.push('charger');
      if(wave>=7)gentle.push('crimson');
      if(wave>=10)gentle.push('cinderhound','charger');
      return gentle
    }
    if(wave>=2)pool.push(r.enemies[1],r.enemies[2]);
    if(wave>=4)pool.push(r.enemies[2],r.enemies[3]);
    if(wave>=8)pool.push(...r.enemies);
    return pool;
  }
  function boss(wave,fallback){
    if(wave%10===0){const second=['splitboss','frostboss','tempestboss','splitboss','engine','voidboss','frostboss','voidboss'];return second[state.active]}
    return current().boss||fallback;
  }
  function affinity(type){return realms.find(r=>r.enemies.includes(type)||r.boss===type)?.element||'Unbound'}
  function hazard(){return current().hazard}
  function waveCleared(game){
    if(game.mode==='training')return;
    state.highest[state.active]=Math.max(state.highest[state.active],game.wave);
    checkAchievements();save();render();
    if(game.wave===requirement())game.realmReady=true;
  }
  function recordRun(game,reason='defeat'){
    if(game.mode==='training'||game.realmRecorded)return;
    game.realmRecorded=true;
    state.runs.unshift({time:Date.now(),realm:state.active,wave:game.wave,kills:game.kills,reason,spell:window.SpellSystem?.current().map(x=>x.id).slice(0,12)||[]});
    state.runs=state.runs.slice(0,30);save();render();
  }
  function checkAchievements(){for(const [id,,,test] of achievements)if(!state.achievements[id]&&test(state))state.achievements[id]=Date.now();save()}
  function rebirth(){
    const game=window.SpellArena?.getGame();
    if(!game||state.highest[state.active]<requirement())return false;
    recordRun(game,'rebirth');state.rebirths++;
    if(state.unlocked<realms.length-1)state.unlocked++;
    state.active=Math.min(state.unlocked,state.active+1);
    checkAchievements();save();render();window.SpellArena.start('normal');
    window.SpellArena.say(`Rebirth ${state.rebirths}: ${current().name} awakened.`,4);return true;
  }
  function select(index){
    const game=window.SpellArena?.getGame();
    if(index<0||index>state.unlocked||game?.phase==='playing'||game?.phase==='paused'||panelPause)return;
    state.active=index;save();render();applyTheme();
  }
  function applyTheme(){const r=current();document.documentElement.style.setProperty('--realm',r.color);document.documentElement.style.setProperty('--realm-dark',r.dark);document.documentElement.style.setProperty('--realm-accent',r.accent)}
  function draw(g,w,h,time){
    const r=current();g.fillStyle=r.dark;g.fillRect(0,0,w,h);
    const grad=g.createRadialGradient(w*.5,h*.45,40,w*.5,h*.45,w*.65);grad.addColorStop(0,r.color+'24');grad.addColorStop(1,'#05081299');g.fillStyle=grad;g.fillRect(0,0,w,h);
    g.strokeStyle=r.color+'20';g.lineWidth=1;
    if(r.id==='gravity'||r.id==='void'){for(let i=0;i<7;i++){g.beginPath();g.arc(w/2,h/2,60+i*48+Math.sin(time+i)*5,0,Math.PI*2);g.stroke()}}
    else if(r.id==='ember'){for(let x=-h;x<w;x+=72){g.beginPath();g.moveTo(x,0);g.lineTo(x+h,h);g.stroke()}}
    else if(r.id==='crystal'||r.id==='frost'){for(let x=0;x<w;x+=70)for(let y=0;y<h;y+=70){g.beginPath();g.moveTo(x,y-18);g.lineTo(x+18,y);g.lineTo(x,y+18);g.lineTo(x-18,y);g.closePath();g.stroke()}}
    else{for(let x=0;x<w;x+=48){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke()}for(let y=0;y<h;y+=48){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}}
  }
  const card=document.createElement('section');card.className='card panel realm-card';
  card.innerHTML='<div class="realm-kicker">ELEMENTAL ASCENSION</div><h2 id="realmName"></h2><p id="realmDescription" class="muted"></p><div class="realm-progress"><span id="realmRank"></span><strong id="realmGoal"></strong></div><div class="realm-actions"><button id="openRealms">Realms & records</button><button id="rebirthButton">Rebirth</button></div>';
  document.querySelector('.side').prepend(card);
  const modal=document.createElement('div');modal.className='realm-overlay hidden';modal.id='realmPanel';
  modal.innerHTML='<div class="realm-window"><header><div><small>THE ASCENSION MAP</small><h2>Elemental Realms</h2></div><button id="closeRealms">Done</button></header><nav id="realmTabs"></nav><div id="realmContent"></div></div>';
  document.body.append(modal);let tab='realms';
  function render(){
    applyTheme();const r=current(),goal=requirement(),high=state.highest[state.active];
    $('realmName').textContent=r.name;$('realmDescription').textContent=r.description;$('realmRank').textContent=`Rebirth ${state.rebirths} · Realm ${state.active+1}/${realms.length}`;$('realmGoal').textContent=`${Math.min(high,goal)} / ${goal} waves`;
    $('rebirthButton').disabled=high<goal;$('rebirthButton').textContent=high>=goal?(state.active<realms.length-1?'Enter next realm':'Ascend again'):`Rebirth at wave ${goal}`;
    if(modal.classList.contains('hidden'))return;
    $('realmTabs').innerHTML='';for(const [id,label] of [['realms','Realms'],['records','Run history'],['achievements','Achievements'],['guide','Guide']]){const b=document.createElement('button');b.className=tab===id?'active':'';b.textContent=label;b.onclick=()=>{tab=id;render()};$('realmTabs').append(b)}
    const root=$('realmContent');
    if(tab==='realms')root.innerHTML=`<div class="realm-grid">${realms.map((x,i)=>`<button class="realm-node ${i===state.active?'active':''} ${i>state.unlocked?'locked':''}" data-realm="${i}" style="--node:${x.color}"><small>${i>state.unlocked?'LOCKED':`STAGE ${i+1}`}</small><strong>${i>state.unlocked?'Unknown Realm':x.name}</strong><span>${i>state.unlocked?'Rebirth to reveal':`${state.highest[i]} highest wave · ×${difficultyAt(i).toFixed(2)} enemy power`}</span></button>`).join('')}</div><section class="rebirth-explain"><h3>${r.name}</h3><p>${r.description}</p><p>${intro()?'<b>Apprentice protection:</b> fewer enemies, reduced health and damage, and delayed elite threats.<br>':''}Reach wave <b>${goal}</b> to rebirth. Realm ${state.active+1} wave 1 is balanced like the previous realm's wave 10, while later waves keep scaling upward.</p></section>`;
    else if(tab==='records')root.innerHTML=state.runs.length?`<div class="record-list">${state.runs.map(run=>`<div><strong>${realms[run.realm]?.name||'Unknown'} · Wave ${run.wave}</strong><span>${run.kills} defeated · ${run.reason} · ${new Date(run.time).toLocaleDateString()}</span><small>${run.spell.join(' → ')}</small></div>`).join('')}</div>`:'<p class="empty-state">Complete a run to create your first record.</p>';
    else if(tab==='achievements')root.innerHTML=`<div class="achievement-grid">${achievements.map(([id,name,detail])=>`<article class="${state.achievements[id]?'earned':''}"><b>${state.achievements[id]?'✦':'◇'}</b><strong>${name}</strong><span>${detail}</span></article>`).join('')}</div>`;
    else root.innerHTML='<div class="guide"><h3>How progression works</h3><ol><li>Build a spell by dragging blocks into the connected script.</li><li>Clear waves and bosses to earn permanent Magic.</li><li>Reach the realm target and choose Rebirth. Your spells, Magic, upgrades, journal, and records stay.</li><li>Each new realm starts near the previous realm\'s wave 10 difficulty, then grows harder across its own waves.</li></ol><h3>Spell reading order</h3><p>Blocks run from top to bottom. Elements and motion modify the next Form. Event and conditional blocks create branches. The mana estimate updates before combat.</p></div>';
    root.querySelectorAll('[data-realm]').forEach(b=>b.onclick=()=>select(Number(b.dataset.realm)));
  }
  let panelPause=false;
  function open(){
    const game=window.SpellArena?.getGame();
    if(game?.phase==='playing'){game.phase='paused';panelPause=true}
    modal.classList.remove('hidden');render()
  }
  function close(){
    modal.classList.add('hidden');
    const game=window.SpellArena?.getGame();
    if(panelPause&&game?.phase==='paused')game.phase='playing';
    panelPause=false
  }
  $('openRealms').onclick=open;$('rebirthButton').onclick=rebirth;$('closeRealms').onclick=close;modal.onpointerdown=e=>{if(e.target===modal)close()};
  if(!state.tutorialDone){const tip=document.createElement('div');tip.className='first-guide';tip.innerHTML='<b>Elemental Ascension</b><span>Clear the realm target, then rebirth into a harder elemental arena. Permanent progress is kept.</span><button>Got it</button>';document.body.append(tip);tip.querySelector('button').onclick=()=>{state.tutorialDone=true;save();tip.remove()}}
  window.RealmSystem={realms,state,current,requirement,intro,difficulty,danger,population,reward,eliteBonus,enemyPool,boss,affinity,hazard,waveCleared,recordRun,checkAchievements,draw,render,open,rebirth,progressionWave,power,basePower:()=>.72};render();
})();
