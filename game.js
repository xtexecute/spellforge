(() => {
const c=document.getElementById('arena'),g=c.getContext('2d'),W=960,H=600,$=id=>document.getElementById(id),D=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),R=(a,b)=>a+Math.random()*(b-a),C=(n,a,b)=>Math.max(a,Math.min(b,n));
const color={ember:'#ffa36c',frost:'#85def0',storm:'#d9afff',void:'#b795ff',venom:'#90df82',radiant:'#fff0a2',gravity:'#a6a4ff',crystal:'#8cf1e9',siphon:'#e3c18c',rupture:'#ff8eab'},rocks=[{x:280,y:170,r:43},{x:660,y:420,r:49},{x:490,y:300,r:34}],SS=window.SpellSystem,bossTypes=['engine','mirror','voidboss','frostboss','splitboss','tempestboss','broodboss','sunboss','prismboss'],minibossTypes=['furnacehound','avalancheknight','stormchoir','sporemonarch','gravityjailer'];
const spriteNames=['player','chaser','shooter','charger','splitter','swarm','tank','wisp','golden','sentinel','crimson','healer','sniper','burrower','shieldbearer','mimic','mirror','voidmage','voidboss','frostboss','splitboss','splitA','splitB','engine','engine_core','engine_arm','voidboss_core','cinderhound','rimeweaver','thunderhead','sporebrute','sunlancer','riftstalker','shardsmith','graviton','vectorscribe','tempestboss','broodboss','sunboss','prismboss','pickup_health','pickup_mana','pickup_shield','missile','void_orb','mine','crystal','stone'],sprites={};
if(window.Image)for(const name of spriteNames){const image=new window.Image();image.src=`assets/images/current/${name}.png`;sprites[name]=image}
function drawSprite(name,x,y,size,angle=0,alpha=1,transform=null){const image=sprites[name];if(!image||!image.complete||!image.naturalWidth)return false;g.save();g.translate(x,y);g.rotate(angle);if(transform){g.translate(transform.x||0,transform.y||0);g.rotate(transform.rotate||0);g.scale(transform.scaleX??1,transform.scaleY??1)}g.globalAlpha=alpha;g.drawImage(image,-size/2,-size/2,size,size);g.restore();return true}
// Every combatant uses a real pose sheet.  The old standalone sprites remain as
// a fast fallback while sheets load and for non-combat scenery.
const animatedAtlases={},atlasFiles=['core-a','core-b','core-c','elemental-a','elemental-b','specials','bosses-a','bosses-b'];
if(window.Image)for(const name of atlasFiles){const image=new window.Image();image.src=`assets/images/animated/${name}.png`;animatedAtlases[name]=image}
const animatedSpriteRows={
  chaser:['core-a',0,5],shooter:['core-a',1,5],charger:['core-a',2,5],splitter:['core-a',3,5],swarm:['core-a',4,5],
  tank:['core-b',0,5],wisp:['core-b',1,5],golden:['core-b',2,5],sentinel:['core-b',3,5],crimson:['core-b',4,5],
  healer:['core-c',0,5],sniper:['core-c',1,5],burrower:['core-c',2,5],shieldbearer:['core-c',3,5],mimic:['core-c',4,5],
  mirror:['elemental-a',0,5],voidmage:['elemental-a',1,5],cinderhound:['elemental-a',2,5],rimeweaver:['elemental-a',3,5],thunderhead:['elemental-a',4,5],
  sporebrute:['elemental-b',0,5],sunlancer:['elemental-b',1,5],riftstalker:['elemental-b',2,5],shardsmith:['elemental-b',3,5],graviton:['elemental-b',4,5],
  vectorscribe:['specials',0,4],splitA:['specials',1,4],splitB:['specials',2,4],player:['specials',3,4],
  engine:['bosses-a',0,5],voidboss:['bosses-a',1,5],frostboss:['bosses-a',2,5],splitboss:['bosses-a',3,5],tempestboss:['bosses-a',4,5],
  broodboss:['bosses-b',0,3],sunboss:['bosses-b',1,3],prismboss:['bosses-b',2,3]
};
const animatedAlias={furnacehound:'cinderhound',avalancheknight:'shieldbearer',stormchoir:'thunderhead',sporemonarch:'sporebrute',gravityjailer:'graviton'};
function animationFrame(entity){
  if(!entity)return 0;
  if((entity.animHit||0)>0)return 4;
  if((entity.animAttack||0)>0)return 3;
  if((entity.charge||0)>0||entity.initializing)return 2;
  if((entity.attack||0)>0&&(entity.attack||0)<.28)return 2;
  if((entity.animMoving||0)>.08)return Math.sin((entity.animStride||0)*1.7)>-.15?1:0;
  return Math.sin((entity.age||time)*2.4)>.9?1:0;
}
function drawAnimatedSprite(name,x,y,size,angle=0,alpha=1,entity=null,transform=null,frameOverride=null,clipRadius=0){
  name=animatedAlias[name]||name;const spec=animatedSpriteRows[name],image=spec&&animatedAtlases[spec[0]];
  if(!spec||!image||!image.complete||!image.naturalWidth)return drawSprite(name,x,y,size,angle,alpha,transform);
  const frame=C(frameOverride??animationFrame(entity),0,4),cellW=image.naturalWidth/5,cellH=image.naturalHeight/spec[2];
  g.save();g.translate(x,y);g.rotate(angle);if(transform){g.translate(transform.x||0,transform.y||0);g.rotate(transform.rotate||0);g.scale(transform.scaleX??1,transform.scaleY??1)}
  if(clipRadius){g.beginPath();if(typeof clipRadius==='function')clipRadius(g);else g.arc(0,0,clipRadius,0,Math.PI*2);g.clip()}
  g.globalAlpha=alpha;g.drawImage(image,cellW*frame,cellH*spec[1],cellW,cellH,-size/2,-size/2,size,size);g.restore();return true
}
const animationProfiles={
  heavy:new Set(['tank','crimson','shieldbearer','sporebrute','avalancheknight','sporemonarch','gravityjailer','engine','broodboss','prismboss']),
  flying:new Set(['wisp','graviton','thunderhead','riftstalker','voidmage','voidboss','tempestboss']),
  agile:new Set(['chaser','charger','cinderhound','furnacehound','swarm','mirror','mimic','splitA']),
  caster:new Set(['shooter','sniper','rimeweaver','stormchoir','sunlancer','shardsmith','vectorscribe','healer','sunboss','frostboss'])
};
function enemyAnimation(e){
  const heavy=animationProfiles.heavy.has(e.type),flying=animationProfiles.flying.has(e.type),agile=animationProfiles.agile.has(e.type),caster=animationProfiles.caster.has(e.type),stride=e.animStride||0,moving=e.animMoving||0;
  const spawn=C(1-(e.animSpawn||0)/(e.spawnDuration||.38),0,1),spawnEase=1-Math.pow(1-spawn,3),attack=C((e.animAttack||0)/.24,0,1),hit=C((e.animHit||0)/.16,0,1),phase=C((e.animPhase||0)/.9,0,1),wind=e.attack>0&&e.attack<.2?(1-e.attack/.2):0;
  const step=Math.sin(stride*(heavy?1.15:agile?1.8:1.45)),float=flying?Math.sin(e.age*3+(e.x||0)*.01)*(1.6+(e.phase2?.6:0)):0;
  return{
    x:-Math.sin(attack*Math.PI)*(heavy?e.r*.1:e.r*.28)+Math.sin(e.age*53)*hit*(heavy?2:5),
    y:float+Math.abs(step)*(heavy?1.4:2.6)*moving-Math.sin(spawn*Math.PI)*e.r*.32,
    rotate:step*moving*(heavy?.006:agile?.022:.012),
    scaleX:(.2+.8*spawnEase)*(1+Math.sin(attack*Math.PI)*(heavy?.07:.16)+wind*.08+Math.sin(phase*Math.PI)*.2-hit*.08),
    scaleY:(.2+.8*spawnEase)*(1-Math.sin(attack*Math.PI)*(heavy?.035:.09)-wind*.045+Math.sin(phase*Math.PI)*.2+hit*.08),
    alpha:.2+.8*spawn
  }
}
let keys=new Set(),mouse={x:750,y:300,down:false},time=0,last=0,game;const particlePool=[];
function newGame(){let stats=SS.stats();return{phase:'ready',wave:1,stats,realm:window.RealmSystem?.current()?.id||'ember',player:{x:145,y:300,r:16,hp:stats.maxHp,mana:stats.maxMana,dash:0,inv:0,shield:0,surge:0,momentum:0,slow:0,burn:0,poison:0,slippery:0,slipX:0,slipY:0,statusTick:0,rupture:0,animStride:0,animMoving:0,animAttack:0,animHit:0,animDash:0},enemies:[],corpses:[],shots:[],hostile:[],curses:[],blasts:[],particles:[],lines:[],echoes:[],mines:[],crystals:[],paths:[],spawned:0,spawnTimer:0,kills:0,cooldown:0,noticeTime:0,hudClock:0,nextCastId:0,healBudget:new Map(),manaBudget:new Map(),eventsByCast:new Map(),overchargeCasts:new Set(),elementUse:{},formUse:{},damageSources:{},lastDamage:'',bossDamage:0,bossInitializing:null,secondWindUsed:false,fxQuality:1,fxFrame:.016}}
game=newGame();
SS.onMessage=message=>say(message,2.5);
SS.onTalentPurchased=()=>{const previous=game.stats,next=SS.stats();for(const mutation of game.mutations||[]){if(mutation==='Surge')next.manaRegen*=1.25;if(mutation==='Bulwark')next.damageTaken*=.9;if(mutation==='Overdrive'){next.damage*=1.18;next.cooldown*=.9}if(mutation==='Reprieve')next.moveSpeed*=1.1;if(mutation==='Harvest')next.killMana+=8;if(mutation==='Deep Well')next.maxMana+=45;if(mutation==='Glass Sigil'){next.damage*=1.42;next.damageTaken*=1.18}if(mutation==='Fleet Rune'){next.moveSpeed*=1.18;next.dashCooldown*=.8}if(mutation==='Effusion')next.cost*=.86;if(mutation==='Longshot'){next.projectileSpeed*=1.35;next.damage*=1.12}if(mutation==='Mender')next.waveHeal+=12;if(mutation==='Execution')next.critChance+=.14}game.stats=next;game.player.hp=Math.min(next.maxHp,game.player.hp+next.maxHp-previous.maxHp);game.player.mana=Math.min(next.maxMana,game.player.mana+next.maxMana-previous.maxMana)};
let editorPause=false,journalPause=false;
SS.onEditorChange=open=>{if(open&&game.phase==='playing'){game.phase='paused';editorPause=true;say('Spell Lab open · arena paused.')}else if(!open&&editorPause){game.phase='playing';editorPause=false;say('Spell ready. Back in the arena.')}};
if(window.EnemyJournal)window.EnemyJournal.onToggle=open=>{if(open&&game.phase==='playing'){game.phase='paused';journalPause=true;say('Enemy Journal open · arena paused.')}else if(!open&&journalPause){game.phase='playing';journalPause=false;say('Back in the arena.')}};
function say(t,d=2){$('status').textContent=t;game.noticeTime=d}
function optionalHook(label,callback){try{return callback?.()}catch(error){console.error(`Spellforge ${label} failed`,error);say(`${label} recovered · combat continues.`,2);return null}}
function start(mode='normal'){editorPause=false;journalPause=false;game=newGame();game.mode=typeof mode==='string'?mode:'normal';game.phase='playing';$('modal').classList.add('hidden');if(game.mode==='oneslot')SS.select(0);window.SpellFeatures?.started?.(game,rocks);window.SpellExpansion?.started?.(game,rocks);wave(game.mode==='bossrush'?5:1);if(game.mode==='training'){game.spawned=waveSize(1);const target=$('trainingTarget')?.value||'dummy',dummy=makeEnemy(target,670,300);if(target!=='dummy'){dummy.speed=0;dummy.attack=999}game.enemies=[dummy];say('Training room · test spells against the target.')}}$('start').onclick=()=>start();$('restart').onclick=()=>start();
function wave(n){game.wave=n;game.formation=['mixed','swarm','ranged','armored'][n%4];game.spawned=0;game.spawnTimer=.5;game.enemies=[];game.shots=[];game.hostile=[];game.curses=[];game.blasts=[];game.mines=[];game.crystals=[];game.paths=[];game.bossDamage=0;game.bossInitializing=null;const realm=window.RealmSystem?.current();$('wave').textContent=`Wave ${n} · ${realm?.name||'endless'}`;say(`Wave ${n}: ${realm?.element||game.formation} ${game.formation} formation!`,2);window.SpellAudio?.play('wave');optionalHook('wave event',()=>window.SpellFeatures?.waveStarted?.(game));optionalHook('route event',()=>window.SpellExpansion?.waveStarted?.(game))}
function effectiveWave(wave){return window.RealmSystem?.progressionWave?.(wave)||wave}
function bossTier(wave){return Math.max(0,Math.floor((effectiveWave(wave)-5)/5))}
function difficultyScale(wave){if(window.RealmSystem?.power)return window.RealmSystem.power(wave);const n=Math.max(0,wave-1);return 1+n*.08+n*n*.006}
function bossHealth(type,wave){const tier=bossTier(wave),base=type==='engine'?650:type==='voidboss'?850:type==='frostboss'?760:type==='splitboss'?720:type==='tempestboss'?820:type==='broodboss'?900:type==='sunboss'?860:type==='prismboss'?940:400;return Math.round(base*(1.25+.55*tier+.13*tier*tier)*(window.RealmSystem?.basePower?.()||1))*2}
function makeEnemy(type,x,y){const wave=game.wave,progress=effectiveWave(wave),spec={chaser:[32,19,108],shooter:[27,16,80],charger:[35,18,95],splitter:[28,18,105],tank:[62,25,62],wisp:[22,14,145],swarm:[13,11,160],sentinel:[75,23,48],crimson:[88,26,56],golden:[85,34,62],voidmage:[72,17,92],healer:[60,19,85],sniper:[42,16,64],burrower:[48,18,106],shieldbearer:[95,22,74],mimic:[65,19,108],cinderhound:[48,19,145],rimeweaver:[58,18,88],thunderhead:[52,18,120],sporebrute:[105,24,64],sunlancer:[70,19,105],riftstalker:[62,18,132],shardsmith:[90,22,72],graviton:[86,20,76],vectorscribe:[64,19,74],furnacehound:[340,29,128],avalancheknight:[430,31,68],stormchoir:[330,27,98],sporemonarch:[480,34,58],gravityjailer:[450,31,72],dummy:[100000,25,0],engine:[bossHealth('engine',wave),49,58],mirror:[bossHealth('mirror',wave),21,145],voidboss:[bossHealth('voidboss',wave),37,86],frostboss:[bossHealth('frostboss',wave),42,76],splitboss:[bossHealth('splitboss',wave),39,90],tempestboss:[bossHealth('tempestboss',wave),45,82],broodboss:[bossHealth('broodboss',wave),48,62],sunboss:[bossHealth('sunboss',wave),45,75],prismboss:[bossHealth('prismboss',wave),47,68],splitA:[210,25,115],splitB:[210,25,115]}[type]||[45,18,90],hp=Math.round(spec[0]*(bossTypes.includes(type)||minibossTypes.includes(type)||type==='dummy'?1:difficultyScale(wave))),eliteChance=Math.min(.58,.08+Math.max(0,progress-4)*.006+(window.RealmSystem?.eliteBonus(wave)||0)+(game.waveEvent==='fortify'?.18:0)+(game.route?.elite||0)),eliteWave=window.RealmSystem?.intro?.()?8:4,trait=!bossTypes.includes(type)&&!minibossTypes.includes(type)&&type!=='dummy'&&progress>=eliteWave&&Math.random()<eliteChance?['shielded','swift','volatile','draining'][Math.floor(R(0,4))]:null;return{x,y,r:spec[1],hp:trait==='shielded'?Math.round(hp*1.5):hp,max:trait==='shielded'?Math.round(hp*1.5):hp,type,trait,affinity:window.RealmSystem?.current()?.element||'Ember',speed:(spec[2]+Math.min(type==='mirror'?85:60,progress*2.5))*(trait==='swift'?1.4:1)*(game.waveEvent==='frenzy'?1.25:1),attack:type==='crimson'?3:type==='voidboss'?2:type==='voidmage'?3:R(.5,1.3),burn:0,poison:0,slow:0,flash:0,castGuard:0,charge:0,dashTime:0,dx:0,dy:0,age:0,face:0,summon:6,special:R(4.5,6.5),pattern:0,dodge:0,ward:0,animSpawn:.38,animHit:0,animAttack:0,animPhase:0,animStride:R(0,7),animMoving:0,castDamage:new Map(),orbs:type==='voidboss'?6:0,orbTimer:1.5,orbRecharge:4,mana:type==='mirror'?game.stats.maxMana*2:0,maxMana:type==='mirror'?game.stats.maxMana*2:0}}
function angleDelta(from,to){return Math.atan2(Math.sin(to-from),Math.cos(to-from))}
const bossIntroDurations={engine:4.15,mirror:3.15,voidboss:3.7,frostboss:3.25,splitboss:3.35,tempestboss:3.15,broodboss:3.45,sunboss:3.25,prismboss:3.5};
const bossIntroNames={engine:'Twelvefold Engine',mirror:'Counterforge',voidboss:'Void Sovereign',frostboss:'Glacial Architect',splitboss:'Twin Crucible',tempestboss:'Tempest Crown',broodboss:'Brood Cathedral',sunboss:'Solar Regent',prismboss:'Prism Warden'};
function beginBossInitialization(e){
  if(!bossTypes.includes(e.type))return;
  e.initializing=true;e.introTime=0;e.introDuration=bossIntroDurations[e.type]||3;e.spawnDuration=e.introDuration;e.animSpawn=0;e.bodyAngle=-Math.PI/2;e.introArms=0;e.introBeat=-1;e.attack=99;e.special=99;e.summon=99;game.bossInitializing=e;
  if(e.type==='mirror')e.introBlocks=SS.current().map(item=>({id:item.id,name:SS.block(item.id)?.name||item.id,kind:SS.block(item.id)?.kind||item.kind||'control'}));
  if(e.type==='engine'){
    e.x=W/2;e.y=H/2;for(let i=rocks.length-1;i>=0;i--)if(D(rocks[i],e)<rocks[i].r+e.r+24){particles(rocks[i].x,rocks[i].y,'#e7c98f',15,'shard',.7);rocks.splice(i,1)}
    if(D(game.player,e)<e.r+105){game.player.x=145;game.player.y=H/2}particles(e.x,e.y,'#f8d181',6,'ring',.7);say('Twelvefold Engine assembly initiated.',4.3)
  }else say(`${bossIntroNames[e.type]} is entering the arena.`,e.introDuration+.2)
}
function spawn(){
  let side=Math.floor(R(0,4)),x=side===0?28:side===1?W-28:R(30,W-30),y=side===2?28:side===3?H-28:R(30,H-30);
  if(D({x,y},game.player)<200){x=W-x;y=H-y}
  let pool=window.RealmSystem?.enemyPool(game.wave)||['chaser','chaser','shooter'];
  if(game.wave>=10&&Object.entries(game.elementUse).sort((a,b)=>b[1]-a[1])[0]?.[0]==='ember')pool.push('shieldbearer');
  if(game.formation==='swarm')pool.push('splitter','chaser','chaser');if(game.formation==='ranged')pool.push('sniper','shooter','wisp');if(game.formation==='armored')pool.push('tank','shieldbearer','sentinel');
  const fallbackBoss=game.wave>=20&&game.wave%20===0?'voidboss':game.wave>=25&&game.wave%40===25?'frostboss':game.wave>=35&&game.wave%40===35?'splitboss':game.wave%10===0?'mirror':'engine',baseType=game.wave%5===0&&game.spawned===0?(window.RealmSystem?.boss(game.wave,fallbackBoss)||fallbackBoss):pool[Math.floor(R(0,pool.length))],type=window.SpellExpansion?.chooseSpawnType?.(baseType,game,pool)??baseType,e=makeEnemy(type,x,y);
  const margin=bossTypes.includes(type)?e.r+37:e.r+15;if(type==='engine'){x=W/2;y=H/2}
  e.x=C(x,margin,W-margin);e.y=C(y,margin,H-margin);
  if(blocked(e.x,e.y,e.r)){
    const corners=[{x:margin+10,y:margin+10},{x:W-margin-10,y:margin+10},{x:margin+10,y:H-margin-10},{x:W-margin-10,y:H-margin-10}];
    Object.assign(e,corners.sort((a,b)=>D(b,game.player)-D(a,game.player))[0])
  }
  e.resistEmber=type==='shieldbearer'&&Object.entries(game.elementUse).sort((a,b)=>b[1]-a[1])[0]?.[0]==='ember';e.squad=Math.floor(game.spawned/3);game.enemies.push(e);game.spawned++;beginBossInitialization(e);window.EnemyJournal?.seen(type);window.SpellExpansion?.enemySpawned?.(e,game);
  window.SpellAudio?.play(bossTypes.includes(type)?'boss':'enemySpawn',C(e.x/W*2-1,-1,1));
  if(type==='engine'&&!e.initializing)say('The Twelvefold Engine has arrived!',2.5);
  if(type==='mirror')say('Counterforge copied your active spell!',2.5);
  if(type==='voidboss')say('The Void Sovereign is weaving a spell!',3)
  if(type==='frostboss')say('The Glacial Architect raises its walls!',3);
  if(type==='splitboss')say('The Twin Crucible approaches!',3)
  if(type==='tempestboss')say('The Tempest Crown electrifies the arena!',3);
  if(type==='broodboss')say('The Brood Cathedral takes root!',3);
  if(type==='sunboss')say('The Solar Regent opens its aperture!',3);
  if(type==='prismboss')say('The Prism Warden seals the arena!',3);
}
function blocked(x,y,r){return x<r||x>W-r||y<r||y>H-r||[...rocks,...game.crystals].some(o=>Math.hypot(x-o.x,y-o.y)<o.r+r)}
function move(o,vx,vy,dt){const ox=o.x,oy=o.y;let x=o.x+vx*dt,y=o.y+vy*dt;if(!blocked(x,o.y,o.r))o.x=x;if(!blocked(o.x,y,o.r))o.y=y;if('animStride'in o){const distance=Math.hypot(o.x-ox,o.y-oy);if(distance>.01){o.animMoving=1;o.animStride+=distance/Math.max(8,o.r)}}}
function particles(x,y,col,n=8,style='',power=1){
  const quality=game?.fxQuality??1,low=!!window.SpellFeatures?.settings?.lowEffects,stressed=(game?.fxFrame||0)>.025,cap=low?140:Math.round((stressed?320:560)*Math.max(.55,quality));n=Math.max(1,Math.ceil(n*(low?.32:1)*quality));n=Math.min(n,Math.max(0,cap-game.particles.length));if(!n)return;
  if(!style){const tone=col.toLowerCase();style=tone.includes('ff7')||tone.includes('ff9')||tone.includes('ffa')?'ember':tone.includes('9ce')||tone.includes('85d')||tone.includes('c6e')?'shard':tone.includes('79d')||tone.includes('8fe')?'spore':tone.includes('bd7')||tone.includes('ad6')||tone.includes('c78')?'mote':'spark'}
  for(let i=0;i<n;i++){const angle=R(0,Math.PI*2),slow=['mote','spore','smoke','ring'].includes(style),speed=R(slow?12:35,slow?70:175)*power,life=R(style==='ring'?.35:.22,style==='mote'||style==='smoke'?1:.68),a=particlePool.pop()||{};Object.assign(a,{x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life,max:life,col,style,size:R(2.5,style==='spore'?7:5.5),spin:R(0,7),turn:R(-8,8),drag:style==='smoke'?.92:.975,gravity:style==='ember'?-28:style==='droplet'?90:0});game.particles.push(a)}
}
function compile(script){
  const expanded=[];let index=0;
  function parse(stops=[],conditions=[],event='cast'){
    while(index<script.length&&expanded.length<96){const item=script[index++],id=item.id;
      if(stops.includes(id)){index--;return}
      if(['ifStatus','ifMana','ifSurrounded'].includes(id)){const condition={id,value:item.value??SS.parameters[id].default};parse(['else','endIf'],[...conditions,condition],event);if(script[index]?.id==='else'){index++;parse(['endIf'],[...conditions,{...condition,negate:true}],event)}if(script[index]?.id==='endIf')index++;continue}
      if(id==='repeatGroup'){const start=index,before=expanded.length;parse(['endRepeat'],conditions,event);const chunk=expanded.slice(before);if(script[index]?.id==='endRepeat')index++;for(let n=1;n<Math.min(3,item.value||2)&&expanded.length<96;n++)expanded.push(...chunk.map(x=>({...x})));continue}
      if(['onHit','onKill','onBounce','onExpire'].includes(id)){parse(['endEvent'],conditions,id);if(script[index]?.id==='endEvent')index++;continue}
      if(['else','endIf','endEvent','endRepeat'].includes(id))continue;
      expanded.push({...item,conditions,event})
    }
  }
  parse();const state={elements:[],motions:[],behaviors:[],params:{},next:{repeat:1,wait:0,ifNear:null,ifWounded:null},aim:1},volleys=[];
  for(const item of expanded){if(item.value!==undefined)state.params[item.id]=item.value;if(item.kind==='element'&&!state.elements.includes(item.id))state.elements.push(item.id);else if(item.kind==='elasticity'){if(item.id==='straight')state.motions=[];else if(!state.motions.includes(item.id))state.motions.push(item.id)}else if(item.kind==='behavior'){if(item.id==='impact')state.behaviors=[];else if(!state.behaviors.includes(item.id))state.behaviors.push(item.id)}else if(item.kind==='control'){if(item.id==='aim')state.aim=item.value||1;else state.next[item.id]=item.value??SS.parameters[item.id]?.default}else if(item.kind==='shape'){const rawMutations=window.SpellExpansion?.mutationFor?.(item.uid)||[],mutations=Array.isArray(rawMutations)?[...rawMutations]:[rawMutations];volleys.push({shape:item.id,elements:[...state.elements],motions:[...state.motions],behaviors:[...state.behaviors],params:{...state.params},control:{...state.next},conditions:item.conditions,event:item.event,aim:state.aim,uid:item.uid,mutations,mutation:mutations[0]||null,mastery:window.SpellExpansion?.masteryLevel?.(item.id)||0});state.next={repeat:1,wait:0,ifNear:null,ifWounded:null}}}return volleys
}
function mutationCount(o,id){let count=0;if(o?.mutations)for(const mutation of o.mutations)if(mutation===id)count++;return count||(o?.mutation===id?1:0)}
function volleyCost(s){return Math.max(5,({bolt:11,fan:19,lance:23,nova:30,scatter:23,orb:21,spiral:26,barrage:27,beam:24,arc:22,ring:27,mine:23}[s.shape]||11)+Math.max(0,s.elements.length-1)*5+Math.max(0,s.motions.length-1)*4+s.behaviors.reduce((n,id)=>n+({echo:10,split:6,detonate:7,pierce:5,chain:7,shatter:6,knockback:5,mark:6,absorb:7,fuse:7}[id]||0),0)+(s.motions.includes('bounce')?Math.max(0,(s.params.bounce||2)-2)*2:0)+(s.shape==='nova'?Math.max(0,(s.params.nova||8)-8)*2:0)-(s.mastery||0))}
function formBonus(shape){const leading=Object.entries(game.formUse).sort((a,b)=>b[1]-a[1])[0]?.[0];return game.stats.specialist&&leading===shape?1.18:1}
function shot(s,a,origin=game.player,depth=0,scale=1,castId=0,caster=null){
  if(s.shape==='arc'){const reach=260,target=caster?game.player:game.enemies.filter(e=>e.hp>0&&D(e,origin)<reach&&Math.cos(Math.atan2(e.y-origin.y,e.x-origin.x)-a)>.35).sort((x,y)=>D(x,origin)-D(y,origin))[0];if(target){let b={damage:(caster?8:25*scale*game.stats.damage*formBonus('arc')),elements:s.elements,behaviors:s.behaviors,element:s.elements.at(-1)||'storm',hit:new Set(),castId,depth,vx:Math.cos(a)*500,vy:Math.sin(a)*500,params:s.params};if(caster)mirrorHit({...b,caster,x:target.x,y:target.y});else damage(target,b);game.lines.push({x:origin.x,y:origin.y,tx:target.x,ty:target.y,life:.2})}return}
  if(s.shape==='ring'){const radius=125;for(const e of (caster?[game.player]:game.enemies))if(e.hp>0&&D(e,origin)<radius+e.r){const b={damage:(caster?7:12*scale*game.stats.damage*formBonus('ring')),elements:s.elements,behaviors:s.behaviors,element:s.elements.at(-1)||'storm',hit:new Set(),castId,depth,vx:Math.cos(a)*500,vy:Math.sin(a)*500,params:s.params};if(caster)mirrorHit({...b,caster,x:e.x,y:e.y});else damage(e,b)}game.blasts.push({x:origin.x,y:origin.y,radius,life:.45,max:.45,col:color[s.elements.at(-1)]||'#d9afff'});return}
  if(s.shape==='mine'){game.mines.push({x:origin.x+Math.cos(a)*90,y:origin.y+Math.sin(a)*90,life:12,s,castId,caster,scale,depth});return}
  let count=s.shape==='nova'?(s.params?.nova||8):({scatter:5,fan:3,spiral:4,barrage:5,beam:3}[s.shape]||1);if(['bolt','fan','beam'].includes(s.shape))count+=2*mutationCount(s,'forked');
  for(let i=0;i<count;i++){
    let t=s.shape==='nova'?a+i*Math.PI*2/count:s.shape==='spiral'?a+time*2.5+i*Math.PI/2:s.shape==='beam'?a:a+(i-(count-1)/2)*(s.shape==='scatter'?.16:s.shape==='barrage'?.08:s.shape==='fan'?(s.params?.fan||.25):.23);
    let v=(s.shape==='lance'?720:s.shape==='beam'?820:s.shape==='orb'?320:560)*(caster?.82:game.stats.projectileSpeed)*(s.motions.includes('linger')?.5:1);
    const crit=!caster&&Math.random()<game.stats.critChance?2:1;
    let lane=s.shape==='beam'?(i-1)*10:0;
    game.shots.push({x:origin.x+Math.cos(t)*21-Math.sin(t)*lane,y:origin.y+Math.sin(t)*21+Math.cos(t)*lane,vx:Math.cos(t)*v,vy:Math.sin(t)*v,r:s.shape==='orb'?15:s.shape==='lance'?10:s.shape==='beam'?5:7,life:(s.motions.includes('return')?2.5:s.motions.includes('orbit')?2:s.shape==='lance'?1:1.6)*(s.motions.includes('linger')?1.8:1),age:0,waveOffset:0,returnCaught:false,absorbed:0,
      damage:Math.min(caster?14+Math.min(10,bossTier(game.wave)*1.5):Infinity,({lance:19,fan:9,nova:8,scatter:7,orb:27,spiral:10,barrage:7,beam:11}[s.shape]||16)*scale*game.stats.damage*crit*(caster?1:((game.stats.boltMaster&&['bolt','beam','arc'].includes(s.shape))||(game.stats.burstMaster&&['fan','nova','ring','scatter'].includes(s.shape))?1.2:1)*(game.stats.momentum?1+game.player.momentum*.15:1)*formBonus(s.shape)*(1+(s.mastery||0)*.025)*(mutationCount(s,'hungry')?1+Math.min(.5*mutationCount(s,'hungry'),game.kills*.008*mutationCount(s,'hungry')):1))),elements:[...s.elements],motions:[...s.motions],behaviors:[...s.behaviors],params:{...s.params},element:s.elements.at(-1)||'ember',beam:s.shape==='beam',caster,mutations:[...(s.mutations||[])],mutation:s.mutation,bounces:s.motions.includes('bounce')?(s.params?.bounce||2):0,pierce:s.shape==='lance'?3:s.behaviors.includes('pierce')?2:0,hit:new Set(),depth,castId,orbitAngle:t,orbitRadius:55})
  }
}
function conditionsTrue(v,origin=game.player,target=null,caster=null){const actor=caster||game.player,enemies=caster?[game.player]:game.enemies.filter(e=>e.hp>0);return(v.control.ifNear===null||enemies.some(e=>D(e,origin)<=v.control.ifNear))&&(v.control.ifWounded===null||actor.hp/(caster?actor.max:game.stats.maxHp)*100<=v.control.ifWounded)&&v.conditions.every(c=>{let result=c.id==='ifMana'?actor.mana/(caster?actor.maxMana:game.stats.maxMana)*100<c.value:c.id==='ifSurrounded'?enemies.filter(e=>D(e,origin)<210).length>=c.value:c.id==='ifStatus'?!!(target||enemies[0])?.[({1:'slow',2:'burn',3:'poison'})[c.value]]:true;return c.negate?!result:result})}
function aimAngle(v,origin,base,caster=null,target=null){if(v.aim===1)return base;const candidates=caster?[game.player]:game.enemies.filter(e=>e.hp>0);const chosen=target||((v.aim===3?[...candidates].sort((a,b)=>a.hp-b.hp):v.aim===4?[candidates[Math.floor(Math.random()*candidates.length)]]:[...candidates].sort((a,b)=>D(a,origin)-D(b,origin)))[0]);return chosen?Math.atan2(chosen.y-origin.y,chosen.x-origin.x):base}
function fireEvent(kind,b,origin,target){const rule=game.eventsByCast.get(b.castId);if(!rule||b.depth>=2||rule.budget<=0)return;const forms=rule.volleys.filter(v=>v.event===kind&&conditionsTrue(v,origin,target,rule.caster)).slice(0,rule.budget);for(const v of forms){const n=Math.min(3,v.control.repeat||1);for(let i=0;i<n&&rule.budget>0;i++){rule.budget--;const a=aimAngle(v,origin,Math.atan2(b.vy,b.vx),rule.caster,target),at=time+(v.control.wait||0)+i*.12;if(at>time)game.echoes.push({at,s:v,a,origin:{x:origin.x,y:origin.y},castId:b.castId,scale:.65,caster:rule.caster,depth:b.depth+1});else shot(v,a,origin,b.depth+1,.65,b.castId,rule.caster)}}}
function cast(){
  const p=game.player,volleys=compile(SS.current());if(!volleys.length){say('Add a Form block to the script before casting.',1.5);game.cooldown=.25;return}
  const active=volleys.filter(v=>v.event==='cast'&&conditionsTrue(v,p));
  if(!active.length){say('No condition in this script is true right now.',1);game.cooldown=.25;return}
  const cost=Math.ceil((active.reduce((n,v)=>n+volleyCost(v)*(v.control.repeat||1),0)+volleys.filter(v=>v.event!=='cast').reduce((n,v)=>n+volleyCost(v)*.3,0))*game.stats.cost);
  if(p.mana<cost){say(`Need ${cost} mana for this script. Shorten it or wait.`,1.1);game.cooldown=.18;return}
  const fullMana=p.mana>=game.stats.maxMana-1;p.mana-=cost;p.animAttack=.22;if(game.mode==='training'){game.trainingCasts=(game.trainingCasts||0)+1;game.trainingMana=(game.trainingMana||0)+cost}game.overcharged=game.stats.overcharge&&fullMana;game.cooldown=(.25+active.length*.12+active.reduce((n,v)=>n+(v.control.repeat||1)*.08,0))*game.stats.cooldown;game.lastCastCooldown=game.cooldown;window.SpellAudio?.play('cast');const castElements=[...new Set(active.flatMap(v=>v.elements))];if(window.SpellAudio?.playElements)window.SpellAudio.playElements(castElements);else for(const id of castElements)window.SpellAudio?.play(`element:${id}`);
  const base=Math.atan2(mouse.y-p.y,mouse.x-p.x),castId=++game.nextCastId;if(game.overcharged)game.overchargeCasts.add(castId);for(const v of active)for(const id of v.elements)game.elementUse[id]=(game.elementUse[id]||0)+1;game.healBudget.set(castId,4);game.manaBudget.set(castId,6);game.eventsByCast.set(castId,{volleys,caster:null,budget:18});if(game.eventsByCast.size>150)game.eventsByCast.delete(game.eventsByCast.keys().next().value);if(game.overchargeCasts.size>150)game.overchargeCasts.delete(game.overchargeCasts.values().next().value);
  if(game.healBudget.size>200){let oldest=game.healBudget.keys().next().value;game.healBudget.delete(oldest);game.manaBudget.delete(oldest)}
  let cursor=0;for(const v of active){game.formUse[v.shape]=(game.formUse[v.shape]||0)+1;const a=aimAngle(v,p,base);cursor+=v.control.wait||0;for(let j=0;j<(v.control.repeat||1);j++){let at=time+cursor+j*.16;if(at<=time)shot(v,a,p,0,1,castId);else game.echoes.push({at,s:v,a,origin:{x:p.x,y:p.y},castId,scale:1});if(v.behaviors.includes('echo'))game.echoes.push({at:at+(v.params?.echo||.3),s:v,a,origin:{x:p.x,y:p.y},castId,scale:.55})}cursor+=(v.control.repeat-1)*.16+.13}if(game.echoes.length>250)game.echoes.splice(0,game.echoes.length-250);window.SpellExpansion?.cast?.(active,game)
}
function enterBossPhase(e){
  if(e.phase2)return;e.phase2=true;e.animPhase=.9;e.hp=Math.max(e.hp,e.max*.5);e.ward=1.15;e.speed*=1.22;e.attack=Math.min(e.attack,.8);particles(e.x,e.y,'#fff0b0',35,'spark',1.2);particles(e.x,e.y,'#fff0b0',5,'ring',1);window.SpellAudio?.play('phase');say(`${({engine:'Twelvefold Engine',mirror:'Counterforge',voidboss:'Void Sovereign',frostboss:'Glacial Architect',splitboss:'Twin Crucible',tempestboss:'Tempest Crown',broodboss:'Brood Cathedral',sunboss:'Solar Regent',prismboss:'Prism Warden'})[e.type]||'Boss'} enters phase two!`,2.5);if(e.type==='mirror')e.loadout=(SS.selected+1)%3;window.SpellFeatures?.phaseChanged?.(e,game)
}
function applyEnemyDamage(e,amount,b){
  if(e.hidden||e.initializing||amount<=0)return 0;
  const boss=bossTypes.includes(e.type),castId=b?.castId||0;
  if(boss&&e.ward>0)return 0;
  const progress=effectiveWave(game.wave);if(castId&&(boss||(game.mode!=='training'&&progress>=10))){const ratio=boss ? .11 : e.trait ? .45 : Math.max(.55,.9-(progress-10)*.01),limit=e.max*ratio,used=e.castDamage.get(castId)||0,remaining=Math.max(0,limit-used);if(amount>remaining)e.castGuard=.15;amount=Math.min(amount,remaining);e.castDamage.set(castId,used+amount);if(e.castDamage.size>30)e.castDamage.delete(e.castDamage.keys().next().value)}
  e.hp-=amount;if(b)e.lastHit=b;
  if(amount>0)e.animHit=.16;if(boss&&!e.phase2&&e.hp<=e.max*.5)enterBossPhase(e);
  return amount
}
function damage(e,b){
  if(b.hit.has(e))return;b.hit.add(e);const has=id=>b.elements.includes(id),does=id=>b.behaviors.includes(id);
  let dealt=b.damage*(has('radiant')&&e.hp<e.max*.5?1.35:1)*(e.rupture>0?1.18:1)*(e.mark>0?1.25:1)*(game.overchargeCasts.has(b.castId)?1.25:1)*Math.max(.65,1-Math.max(0,b.elements.length-2)*.07);if(e.hidden)return;if(e.type==='shieldbearer'&&Math.cos(Math.atan2(b.vy,b.vx)-e.face)<-.2){dealt*=.25;window.SpellAudio?.play('shield',C(e.x/W*2-1,-1,1))}if(e.resistEmber&&has('ember'))dealt*=.65;dealt=applyEnemyDamage(e,dealt,b);if(dealt<=0)return;window.SpellExpansion?.damageNumber?.(e,dealt);e.flash=.1;particles(e.x,e.y,color[b.element]||'#e8d6ad',7);window.SpellAudio?.play('hit',C(e.x/W*2-1,-1,1));
  if(game.mode==='training'){game.trainingDamage=(game.trainingDamage||0)+dealt;e.hp=Math.max(1,e.hp)}
  if(has('ember'))e.burn=Math.max(e.burn,2.5);if(has('frost')){e.slow=Math.max(e.slow,2);e.wet=Math.max(e.wet||0,3)}
  if(has('ember')&&has('frost')){for(const other of game.enemies)if(other!==e&&other.hp>0&&D(other,e)<95){applyEnemyDamage(other,dealt*.25,b);other.slow=Math.max(other.slow,1)}particles(e.x,e.y,'#c6edf1',20)}
  if(has('void')&&has('radiant')){for(const other of game.enemies)if(other!==e&&other.hp>0&&D(other,e)<115)applyEnemyDamage(other,dealt*.4,b);game.blasts.push({x:e.x,y:e.y,radius:115,life:.4,max:.4,col:'#d4b9ff'})}
  if(has('gravity'))for(const other of game.enemies)if(other!==e&&other.hp>0&&D(other,e)<170){const dx=e.x-other.x,dy=e.y-other.y,d=Math.hypot(dx,dy)||1;move(other,dx/d*140,dy/d*140,.16)}
  if(has('crystal')&&game.crystals.length<24){game.crystals.push({x:e.x,y:e.y,r:20,life:5});particles(e.x,e.y,'#9ce9f4',14)}
  if(has('venom')){e.poison=Math.min(5,(e.poison||0)+1);e.poisonTime=4}
  if(has('rupture'))e.rupture=3;
  if(has('void')&&game.mode!=='noheal'){let budget=game.healBudget.get(b.castId)||0,heal=Math.min(budget,dealt*.12);game.player.hp=Math.min(game.stats.maxHp,game.player.hp+heal);game.healBudget.set(b.castId,budget-heal)}
  if(has('siphon')){let budget=game.manaBudget.get(b.castId)||0,gain=Math.min(budget,dealt*.13);game.player.mana=Math.min(game.stats.maxMana,game.player.mana+gain);game.manaBudget.set(b.castId,budget-gain)}
  if(has('storm')||does('chain')){let other=game.enemies.filter(v=>v!==e&&v.hp>0&&D(v,e)<(does('chain')?180:(e.wet>0?245:155))).sort((a,z)=>D(a,e)-D(z,e))[0];if(other){applyEnemyDamage(other,dealt*(does('chain')?.65:.5),b);game.lines.push({x:e.x,y:e.y,tx:other.x,ty:other.y,life:.16});particles(other.x,other.y,color.storm,5)}}
  if(does('mark'))e.mark=Math.max(e.mark||0,5);
  if(does('split')&&b.depth===0){let a=Math.atan2(b.vy,b.vx),angle=b.params?.split||.65;for(let t of [-angle,angle])shot({shape:'bolt',elements:b.elements,motions:[],behaviors:[],params:{}},a+t,{x:e.x,y:e.y},1,.5,b.castId)}
  if(does('detonate')){for(let other of game.enemies)if(other!==e&&other.hp>0&&D(other,e)<85)applyEnemyDamage(other,dealt*.5,b);particles(e.x,e.y,color[b.element]||'#e8d6ad',16)}
  if(does('knockback')){let a=Math.atan2(b.vy,b.vx);move(e,Math.cos(a)*95,Math.sin(a)*95,1)}
  fireEvent('onHit',b,e,e);if(e.hp<=0){particles(e.x,e.y,'#fff3ce',14);fireEvent('onKill',b,e,e);e.killEventFired=true}
}
function mirrorHit(b){
  const p=game.player,e=b.caster,has=id=>b.elements.includes(id),does=id=>b.behaviors.includes(id);
  if(b.hit.has(p))return;b.hit.add(p);const vulnerable=p.inv<=0;
  hurt(b.damage*(has('radiant')&&p.hp<game.stats.maxHp*.5?1.2:1),false,'Counterforge spell');
  if(!vulnerable)return;
  if(has('frost'))p.slow=Math.max(p.slow,1.5);
  if(has('ember'))p.burn=Math.max(p.burn,2);
  if(has('venom'))p.poison=Math.max(p.poison,2.5);
  if(has('rupture'))p.rupture=Math.max(p.rupture,2);
  if(e?.hp>0&&has('void'))e.hp=Math.min(e.max,e.hp+Math.min(4,b.damage*.18));
  if(e?.hp>0&&has('siphon'))e.mana=Math.min(e.maxMana,e.mana+Math.min(6,b.damage*.4));
  if(does('knockback'))move(p,b.vx/Math.hypot(b.vx,b.vy)*36,b.vy/Math.hypot(b.vx,b.vy)*36,1);
  if(does('split')&&b.depth===0){let a=Math.atan2(b.vy,b.vx),angle=b.params?.split||.65;for(let t of [-angle,angle])shot({shape:'bolt',elements:b.elements,motions:[],behaviors:[],params:{}},a+t,{x:b.x,y:b.y},1,.18,b.castId,e)}
  if(does('detonate')){particles(p.x,p.y,color[b.element]||'#f2a09c',16);p.slow=Math.max(p.slow,.5)}
  if(has('storm')||does('chain')){let a=Math.atan2(p.y-b.y,p.x-b.x);shot({shape:'bolt',elements:b.elements,motions:[],behaviors:[],params:{}},a,{x:b.x-15*Math.cos(a),y:b.y-15*Math.sin(a)},1,.15,b.castId,e)}
  fireEvent('onHit',b,p,p);if(p.hp<=0)fireEvent('onKill',b,p,p)
}
function addGuidance(b,target,dt,strength){
  const speed=Math.hypot(b.vx,b.vy)||1,ux=b.vx/speed,uy=b.vy/speed,dx=target.x-b.x,dy=target.y-b.y,distance=Math.hypot(dx,dy)||1,tx=dx/distance,ty=dy/distance,dot=tx*ux+ty*uy;
  // Guidance is acceleration layered onto the shot's existing momentum. Only
  // sideways steering and forward thrust are added, so homing cannot erase or
  // replace the velocity supplied by its Form, Velocity, or Accelerate.
  const assist=Math.max(0,dot)*.12;let steerX=tx-ux*dot,steerY=ty-uy*dot;
  if(dot<0&&Math.hypot(steerX,steerY)<.001){steerX=-uy;steerY=ux}
  b.vx+=(steerX+ux*assist)*strength*dt;
  b.vy+=(steerY+uy*assist)*strength*dt;
}
function guidanceTarget(b,dt){
  if(b.caster)return game.player;
  b.guidanceClock=(b.guidanceClock||0)-dt;if(b.guidanceTarget?.hp>0&&b.guidanceClock>0)return b.guidanceTarget;
  let best=null,bestDistance=Infinity,bestMarked=false;for(const e of game.enemies){if(e.hp<=0)continue;const marked=e.mark>0,distance=(e.x-b.x)**2+(e.y-b.y)**2;if((marked&&!bestMarked)||(marked===bestMarked&&distance<bestDistance)){best=e;bestDistance=distance;bestMarked=marked}}
  b.guidanceTarget=best;b.guidanceClock=.1;return best
}
function updateShots(dt){
  const fuseGroups=new Map();for(const shot of game.shots)if(shot.life>0&&!shot.caster&&shot.behaviors.includes('fuse')){const group=fuseGroups.get(shot.castId);if(group)group.push(shot);else fuseGroups.set(shot.castId,[shot])}
  for(let b of game.shots){
    b.life-=dt;b.age+=dt;const has=id=>b.motions.includes(id);
    const living=mutationCount(b,'living');if(has('seek')||living){const target=guidanceTarget(b,dt);if(target)addGuidance(b,target,dt,living?430*living:850)}
    if(has('accelerate')){b.vx*=1+dt*.7;b.vy*=1+dt*.7;b.damage*=1+dt*.3}
    if((has('boomerang')||has('return'))&&b.age>.65){let target=b.caster||game.player,a=Math.atan2(target.y-b.y,target.x-b.x),v=Math.hypot(b.vx,b.vy);b.vx=b.vx*.84+Math.cos(a)*v*.16;b.vy=b.vy*.84+Math.sin(a)*v*.16;if(has('return')&&D(b,target)<target.r+b.r+8&&!b.returnCaught){b.returnCaught=true;b.life=0;if(b.caster)b.caster.mana=Math.min(b.caster.maxMana,b.caster.mana+4);else game.player.mana=Math.min(game.stats.maxMana,game.player.mana+4)}}
    if(has('orbit')){let target=b.caster||game.player;b.orbitAngle+=dt*4;b.x=target.x+Math.cos(b.orbitAngle)*b.orbitRadius;b.y=target.y+Math.sin(b.orbitAngle)*b.orbitRadius}
    else{b.x+=b.vx*dt;b.y+=b.vy*dt;if(has('wave')){let speed=Math.hypot(b.vx,b.vy)||1,next=Math.sin(b.age*12)*16,delta=next-b.waveOffset;b.x+=-b.vy/speed*delta;b.y+=b.vx/speed*delta;b.waveOffset=next}}
    if(has('tether')){const source=b.caster||game.player;game.lines.push({x:source.x,y:source.y,tx:b.x,ty:b.y,life:.06});if(!b.caster)for(const e of game.enemies)if(e.hp>0&&!b.hit.has(e)){const dx=b.x-source.x,dy=b.y-source.y,t=C(((e.x-source.x)*dx+(e.y-source.y)*dy)/(dx*dx+dy*dy||1),0,1);if(Math.hypot(e.x-source.x-dx*t,e.y-source.y-dy*t)<e.r+4)damage(e,b)}}
    if(b.behaviors.includes('absorb'))for(const h of game.hostile)if(h.life>0&&D(h,b)<h.r+b.r){h.life=0;b.r=Math.min(24,b.r+3);b.damage*=1.18;b.absorbed++;particles(b.x,b.y,'#f1c68c',5)}
    if(b.behaviors.includes('fuse')&&!b.caster&&b.age>.07){const group=fuseGroups.get(b.castId)||[];for(const other of group)if(other!==b&&other.life>0&&D(b,other)<b.r+other.r+5){b.r=Math.min(30,b.r+other.r*.35);b.damage+=other.damage*.65;other.life=0;particles(b.x,b.y,'#e9c78e',4);break}}
    let wall=b.x<b.r||b.x>W-b.r||b.y<b.r||b.y>H-b.r,rock=rocks.find(o=>D(b,o)<o.r+b.r)||game.crystals.find(o=>D(b,o)<o.r+b.r);
    if(!has('orbit')&&(wall||rock)){
      if(b.bounces){b.bounces--;b.damage*=.72;if(wall){if(b.x<b.r||b.x>W-b.r)b.vx*=-1;if(b.y<b.r||b.y>H-b.r)b.vy*=-1;b.x=C(b.x,b.r,W-b.r);b.y=C(b.y,b.r,H-b.r)}else{let d=D(b,rock)||1,nx=(b.x-rock.x)/d,ny=(b.y-rock.y)/d,dot=b.vx*nx+b.vy*ny;b.vx-=2*dot*nx;b.vy-=2*dot*ny;b.x=rock.x+nx*(rock.r+b.r+2);b.y=rock.y+ny*(rock.r+b.r+2)}const rime=mutationCount(b,'frozenBounce');if(rime)game.terrain?.push({kind:'chargedWater',x:b.x,y:b.y,r:48+(rime-1)*12,life:2+(rime-1)*.6,tick:0});particles(b.x,b.y,color[b.element]||'#e8d6ad',3);fireEvent('onBounce',b,b,b.caster?game.player:null)}
      else{if(b.behaviors.includes('shatter')&&b.depth===0){let a=Math.atan2(b.vy,b.vx);for(let t of [-.7,0,.7])shot({shape:'bolt',elements:b.elements,motions:[],behaviors:[],params:{}},a+t,{x:C(b.x,20,W-20),y:C(b.y,20,H-20)},1,b.caster?.16:.4,b.castId,b.caster)}b.life=0}
    }
    if(b.life<=0){const volatile=mutationCount(b,'volatile');if(volatile&&!b.mutationBurst){b.mutationBurst=true;const radius=65+(volatile-1)*15,burstDamage=b.damage*(.45+(volatile-1)*.2);game.blasts.push({x:b.x,y:b.y,radius,life:.35,max:.35,col:color[b.element]||'#fff'});for(const e of game.enemies)if(D(e,b)<e.r+radius)e.hp-=burstDamage}if(!b.returnCaught)fireEvent('onExpire',b,b,null);continue}
    if(b.caster){if(D(b,game.player)<b.r+game.player.r&&!b.hit.has(game.player)){mirrorHit(b);if(b.pierce)b.pierce--;else b.life=0}}
    else for(let e of game.enemies)if(e.hp>0&&D(b,e)<b.r+e.r&&!b.hit.has(e)){damage(e,b);if(b.pierce)b.pierce--;else{b.life=0;break}}
    if(b.life<=0&&!b.returnCaught)fireEvent('onExpire',b,b,null)
  }
  let liveShots=0;for(const b of game.shots)if(b.life>0&&Number.isFinite(b.x))game.shots[liveShots++]=b;game.shots.length=liveShots
}
function reap(){
  const dead=game.enemies.filter(e=>e.hp<=0);game.enemies=game.enemies.filter(e=>e.hp>0);
  if(game.mode==='training')return;
  for(const e of dead){game.corpses.push({type:e.type,x:e.x,y:e.y,r:e.r,face:e.face||0,life:bossTypes.includes(e.type)?.65:.38,max:bossTypes.includes(e.type)?.65:.38,boss:bossTypes.includes(e.type)});if(e.lastHit&&!e.killEventFired)fireEvent('onKill',e.lastHit,e,e);window.EnemyJournal?.defeated(e.type);window.SpellFeatures?.enemyDefeated?.(e,game);window.SpellExpansion?.enemyDefeated?.(e,game);
    if(e.type==='splitter')for(let i of [-1,1]){const candidates=[{x:e.x+i*27,y:e.y},{x:e.x,y:e.y+i*27},{x:e.x-i*27,y:e.y}],spot=candidates.find(p=>!blocked(p.x,p.y,11));if(spot){game.enemies.push(makeEnemy('swarm',spot.x,spot.y));window.EnemyJournal?.seen('swarm')}}
    if(e.type==='splitboss')for(const [type,offset] of [['splitA',-48],['splitB',48]]){const child=makeEnemy(type,C(e.x+offset,35,W-35),e.y);child.max=child.hp=Math.round(e.max*.28);game.enemies.push(child);window.EnemyJournal?.seen(type)}
    if(e.trait==='volatile'){game.blasts.push({x:e.x,y:e.y,radius:85,life:.4,max:.4,col:'#ff927d'});if(D(e,game.player)<e.r+75)hurt(13,false,'Volatile explosion')}
    if(bossTypes.includes(e.type)){particles(e.x,e.y,'#ffe6a7',55);if(e.type==='splitboss')game.splitRewardPending=true;else window.SpellFeatures?.bossDefeated?.(e.type,game.wave)}
  }
  if(game.splitRewardPending&&!game.enemies.some(e=>e.type==='splitA'||e.type==='splitB')){game.splitRewardPending=false;window.SpellFeatures?.bossDefeated?.('splitboss',game.wave)}
  if(dead.length){const boss=dead.some(e=>bossTypes.includes(e.type));window.SpellAudio?.play(boss?'bossDown':'kill');game.kills+=dead.length;if(game.stats.killSurge)game.player.surge=2;game.player.mana=Math.min(game.stats.maxMana,game.player.mana+dead.length*game.stats.killMana);const bounty=dead.reduce((n,e)=>n+(bossTypes.includes(e.type)?250+Math.round(e.max*.6)*(game.stats.prosperity?1.2:1):e.type==='crimson'?15:e.type==='golden'?20:e.type==='sentinel'?10:e.type==='voidmage'?20:e.trait?15:0),0),earned=Math.round((dead.length*(5+Math.floor(game.wave/2))+bounty)*(window.RealmSystem?.reward()||1)*(game.route?.reward||1));SS.addMagic(earned,boss?'boss defeated':`${dead.length} ${dead.length===1?'enemy':'enemies'} defeated`)}
}
function hurt(n,through=false,source='Contact'){let p=game.player;if(p.inv>0&&!through)return false;const threat=window.RealmSystem?.danger?.(game.wave)??(1+Math.min(1.5,Math.max(0,game.wave-1)*.025));let amount=n*threat*game.stats.damageTaken*(p.rupture>0?1.15:1)*(game.stats.bastion&&rocks.some(o=>D(o,p)<o.r+75)?.88:1);const shield=Math.min(p.shield,amount);p.shield-=shield;amount-=shield;p.hp=Math.max(0,p.hp-amount);p.animHit=.18;game.shake=Math.max(game.shake||0,Math.min(12,amount*.25));game.damageSources[source]=(game.damageSources[source]||0)+amount;game.lastDamage=source;if(bossTypes.some(type=>game.enemies.some(e=>e.type===type&&e.hp>0)))game.bossDamage+=amount;if(!through)p.inv=.5;particles(p.x,p.y,'#ff9f9f',through?2:12);if(!through)window.SpellAudio?.play('hurt');if(p.hp<=0){if(game.stats.secondWind&&!game.secondWindUsed&&game.mode!=='noheal'){game.secondWindUsed=true;p.hp=45;p.inv=2;say('Second Wind saved you!',2)}else finish()}return true}
function grantShield(amount){game.player.shield=Math.min(60,Math.max(0,game.player.shield+amount));return game.player.shield}
function enemyShot(e,a,speed=300){e.animAttack=.24;game.hostile.push({x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:7,life:2.4,damage:7+Math.floor(Math.max(0,effectiveWave(game.wave)-5)/12),source:e.type});window.SpellAudio?.play(`enemy:${e.type}`,C(e.x/W*2-1,-1,1))}
function elementalOrb(e,a,kind,speed=230,damage=11){e.animAttack=.32;game.hostile.push({x:e.x+Math.cos(a)*(e.r+10),y:e.y+Math.sin(a)*(e.r+10),vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:kind==='ember'?13:10,life:4,damage,source:`${e.type} ${kind}`,status:kind==='water'?'water':kind==='ember'?'ember':kind,elemental:kind});window.SpellAudio?.play(kind==='ember'?'blast':kind==='water'?'storm':`enemy:${e.type}`,C(e.x/W*2-1,-1,1))}
function bossHazard(kind,x,y,r,life=5,warn=1,extra={}){game.hazards??=[];game.hazards.push({kind,x:C(x,r,W-r),y:C(y,r,H-r),r,life,warn,tick:0,...extra});window.SpellAudio?.play(kind==='lightning'?'storm':'hazard')}
function missile(e,a){e.animAttack=.3;const speed=245;game.hostile.push({x:e.x+Math.cos(a)*(e.r+12),y:e.y+Math.sin(a)*(e.r+12),vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:9,life:6,damage:11+(e.type==='engine'?Math.min(8,Math.floor(bossTier(game.wave)/2)*2):0),missile:true,homing:2.5,speed,source:e.type});window.SpellAudio?.play('missile')}
function lineOfSight(a,b){const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;return !rocks.some(o=>{const t=C(((o.x-a.x)*dx+(o.y-a.y)*dy)/(length||1),0,1),x=a.x+dx*t,y=a.y+dy*t;return Math.hypot(o.x-x,o.y-y)<o.r+8})}
function voidOrb(e){
  const p=game.player,index=6-e.orbs,orbit=e.age*1.8+index*Math.PI/3,x=e.x+Math.cos(orbit)*(e.r+24),y=e.y+Math.sin(orbit)*(e.r+24),a=Math.atan2(p.y-y,p.x-x),speed=300;
  game.hostile.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:10,life:3.5,damage:12,orb:true,voidCaster:e,source:'Void Sovereign orb'});
  if(e.orbs===6)e.orbRecharge=3.8;e.orbs--;window.SpellAudio?.play('counter')
}
function castCurse(e){
  const boss=e.type==='voidboss';
  e.animAttack=.4;
  game.curses.push({caster:e,age:0,gather:boss?1.45:1.05,freeze:boss?.7:1.2,damage:boss?50:40,radius:boss?40:36,locked:false,x:0,y:0,casterX:0,casterY:0});
  window.SpellAudio?.play('curse')
}
function updateCurses(dt){
  const p=game.player,remaining=[];
  for(const curse of game.curses){
    curse.age+=dt;
    if(!curse.locked&&curse.age+1e-6>=curse.gather){curse.locked=true;curse.x=p.x;curse.y=p.y;curse.casterX=curse.caster.x;curse.casterY=curse.caster.y;window.SpellAudio?.play('lock')}
    if(curse.age+1e-6>=curse.gather+curse.freeze){
      game.blasts.push({x:curse.x,y:curse.y,radius:curse.radius,life:.4,max:.4});particles(curse.x,curse.y,'#bd76ef',24);window.SpellAudio?.play('blast');
      if(Math.hypot(p.x-curse.x,p.y-curse.y)<=curse.radius+p.r&&hurt(curse.damage,false,curse.caster.type==='voidboss'?'Void Sovereign spell':'Void Mage spell')&&curse.caster.type==='voidboss'&&curse.caster.hp>0)curse.caster.hp=Math.min(curse.caster.max,curse.caster.hp+Math.round(curse.damage*.4))
    }else remaining.push(curse)
  }
  game.curses=remaining
}
function mirrorCast(e){
  const p=game.player,source=e.phase2?SS.scripts[e.loadout??((SS.selected+1)%3)].map(x=>({...x,kind:SS.block(x.id).kind})):SS.current(),volleys=compile(source),active=volleys.filter(v=>v.event==='cast'&&conditionsTrue(v,e,p,e));
  const cost=Math.ceil(active.reduce((n,v)=>n+volleyCost(v)*(v.control.repeat||1),0)*game.stats.cost);
  if(!active.length||e.mana<cost){e.attack=.55;return false}
  const tier=bossTier(game.wave),power=.65+Math.min(.18,tier*.025);
  e.mana-=cost;e.animAttack=.3;e.attack=Math.max(.9,(.5+active.length*.17+active.reduce((n,v)=>n+(v.control.repeat||1)*.11,0))*game.stats.cooldown*Math.max(.78,1-tier*.025));
  window.SpellAudio?.play('counter');
  const base=Math.atan2(p.y-e.y,p.x-e.x),castId=++game.nextCastId;game.eventsByCast.set(castId,{volleys,caster:e,budget:12});let cursor=0;
  for(const v of active){const a=aimAngle(v,e,base,e,p);cursor+=v.control.wait||0;for(let j=0;j<(v.control.repeat||1);j++){
    const at=time+cursor+j*.16,fire=(when,scale)=>game.echoes.push({at:when,s:v,a,origin:e,castId,scale,caster:e});
    if(at<=time)shot(v,a,e,0,power,castId,e);else fire(at,power);
    if(v.behaviors.includes('echo'))fire(at+(v.params?.echo||.3),power*.55)
  }cursor+=(v.control.repeat-1)*.16+.13}
  if(e.phase2)e.loadout=((e.loadout??SS.selected)+1)%3;
  return true
}
function dodgeMirror(e,dt){
  e.dodge=Math.max(0,e.dodge-dt);if(e.dodge>0)return false;
  const threat=game.shots.filter(b=>!b.caster&&b.life>0).map(b=>{const speed2=b.vx*b.vx+b.vy*b.vy,t=C(((e.x-b.x)*b.vx+(e.y-b.y)*b.vy)/speed2,0,.6),distance=Math.hypot(e.x-b.x-b.vx*t,e.y-b.y-b.vy*t);return{b,t,distance}}).filter(v=>v.distance<e.r+22&&v.t<.6).sort((a,z)=>a.t-z.t)[0];
  if(!threat)return false;
  const b=threat.b,s=Math.hypot(b.vx,b.vy)||1,side=Math.sign((e.x-b.x)*(-b.vy)+(e.y-b.y)*b.vx)||1;
  move(e,-b.vy/s*side*e.speed*2.6,b.vx/s*side*e.speed*2.6,dt);e.dodge=.65-Math.min(.2,bossTier(game.wave)*.03);return true
}
function curveAttack(e){
  const p=game.player,start={x:e.x,y:e.y},end={x:p.x,y:p.y},dx=end.x-start.x,dy=end.y-start.y,length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length,mid={x:(start.x+end.x)/2,y:(start.y+end.y)/2};
  const obstacles=[...rocks,...game.crystals].map(o=>{const t=C(((o.x-start.x)*dx+(o.y-start.y)*dy)/(length*length),0,1),px=start.x+dx*t,py=start.y+dy*t;return{o,t,d:Math.hypot(o.x-px,o.y-py)}}).filter(v=>v.t>.12&&v.t<.88&&v.d<v.o.r+70).sort((a,b)=>a.d-b.d);
  const obstacle=obstacles[0],side=obstacle?(Math.sign((obstacle.o.x-mid.x)*nx+(obstacle.o.y-mid.y)*ny)||1)*-1:(Math.sin(e.age)>0?1:-1),bend=obstacle?obstacle.o.r+105:75,control={x:C(mid.x+nx*side*bend,35,W-35),y:C(mid.y+ny*side*bend,35,H-35)},points=[];
  for(let i=0;i<=36;i++){const t=i/36,u=1-t;points.push({x:u*u*start.x+2*u*t*control.x+t*t*end.x,y:u*u*start.y+2*u*t*control.y+t*t*end.y})}
  e.animAttack=.4;game.paths.push({points,life:1.15,max:1.15,owner:e});window.SpellAudio?.play('sniperCharge',C(e.x/W*2-1,-1,1));
}
function updatePaths(dt){
  for(const path of game.paths){path.life-=dt;if(path.life<=0&&!path.fired){path.fired=true;for(let i=0;i<4;i++)game.hostile.push({x:path.points[0].x,y:path.points[0].y,vx:0,vy:0,r:7,life:3.2,damage:8+Math.floor(effectiveWave(game.wave)/12),source:'Vector Scribe',curve:path.points.map(p=>({...p})),curveIndex:1,curveDelay:i*.09,speed:520})}}
  game.paths=game.paths.filter(path=>path.life>0)
}
const engineArmOrder=[0,6,1,7,2,8,3,9,4,10,5,11];
function bossIntroProgress(e){return C((e.introTime||0)/(e.introDuration||1),0,1)}
function bossIntroAnimation(e,base){
  if(!e.initializing||e.type==='engine')return base;
  const t=bossIntroProgress(e),smooth=t*t*(3-2*t),pulse=Math.sin(t*Math.PI),out={...base,alpha:base.alpha};
  if(e.type==='mirror'){const reveal=C((t-.78)/.16,0,1);out.scaleX*=.18+.82*reveal;out.scaleY*=.18+.82*reveal;out.rotate+=(1-reveal)*Math.PI;out.alpha*=reveal}
  else if(e.type==='voidboss'){out.scaleX*=.12+.88*smooth;out.scaleY*=.12+.88*smooth;out.rotate+=(1-smooth)*Math.PI*2;out.alpha*=C((t-.08)*2.5,0,1)}
  else if(e.type==='frostboss'){out.y+=(1-smooth)*95;out.scaleX*=.55+.45*smooth;out.scaleY*=.08+.92*smooth;out.alpha*=C(t*3,0,1)}
  else if(e.type==='splitboss'){out.scaleX*=.35+.65*smooth;out.scaleY*=.78+.22*smooth;out.rotate+=(1-smooth)*.7;out.alpha*=C(t*2.5,0,1)}
  else if(e.type==='tempestboss'){out.y-=(1-smooth)*185;out.rotate+=Math.sin(t*34)*(1-t)*.09;out.scaleX*=.65+.35*smooth;out.scaleY*=.65+.35*smooth;out.alpha*=C(t*2.8,0,1)}
  else if(e.type==='broodboss'){out.y+=(1-smooth)*34;out.scaleX*=.35+.65*smooth;out.scaleY*=.05+.95*smooth;out.alpha*=C(t*3,0,1)}
  else if(e.type==='sunboss'){out.scaleX*=.12+.88*smooth;out.scaleY*=.12+.88*smooth;out.rotate+=(1-smooth)*-Math.PI;out.alpha*=C(t*3,0,1)}
  else if(e.type==='prismboss'){out.scaleX*=.18+.82*smooth;out.scaleY*=.18+.82*smooth;out.rotate+=(1-smooth)*Math.PI*1.5;out.alpha*=C(t*2.5,0,1)}
  out.scaleX*=1+pulse*.035;out.scaleY*=1+pulse*.035;return out
}
function bossIntroBeat(e,beat){
  const hues={mirror:'#9ffaff',voidboss:'#bb75ff',frostboss:'#a8f4ff',splitboss:beat%2?'#ff995e':'#dda6ff',tempestboss:'#d6b1ff',broodboss:'#83df72',sunboss:'#ffe27d',prismboss:'#69f3e2'},styles={voidboss:'mote',broodboss:'spore',frostboss:'shard',prismboss:'shard',tempestboss:'spark'},hue=hues[e.type]||'#fff0d2',a=beat*2.399;
  particles(e.x+Math.cos(a)*(e.r+28),e.y+Math.sin(a)*(e.r+28),hue,5,styles[e.type]||'spark',.35);
  if(beat===0)particles(e.x,e.y,hue,3,'ring',.65)
}
function updateBossInitialization(e,dt){
  const p=game.player;e.introTime=Math.min(e.introDuration,e.introTime+dt);
  if(e.type==='engine'){
    const previous=e.introArms,next=e.introTime<.45?0:Math.min(12,(Math.floor((e.introTime-.45)/.38)+1)*2);e.introArms=next;
    for(let slot=previous;slot<next;slot+=2){const pair=slot/2;for(const arm of [engineArmOrder[slot],engineArmOrder[slot+1]]){const a=e.bodyAngle+arm*Math.PI/6;particles(e.x+Math.cos(a)*48,e.y+Math.sin(a)*48,'#f8d181',5,'shard',.35)}window.SpellAudio?.play('engineArm')}
    if(e.introTime>=2.75){const target=Math.atan2(p.y-e.y,p.x-e.x);e.bodyAngle+=C(angleDelta(e.bodyAngle,target),-dt*2.15,dt*2.15)}e.face=e.bodyAngle;
  }else{
    const beat=Math.floor(e.introTime/.52);while(e.introBeat<beat){e.introBeat++;bossIntroBeat(e,e.introBeat)}
    if(e.type==='mirror'&&!e.introCollision&&bossIntroProgress(e)>=.78){e.introCollision=true;particles(e.x,e.y,'#78eaff',26,'shard',1.25);particles(e.x,e.y,'#baf9ff',8,'ring',1.8);game.shake=Math.max(game.shake||0,7);window.SpellAudio?.play('blast')}
    const target=Math.atan2(p.y-e.y,p.x-e.x);e.face+=C(angleDelta(e.face,target),-dt*2.5,dt*2.5);
  }
  if(e.introTime<e.introDuration)return;
  e.initializing=false;e.animSpawn=0;e.attack=1.1;e.special=e.type==='engine'?3.8:2.2;e.summon=e.type==='engine'?5.5:4.5;e.ward=Math.max(e.ward,1.15);if(game.bossInitializing===e)game.bossInitializing=null;particles(e.x,e.y,e.type==='engine'?'#ffe290':'#fff0d2',5,'ring',1);window.SpellAudio?.play(e.type==='engine'?'engineReady':'phase');say(`${bossIntroNames[e.type]} ready. Combat started.`,2.8)
}
function updateEnemies(dt){let p=game.player;for(let e of [...game.enemies]){e.age+=dt;e.animMoving=0;e.animSpawn=Math.max(0,(e.animSpawn||0)-dt);e.animHit=Math.max(0,(e.animHit||0)-dt);e.animAttack=Math.max(0,(e.animAttack||0)-dt);e.animPhase=Math.max(0,(e.animPhase||0)-dt);e.ward=Math.max(0,(e.ward||0)-dt);e.castGuard=Math.max(0,(e.castGuard||0)-dt);e.rupture=Math.max(0,(e.rupture||0)-dt);e.flash=Math.max(0,e.flash-dt);e.slow=Math.max(0,e.slow-dt);e.wet=Math.max(0,(e.wet||0)-dt);e.mark=Math.max(0,(e.mark||0)-dt);if(e.burn>0){e.burn-=dt;e.hp-=5*dt;if(game.mode==='training')game.trainingDamage+=5*dt}if(e.poison>0){e.poisonTime=(e.poisonTime||4)-dt;const tick=e.poison*2.2*dt;e.hp-=tick;if(game.mode==='training')game.trainingDamage+=tick;if(e.poisonTime<=0)e.poison=0}if(e.type==='dummy'){e.hp=e.max;continue}if(bossTypes.includes(e.type)&&!e.phase2&&e.hp<=e.max*.5)enterBossPhase(e);if(e.hp<=0)continue;let d=D(e,p)||1,dx=(p.x-e.x)/d,dy=(p.y-e.y)/d,v=e.speed*(e.slow>0?.43:1);e.attack-=dt*(bossTypes.includes(e.type)?1:Math.min(2.25,1+Math.max(0,game.wave-1)*.02));e.face=Math.atan2(dy,dx);
    if(e.initializing){updateBossInitialization(e,dt);continue}
    if(['chaser','splitter','tank','swarm'].includes(e.type)){if(d>e.r+p.r+3)move(e,dx*v,dy*v,dt);if(d<e.r+p.r+8&&e.attack<=0){hurt(e.type==='tank'?14:e.type==='swarm'?5:8,false,e.type);e.attack=e.type==='swarm'?.8:1}}
    else if(e.type==='shooter'){if(d>270)move(e,dx*v,dy*v,dt);if(d<170)move(e,-dx*v,-dy*v,dt);if(e.attack<=0){enemyShot(e,e.face);e.attack=1.6}}
    else if(e.type==='charger'){if(e.dashTime>0){move(e,e.dx*v*4,e.dy*v*4,dt);e.dashTime-=dt}else if(e.charge>0){e.charge-=dt;if(e.charge<=0)e.dashTime=.38}else{if(d>230)move(e,dx*v,dy*v,dt);if(e.attack<=0&&d<330){e.dx=dx;e.dy=dy;e.charge=.55;e.attack=2.4;window.SpellAudio?.play('charge',C(e.x/W*2-1,-1,1))}}if(d<e.r+p.r+8&&e.attack<=1.9){hurt(13,false,e.type);e.attack=2.4}}
    else if(e.type==='wisp'){let sway=Math.sin(e.age*4),vx=(d>230?dx*.6:dx*.15)+(-dy)*sway*.8,vy=(d>230?dy*.6:dy*.15)+dx*sway*.8;move(e,vx*v,vy*v,dt);if(e.attack<=0){enemyShot(e,e.face-.17,320);enemyShot(e,e.face+.17,320);e.attack=1.9}}
    else if(e.type==='golden'){if(d>210)move(e,dx*v,dy*v,dt);if(e.attack<=0){for(let i=0;i<8;i++)enemyShot(e,e.age*.3+i*Math.PI/4,250);e.attack=2.7}if(d<e.r+p.r+5)hurt(13,false,e.type)}
    else if(e.type==='sentinel'){if(d>270)move(e,dx*v,dy*v,dt);if(e.attack<=0){for(let i=0;i<4;i++)enemyShot(e,e.age*.14+i*Math.PI/2,215);e.attack=2.6}if(d<e.r+p.r+5)hurt(12,false,e.type)}
    else if(e.type==='crimson'){if(d>285)move(e,dx*v,dy*v,dt);if(e.attack<=0){missile(e,e.face);e.attack=6}if(d<e.r+p.r+5)hurt(13,false,e.type)}
    else if(e.type==='healer'){if(d<270)move(e,-dx*v,-dy*v,dt);else if(d>380)move(e,dx*v,dy*v,dt);if(e.attack<=0){let healed=false;for(const ally of game.enemies)if(ally!==e&&ally.hp>0&&D(e,ally)<180){ally.hp=Math.min(ally.max,ally.hp+18);game.lines.push({x:e.x,y:e.y,tx:ally.x,ty:ally.y,life:.35,col:'#8ce6b2'});healed=true}if(healed)window.SpellAudio?.play('heal',C(e.x/W*2-1,-1,1));e.attack=3.2}}
    else if(e.type==='sniper'){if(d<320)move(e,-dx*v,-dy*v,dt);if(e.charge>0){e.charge-=dt;if(e.charge<=0){enemyShot(e,e.lockedFace,440);e.attack=3.4}}else if(e.attack<=0){e.lockedFace=e.face;e.charge=.9;window.SpellAudio?.play('sniperCharge',C(e.x/W*2-1,-1,1))}}
    else if(e.type==='burrower'){if(e.hidden){e.charge-=dt;if(e.charge<=0){e.hidden=false;e.x=C(p.x+R(-110,110),e.r,W-e.r);e.y=C(p.y+R(-110,110),e.r,H-e.r);e.attack=1.6;particles(e.x,e.y,'#c8a2e8',10);window.SpellAudio?.play('burrow',C(e.x/W*2-1,-1,1))}}else{move(e,dx*v,dy*v,dt);if(e.attack<=0){e.hidden=true;e.charge=.8;e.attack=5;window.SpellAudio?.play('burrow',C(e.x/W*2-1,-1,1))}}if(!e.hidden&&d<e.r+p.r+5)hurt(11,false,e.type)}
    else if(e.type==='shieldbearer'){if(d>e.r+p.r+5)move(e,dx*v,dy*v,dt);if(d<e.r+p.r+5&&e.attack<=0){hurt(12,false,e.type);e.attack=1.2}}
    else if(e.type==='mimic'){if(d>250)move(e,dx*v,dy*v,dt);else move(e,-dy*v*.4,dx*v*.4,dt);if(e.attack<=0){const own=compile(SS.current()).find(v=>v.event==='cast');if(own)shot({...own,elements:own.elements.slice(0,1),behaviors:[]},e.face,e,0,.26,++game.nextCastId,e);else enemyShot(e,e.face);e.attack=3.5}}
    else if(e.type==='cinderhound'){move(e,dx*v*(e.charge>0?2.3:1),dy*v*(e.charge>0?2.3:1),dt);e.charge=Math.max(0,e.charge-dt);if(e.attack<=0){e.charge=.55;e.attack=2.2;particles(e.x,e.y,'#ff794d',7)}if(d<e.r+p.r+7){if(hurt(11,false,e.type))p.burn=Math.max(p.burn,2.5);e.attack=Math.max(e.attack,1)}}
    else if(e.type==='rimeweaver'){if(d>300)move(e,dx*v,dy*v,dt);if(d<210)move(e,-dx*v,-dy*v,dt);if(e.attack<=0){for(let i=-1;i<=1;i++){enemyShot(e,e.face+i*.16,285);game.hostile.at(-1).status='frost'}e.attack=2.8}}
    else if(e.type==='thunderhead'){move(e,-dy*v*.65+dx*v*(d>260?.35:-.2),dx*v*.65+dy*v*(d>260?.35:-.2),dt);if(e.attack<=0){for(let i=0;i<6;i++)enemyShot(e,e.age+i*Math.PI/3,330);e.attack=2.25}}
    else if(e.type==='sporebrute'){if(d>e.r+p.r+5)move(e,dx*v,dy*v,dt);if(d<e.r+p.r+8&&e.attack<=0){if(hurt(14,false,e.type))p.poison=Math.max(p.poison,4);e.attack=1.4}if(e.summon<=0){game.hazards.push({x:e.x,y:e.y,r:58,life:4,warn:.5,tick:0,kind:'poison'});e.summon=5}else e.summon-=dt}
    else if(e.type==='sunlancer'){if(d<330)move(e,-dx*v,-dy*v,dt);if(e.charge>0){e.charge-=dt;if(e.charge<=0){enemyShot(e,e.lockedFace,520);game.hostile.at(-1).damage+=5;e.attack=3.1}}else if(e.attack<=0){e.lockedFace=e.face;e.charge=.65;window.SpellAudio?.play('sniperCharge')}}
    else if(e.type==='riftstalker'){if(e.charge>0){e.charge-=dt;if(e.charge<=0){e.x=C(p.x-dx*115+R(-45,45),e.r,W-e.r);e.y=C(p.y-dy*115+R(-45,45),e.r,H-e.r);particles(e.x,e.y,'#ad6cff',12)}}else{move(e,dx*v,dy*v,dt);if(e.attack<=0){e.charge=.45;e.attack=3.8}}if(d<e.r+p.r+6)hurt(12,false,e.type)}
    else if(e.type==='shardsmith'){if(d>260)move(e,dx*v,dy*v,dt);if(e.attack<=0){const x=C(e.x+dx*70,25,W-25),y=C(e.y+dy*70,25,H-25);if(!blocked(x,y,18))game.crystals.push({x,y,r:18,life:7});enemyShot(e,e.face,280);e.attack=3.5}}
    else if(e.type==='graviton'){if(d>280)move(e,dx*v*.5,dy*v*.5,dt);if(d<220){p.x-=dx*34*dt;p.y-=dy*34*dt}if(e.attack<=0){for(let i=-1;i<=1;i++){enemyShot(e,e.face+i*.24,245);game.hostile.at(-1).status='gravity'}e.attack=2.7}}
    else if(e.type==='vectorscribe'){if(d>335)move(e,dx*v,dy*v,dt);else if(d<250)move(e,-dx*v,-dy*v,dt);move(e,-dy*v*.22,dx*v*.22,dt);if(e.attack<=0){curveAttack(e);e.attack=4.6}}
    else if(e.type==='engine'){
      if(d>240)move(e,dx*v,dy*v,dt);else if(d<170)move(e,-dx*v*.5,-dy*v*.5,dt);
      move(e,-dy*v*.32,dx*v*.32,dt);
      if(e.attack<=0){const stage=Math.floor(bossTier(game.wave)/2),arms=Math.max(2,Math.ceil(12*e.hp/e.max)),count=Math.min(arms,3+Math.min(3,stage)+(e.phase2?1:0));for(let i=0;i<count;i++)missile(e,e.face+(i-(count-1)/2)*.32);e.attack=Math.max(2.2,4.6-stage*.35-(e.phase2?.6:0))}
      e.special-=dt;if(e.special<=0&&(!window.RealmSystem?.intro?.()||e.phase2)){for(let i=-1;i<=1;i++)elementalOrb(e,e.face+i*.3,'ember',205,8);bossHazard('inferno',p.x+R(-70,70),p.y+R(-70,70),52,4.2,1);e.special=e.phase2?5.2:7.2;say('Furnace vents opening!',1.5)}
      e.summon-=dt;if(e.summon<=0){if(game.enemies.filter(v=>v.type==='sentinel'&&v.hp>0).length<3&&Math.random()<.65){let a=R(0,Math.PI*2),x=e.x+Math.cos(a)*90,y=e.y+Math.sin(a)*90;if(!blocked(x,y,23)){game.enemies.push(makeEnemy('sentinel',x,y));window.EnemyJournal?.seen('sentinel')}}e.summon=7+R(0,3)}
      if(d<e.r+p.r+5)hurt(16,false,e.type)
    }
    else if(e.type==='mirror'){
      e.maxMana=game.stats.maxMana*2;e.mana=Math.min(e.maxMana,e.mana+24*game.stats.manaRegen*.8*dt);
      if(!dodgeMirror(e,dt)){const source=e.phase2?SS.scripts[e.loadout??SS.selected].map(x=>({...x,kind:SS.block(x.id).kind})):SS.current(),shape=compile(source).find(v=>v.event==='cast')?.shape,range=['arc','ring','scatter','nova'].includes(shape)?155:['lance','beam'].includes(shape)?340:255,strafe=Math.sin(e.age*1.7)>0?1:-1,approach=d>range+25?1:d<range-55?-.85:.1;move(e,(dx*approach-dy*strafe*.72)*v,(dy*approach+dx*strafe*.72)*v,dt)}
      if(e.attack<=0)mirrorCast(e);e.special-=dt;if(e.special<=0){for(const [x,y] of [[35,35],[W-35,35],[W-35,H-35]]){const a=Math.atan2(p.y-y,p.x-x);game.hostile.push({x,y,vx:Math.cos(a)*310,vy:Math.sin(a)*310,r:8,life:3.5,damage:9,source:'Counterforge afterimage'})}e.special=e.phase2?5.5:7.5;say('Counterforge deploys afterimages!',1.5)}if(d<e.r+p.r+5)hurt(10,false,e.type)
    }
    else if(e.type==='voidboss'){
      if(d>320)move(e,dx*v,dy*v,dt);else if(d<190)move(e,-dx*v*.7,-dy*v*.7,dt);
      move(e,-dy*v*.4,dx*v*.4,dt);
      if(e.attack<=0){castCurse(e);e.attack=Math.max(4.2,5.6-bossTier(game.wave)*.15)}
      e.orbTimer-=dt;e.orbRecharge-=dt;
      if(e.orbs<6&&e.orbRecharge<=0){e.orbs++;e.orbRecharge=3.8}
      if(e.orbs>0&&e.orbTimer<=0&&lineOfSight(e,p)){voidOrb(e);e.orbTimer=Math.max(1.35,2.5-bossTier(game.wave)*.08)}
      e.special-=dt;if(e.special<=0){bossHazard('void',p.x,p.y,68,4.5,1.1);if(e.phase2)bossHazard('void',W-p.x,H-p.y,58,4.5,1.4);e.special=e.phase2?5.2:7;say('Void rifts are forming!',1.5)}
      if(e.phase2&&e.summon<=0){const minion=game.enemies.find(v=>v!==e&&v.hp>0&&D(v,e)<170);if(minion){minion.hp=0;e.hp=Math.min(e.max,e.hp+40);particles(e.x,e.y,'#c78bea',12)}e.summon=3.5}else e.summon-=dt;
      if(d<e.r+p.r+6)hurt(15,false,e.type)
    }
    else if(e.type==='frostboss'){if(d>270)move(e,dx*v,dy*v,dt);else if(d<170)move(e,-dx*v,-dy*v,dt);move(e,-dy*v*.3,dx*v*.3,dt);if(e.attack<=0){for(let i=-1;i<=1;i++){const x=C(p.x+i*65,25,W-25),y=C(p.y+dy*55,25,H-25);if(!blocked(x,y,22))game.crystals.push({x,y,r:22,life:e.phase2?9:6})}enemyShot(e,e.face-.15,330);enemyShot(e,e.face+.15,330);e.attack=e.phase2?2.9:4.2}e.special-=dt;if(e.special<=0){bossHazard('ice',p.x,p.y,e.phase2?205:165,e.phase2?6.5:5.2,1);e.special=e.phase2?5.4:7.2;say('The floor is freezing!',1.5)}if(d<e.r+p.r+5)hurt(16,false,e.type)}
    else if(e.type==='splitboss'){if(d>240)move(e,dx*v,dy*v,dt);else move(e,-dy*v*.65,dx*v*.65,dt);if(e.attack<=0){for(let i=-2;i<=2;i++)enemyShot(e,e.face+i*.22,290);e.attack=e.phase2?1.7:2.5}e.special-=dt;if(e.special<=0){bossHazard('crucible',p.x-75,p.y,58,4.5,.9,{variant:'ember'});bossHazard('crucible',p.x+75,p.y,58,4.5,1.15,{variant:'frost'});e.special=e.phase2?4.7:6.5;say('Twin Crucible splits the floor!',1.5)}if(d<e.r+p.r+5)hurt(14,false,e.type)}
    else if(e.type==='tempestboss'){move(e,-dy*v*.45+dx*v*(d>270?.3:-.25),dx*v*.45+dy*v*(d>270?.3:-.25),dt);if(e.attack<=0){const count=e.phase2?12:8;for(let i=0;i<count;i++){enemyShot(e,e.age*.7+i*Math.PI*2/count,340);game.hostile.at(-1).status='storm'}e.attack=e.phase2?1.35:2.1}e.special-=dt;if(e.special<=0){if(e.pattern++%2===0){bossHazard('lightning',p.x,p.y,50,1.25,.8);bossHazard('lightning',p.x+R(-150,150),p.y+R(-120,120),42,1.45,1.05);if(e.phase2)bossHazard('lightning',p.x+R(-180,180),p.y+R(-140,140),42,1.65,1.25);say('Lightning marks the floor!',1.5)}else{for(let i=-2;i<=2;i++)elementalOrb(e,e.face+i*.2,'water',230,7);say('A water barrage is coming!',1.5)}e.special=e.phase2?3.8:5.3}if(d<e.r+p.r+5)hurt(16,false,e.type)}
    else if(e.type==='broodboss'){if(d>230)move(e,dx*v,dy*v,dt);if(e.attack<=0){for(let i=-2;i<=2;i++){enemyShot(e,e.face+i*.28,250);game.hostile.at(-1).status='poison'}e.attack=e.phase2?1.9:2.7}e.special-=dt;if(e.special<=0){for(let i=0;i<(e.phase2?4:3);i++){const a=i*Math.PI*2/(e.phase2?4:3)+e.age;bossHazard('spore',p.x+Math.cos(a)*110,p.y+Math.sin(a)*90,46,5.5,.8+i*.15)}e.special=e.phase2?5:6.8;say('Spore pods are blooming!',1.5)}e.summon-=dt;if(e.summon<=0){for(let i=0;i<(e.phase2?2:1);i++){let a=R(0,7),m=makeEnemy('sporebrute',C(e.x+Math.cos(a)*85,28,W-28),C(e.y+Math.sin(a)*85,28,H-28));m.hp=m.max=Math.round(m.max*.55);game.enemies.push(m)}e.summon=6}if(d<e.r+p.r+5)hurt(18,false,e.type)}
    else if(e.type==='sunboss'){if(d>300)move(e,dx*v,dy*v,dt);else move(e,-dy*v*.3,dx*v*.3,dt);if(e.attack<=0){for(let i=0;i<(e.phase2?12:8);i++)enemyShot(e,e.age*.18+i*Math.PI/(e.phase2?6:4),390);enemyShot(e,e.face,560);game.hostile.at(-1).damage+=8;e.attack=e.phase2?1.5:2.4}e.special-=dt;if(e.special<=0){for(let i=-2;i<=2;i++)elementalOrb(e,e.face+i*.24,'ember',e.phase2?285:245,9);bossHazard('flare',p.x,p.y,64,2.8,.95);e.special=e.phase2?4.2:6;say('Solar flares launched!',1.5)}if(d<e.r+p.r+5)hurt(17,false,e.type)}
    else if(e.type==='prismboss'){if(d>250)move(e,dx*v*.7,dy*v*.7,dt);if(e.attack<=0){for(let i=-2;i<=2;i++)enemyShot(e,e.face+i*.18,310);for(let i=0;i<(e.phase2?3:2);i++){let a=R(0,7),x=C(p.x+Math.cos(a)*R(70,150),25,W-25),y=C(p.y+Math.sin(a)*R(70,150),25,H-25);if(!blocked(x,y,20))game.crystals.push({x,y,r:20,life:e.phase2?10:7})}e.attack=e.phase2?2.1:3.2}e.special-=dt;if(e.special<=0){bossHazard('prism',p.x,p.y,e.phase2?115:90,3.2,1.15);e.special=e.phase2?4.5:6.4;say('A prism cage is crystallizing!',1.5)}if(d<e.r+p.r+5)hurt(18,false,e.type)}
    else if(e.type==='splitA'||e.type==='splitB'){if(e.type==='splitA'){move(e,dx*v,dy*v,dt);if(d<e.r+p.r+5)hurt(12,false,e.type)}else{if(d>260)move(e,dx*v,dy*v,dt);if(e.attack<=0){enemyShot(e,e.face-.2);enemyShot(e,e.face+.2);e.attack=1.6}}}
    else if(e.type==='voidmage'){
      if(d>310)move(e,dx*v*.8,dy*v*.8,dt);else if(d<205)move(e,-dx*v*.8,-dy*v*.8,dt);
      move(e,-dy*v*.3,dx*v*.3,dt);
      if(e.attack<=0){castCurse(e);e.attack=7.2}
      if(d<e.r+p.r+5)hurt(9,false,e.type)
    }
    if(e.trait==='draining'&&d<e.r+p.r+5)p.mana=Math.max(0,p.mana-13*dt);
    if(e.squad!==undefined&&!bossTypes.includes(e.type)){const mate=game.enemies.find(v=>v!==e&&v.squad===e.squad&&v.hp>0);if(mate&&D(e,mate)>105){const dd=D(e,mate);move(e,(mate.x-e.x)/dd*v*.2,(mate.y-e.y)/dd*v*.2,dt)}}
  }
  for(let b of game.hostile){
    b.fx=(b.fx||0)-dt;if(b.fx<=0){if(b.elemental){const hue=b.elemental==='water'?'#65d9ff':'#ff7a3d';particles(b.x-b.vx*.025,b.y-b.vy*.025,hue,2,b.elemental==='water'?'droplet':'ember',.35);b.fx=.045}else if(b.missile){particles(b.x-b.vx*.035,b.y-b.vy*.035,'#ff9b45',1,'smoke',.3);b.fx=.06}else if(b.orb){particles(b.x,b.y,'#ad6cff',1,'mote',.25);b.fx=.08}else if(b.curve){particles(b.x,b.y,'#d8b5ff',1,'shard',.18);b.fx=.07}}
    if(b.curveDelay>0){b.curveDelay-=dt;continue}
    if(b.curve){let remaining=b.speed*dt;while(remaining>0&&b.curveIndex<b.curve.length){const target=b.curve[b.curveIndex],dx=target.x-b.x,dy=target.y-b.y,d=Math.hypot(dx,dy)||1;b.vx=dx/d*b.speed;b.vy=dy/d*b.speed;if(d<=remaining){b.x=target.x;b.y=target.y;b.curveIndex++;remaining-=d}else{b.x+=dx/d*remaining;b.y+=dy/d*remaining;remaining=0}}if(b.curveIndex>=b.curve.length)b.life=0}
    else{if(b.missile&&b.homing>0){let current=Math.atan2(b.vy,b.vx),target=Math.atan2(p.y-b.y,p.x-b.x),turn=Math.atan2(Math.sin(target-current),Math.cos(target-current)),next=current+C(turn,-2.5*dt,2.5*dt);b.vx=Math.cos(next)*b.speed;b.vy=Math.sin(next)*b.speed;b.homing=Math.max(0,b.homing-dt)}b.x+=b.vx*dt;b.y+=b.vy*dt}
    b.life-=dt;if(!b.curve&&blocked(b.x,b.y,b.r)){const rock=rocks.find(o=>D(o,b)<o.r+b.r);if(rock?.hp){rock.hp-=10;if(rock.hp<=0){rocks.splice(rocks.indexOf(rock),1);particles(rock.x,rock.y,'#becce0',20)}}b.life=0}const proximity=D(b,p);if(b.life>0&&proximity>=b.r+p.r&&proximity<b.r+p.r+16&&!b.nearMiss){b.nearMiss=true;particles(p.x,p.y,'#9deee6',3);if(game.stats.aegis&&p.inv>0)grantShield(6)}if(b.life>0&&proximity<b.r+p.r){const hit=hurt(b.damage||7,false,b.source||'Projectile');if(hit&&b.status==='frost')p.slow=Math.max(p.slow,2);if(hit&&b.status==='poison')p.poison=Math.max(p.poison,4);if(hit&&b.status==='gravity')p.slow=Math.max(p.slow,1.2);if(hit&&b.status==='storm')p.mana=Math.max(0,p.mana-12);if(hit&&b.status==='water')p.slippery=Math.max(p.slippery,3.2);if(hit&&b.status==='ember')p.burn=Math.max(p.burn,3);if(hit&&b.voidCaster?.hp>0)b.voidCaster.hp=Math.min(b.voidCaster.max,b.voidCaster.hp+Math.round((b.damage||7)*.9));b.life=0}
  }let liveHostile=0;for(const b of game.hostile)if(b.life>0)game.hostile[liveHostile++]=b;game.hostile.length=liveHostile
}
function finish(){game.phase='lost';mouse.down=false;window.SpellAudio?.play('lose');window.RealmSystem?.recordRun(game);$('modal').classList.remove('hidden');$('modalTitle').textContent=`Wave ${game.wave} reached`;const top=Object.entries(game.damageSources).sort((a,b)=>b[1]-a[1])[0],realm=window.RealmSystem?.current();$('modalText').textContent=`${realm?.name||'Arena'} · ${game.kills} defeated · Final hit: ${game.lastDamage||'Unknown'} · Most damage: ${top?`${top[0]} (${Math.round(top[1])})`:'none'}. Your Magic is saved.`;$('start').textContent='New run';say('Run over. Your Magic is saved.');window.SpellFeatures?.died?.(game)}
function waveSize(n){if(game.mode==='bossrush')return 1;const progress=effectiveWave(n),base=Math.min(48,7+Math.floor(progress*1.65));return Math.max(1,Math.round(base*(window.RealmSystem?.population?.(n)||1)*(window.SpellExpansion?.wavePopulation?.(game)||1)))}
function update(dt){
  if(game.phase!=='playing')return;time+=dt;
  const p=game.player,dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup')),m=Math.hypot(dx,dy)||1;
  p.animMoving=0;p.animAttack=Math.max(0,(p.animAttack||0)-dt);p.animHit=Math.max(0,(p.animHit||0)-dt);p.animDash=Math.max(0,(p.animDash||0)-dt);
  const moveSpeed=230*game.stats.moveSpeed*(p.slow>0?.68:1),wishX=dx/m*moveSpeed,wishY=dy/m*moveSpeed;
  if(p.slippery>0){const grip=(dx||dy)?1.9:.55;p.slipX+=(wishX-p.slipX)*Math.min(1,dt*grip);p.slipY+=(wishY-p.slipY)*Math.min(1,dt*grip);move(p,p.slipX,p.slipY,dt)}else{p.slipX=wishX;p.slipY=wishY;move(p,wishX,wishY,dt)}
  p.slippery=Math.max(0,p.slippery-dt);p.slow=Math.max(0,p.slow-dt);p.rupture=Math.max(0,p.rupture-dt);p.burn=Math.max(0,p.burn-dt);p.poison=Math.max(0,p.poison-dt);
  p.statusFx=(p.statusFx||0)-dt;if(p.statusFx<=0){if(p.slippery>0&&p.animMoving)particles(p.x-p.slipX*.035,p.y-p.slipY*.035,'#91edff',2,'shard',.2);else if(p.burn>0)particles(p.x,p.y,'#ff743b',1,'ember',.25);else if(p.poison>0)particles(p.x,p.y,'#8fe078',1,'spore',.2);p.statusFx=.08}
  if(p.burn>0||p.poison>0){p.statusTick-=dt;if(p.statusTick<=0){hurt((p.burn>0?2:0)+(p.poison>0?2:0),true,p.burn>0?'Burn':'Poison');p.statusTick=.5}}else p.statusTick=0;
  if(game.phase!=='playing')return;
  p.inv=Math.max(0,p.inv-dt);p.dash=Math.max(0,p.dash-dt);p.surge=Math.max(0,p.surge-dt);p.momentum=C(p.momentum+(dx||dy?dt:-dt*2),0,1);p.mana=Math.min(game.stats.maxMana,p.mana+24*game.stats.manaRegen*(game.route?.manaRegenMult??1)*(p.surge>0?2:1)*dt);game.cooldown=Math.max(0,game.cooldown-dt);
  if((mouse.down||keys.has('cast'))&&game.cooldown<=0)cast();
  for(const e of game.echoes.filter(v=>v.at<=time))if(!e.caster||e.caster.hp>0)shot(e.s,e.a,e.origin,e.depth||0,e.scale,e.castId,e.caster||null);
  game.echoes=game.echoes.filter(v=>v.at>time);
  const count=waveSize(game.wave);game.spawnTimer-=dt;
  if(game.mode!=='training'&&!game.bossInitializing&&game.spawned<count&&game.spawnTimer<=0){spawn();game.spawnTimer=Math.max(.22,.95-effectiveWave(game.wave)*.025)}
  updateShots(dt);updatePaths(dt);updateEnemies(dt);updateCurses(dt);reap();
  for(const mine of game.mines){mine.life-=dt;const victims=mine.caster?[p]:game.enemies.filter(e=>e.hp>0);if(victims.some(e=>D(e,mine)<e.r+35)){mine.life=0;const burst={...mine.s,shape:'ring'};shot(burst,0,mine,mine.depth,mine.scale,mine.castId,mine.caster);window.SpellAudio?.play('blast',C(mine.x/W*2-1,-1,1))}}game.mines=game.mines.filter(m=>m.life>0);
  for(const crystal of game.crystals)crystal.life-=dt;game.crystals=game.crystals.filter(v=>v.life>0);
  for(const corpse of game.corpses)corpse.life-=dt;game.corpses=game.corpses.filter(v=>v.life>0);
  if(game.phase!=='playing')return;
  if(game.mode!=='training'&&game.spawned===count&&game.enemies.length===0){SS.addMagic(Math.round((25+game.wave*10+Math.floor(Math.max(0,game.wave-10)**1.35*2))*(window.RealmSystem?.reward()||1)*(game.waveEvent==='bounty'?1.25:1)*(game.route?.reward||1)),`wave ${game.wave} cleared`);optionalHook('realm progress',()=>window.RealmSystem?.waveCleared(game));if(game.mode!=='noheal')p.hp=Math.min(game.stats.maxHp,p.hp+game.stats.waveHeal);p.mana=Math.min(game.stats.maxMana,p.mana+35);wave(game.wave+(game.mode==='bossrush'?5:1))}
  window.SpellAudio?.update(game);
  window.SpellFeatures?.update?.(dt,game);window.SpellExpansion?.update?.(dt,game);
  let liveParticles=0;for(const a of game.particles){a.x+=a.vx*dt;a.y+=a.vy*dt;a.vy+=(a.gravity||0)*dt;const drag=Math.pow(a.drag??.975,dt*60);a.vx*=drag;a.vy*=drag;a.spin+=(a.turn||0)*dt;a.life-=dt;if(a.life>0)game.particles[liveParticles++]=a;else if(particlePool.length<600)particlePool.push(a)}game.particles.length=liveParticles;
  let liveLines=0;for(const a of game.lines){a.life-=dt;if(a.life>0)game.lines[liveLines++]=a}if(liveLines>180){game.lines.copyWithin(0,liveLines-180,liveLines);liveLines=180}game.lines.length=liveLines;
  let liveBlasts=0;for(const a of game.blasts){a.life-=dt;if(a.life>0)game.blasts[liveBlasts++]=a}if(liveBlasts>80){game.blasts.copyWithin(0,liveBlasts-80,liveBlasts);liveBlasts=80}game.blasts.length=liveBlasts;
  game.noticeTime-=dt;game.hudClock=(game.hudClock||0)-dt;if(game.hudClock<=0){game.hudClock=.06;if(game.noticeTime<=0)$('status').textContent=`${game.kills} defeated · ${game.enemies.length} enemies active · ${SS.magic} Magic · Shield ${Math.ceil(p.shield)}/60`;$('hpBar').style.width=p.hp/game.stats.maxHp*100+'%';$('manaBar').style.width=p.mana/game.stats.maxMana*100+'%';$('hpText').textContent=`${Math.ceil(p.hp)} / ${game.stats.maxHp}`;$('manaText').textContent=`${Math.floor(p.mana)} / ${game.stats.maxMana}`}
}
function drawCurses(){
  g.save();
  for(const curse of game.curses){
    const gathering=!curse.locked,radius=gathering?110-77*C(curse.age/curse.gather,0,1):33,centers=gathering?[game.player,curse.caster]:[{x:curse.x,y:curse.y},{x:curse.casterX,y:curse.casterY}];
    g.strokeStyle=gathering?'#b18ce4aa':'#f4b7ff';g.lineWidth=gathering?2:4;
    for(const center of centers){
      g.beginPath();g.arc(center.x,center.y,radius,0,Math.PI*2);g.stroke();
      for(let i=0;i<14;i++){const a=i*Math.PI*2/14+(gathering?time*3:curse.gather*3),x=center.x+Math.cos(a)*radius,y=center.y+Math.sin(a)*radius;g.fillStyle=i%2?'#a968df':'#e2b5ff';g.fillRect(x-3,y-3,6,6)}
    }
    if(!gathering){g.fillStyle='#f5d9ff';g.font='bold 16px system-ui';g.textAlign='center';g.fillText((curse.gather+curse.freeze-curse.age).toFixed(1),curse.x,curse.y-45)}
  }
  for(const blast of game.blasts){g.globalAlpha=C(blast.life/blast.max,0,1)*(window.SpellFeatures?.settings?.reducedFlash?.25:.5);g.fillStyle=blast.col||'#a550d8';g.beginPath();g.arc(blast.x,blast.y,blast.radius*(1.6-blast.life/blast.max*.6),0,Math.PI*2);g.fill();g.strokeStyle=blast.col||'#ecc3ff';g.lineWidth=4;g.stroke()}
  g.restore()
}
function drawEnemyModel(e,col,transform=null){
  const flash=e.flash>0&&!window.SpellFeatures?.settings?.reducedFlash,fill=flash?'#fff':col,dark='#2a2637';g.save();g.translate(e.x,e.y);g.rotate(e.face||0);if(transform){g.translate(transform.x||0,transform.y||0);g.rotate(transform.rotate||0);g.scale(transform.scaleX??1,transform.scaleY??1);g.globalAlpha=transform.alpha??1}g.lineWidth=3;g.strokeStyle=dark;g.fillStyle=fill;
  const poly=points=>{g.beginPath();g.moveTo(points[0][0],points[0][1]);for(const p of points.slice(1))g.lineTo(p[0],p[1]);g.closePath();g.fill();g.stroke()};
  if(e.type==='chaser'){poly([[e.r+6,0],[-e.r,-e.r*.8],[-e.r*.55,0],[-e.r,e.r*.8]]);g.fillStyle='#fff0dc';poly([[e.r+5,-6],[e.r+13,0],[e.r+5,6]]);g.fillStyle=dark;g.fillRect(0,-7,5,4)}
  else if(e.type==='shooter'){poly([[e.r*.3,-e.r],[-e.r*.8,-e.r*.65],[-e.r,e.r], [e.r*.55,e.r]]);g.beginPath();g.arc(1,-e.r*.55,e.r*.42,0,7);g.fill();g.stroke();g.fillStyle='#eadcff';g.fillRect(4,-5,e.r+18,10);g.fillStyle=dark;g.fillRect(e.r+12,-3,8,6)}
  else if(e.type==='charger'){poly([[e.r+12,0],[-e.r,-e.r],[-e.r*.45,0],[-e.r,e.r]]);g.strokeStyle='#ffe0a1';g.lineWidth=5;g.beginPath();g.moveTo(-4,-e.r*.7);g.lineTo(e.r+8,-e.r-5);g.moveTo(-4,e.r*.7);g.lineTo(e.r+8,e.r+5);g.stroke()}
  else if(e.type==='splitter'){g.beginPath();g.arc(-e.r*.38,0,e.r*.72,-1.3,1.3);g.arc(e.r*.38,0,e.r*.72,1.8,4.5);g.closePath();g.fill();g.stroke();g.strokeStyle='#d8ffb9';g.beginPath();g.moveTo(0,-e.r);g.lineTo(0,e.r);g.stroke()}
  else if(e.type==='swarm'){poly([[e.r+5,0],[0,-e.r],[-e.r,0],[0,e.r]]);g.strokeStyle='#d8ffb9';for(const y of [-6,0,6]){g.beginPath();g.moveTo(-4,y);g.lineTo(-e.r-7,y+(y?Math.sign(y)*5:0));g.stroke()}}
  else if(e.type==='tank'){g.fillStyle='#514a67';g.fillRect(-e.r-7,-e.r,e.r*2+14,9);g.fillRect(-e.r-7,e.r-9,e.r*2+14,9);g.fillStyle=fill;g.fillRect(-e.r,-e.r*.7,e.r*1.8,e.r*1.4);g.strokeRect(-e.r,-e.r*.7,e.r*1.8,e.r*1.4);g.fillStyle='#c6bde3';g.fillRect(-3,-8,e.r+18,16);g.fillStyle=dark;g.fillRect(e.r+9,-5,10,10)}
  else if(e.type==='wisp'){g.beginPath();g.moveTo(e.r,0);g.bezierCurveTo(e.r*.2,-e.r,-e.r*.8,-e.r*.8,-e.r,0);g.bezierCurveTo(-e.r*.4,e.r*.2,-e.r*.7,e.r,-2,e.r*.55);g.bezierCurveTo(e.r*.35,e.r,e.r*.2,e.r*.2,e.r,0);g.fill();g.stroke();g.fillStyle='#e8ffff';g.fillRect(1,-6,4,4);g.fillRect(1,3,4,4)}
  else if(e.type==='golden'){for(let i=0;i<8;i++){g.save();g.rotate(i*Math.PI/4);g.fillStyle='#8b6b2d';g.fillRect(e.r*.55,-4,e.r*.75,8);g.restore()}poly([[e.r,0],[e.r*.7,e.r*.7],[0,e.r],[-e.r*.7,e.r*.7],[-e.r,0],[-e.r*.7,-e.r*.7],[0,-e.r],[e.r*.7,-e.r*.7]]);g.fillStyle='#fff0ad';g.beginPath();g.arc(0,0,e.r*.35,0,7);g.fill()}
  else if(e.type==='sentinel'){for(let i=0;i<4;i++){g.save();g.rotate(i*Math.PI/2);g.fillStyle='#8a6a35';g.fillRect(e.r*.55,-5,e.r*.85,10);g.restore()}g.fillStyle=fill;g.fillRect(-e.r*.7,-e.r*.7,e.r*1.4,e.r*1.4);g.strokeRect(-e.r*.7,-e.r*.7,e.r*1.4,e.r*1.4)}
  else if(e.type==='crimson'){g.fillStyle=flash?'#fff':'#682139';g.fillRect(-e.r,-e.r*.75,e.r*2,e.r*1.5);g.strokeRect(-e.r,-e.r*.75,e.r*2,e.r*1.5);g.fillStyle='#b44e5a';for(let i=-1;i<=1;i++)g.fillRect(-e.r+i*e.r*.7,-e.r*.95,10,12);g.fillRect(e.r-2,-5,27,10)}
  else if(e.type==='healer'){poly([[e.r*.25,-e.r],[-e.r*.55,-e.r*.55],[-e.r,e.r],[e.r*.65,e.r]]);g.fillStyle='#eaffef';g.fillRect(-3,-12,6,24);g.fillRect(-12,-3,24,6);g.strokeStyle='#a5ffd0';g.beginPath();g.moveTo(e.r*.35,-e.r);g.lineTo(e.r*.35,e.r);g.stroke()}
  else if(e.type==='sniper'){g.fillStyle=fill;g.fillRect(-e.r,-7,e.r*1.5,14);g.strokeRect(-e.r,-7,e.r*1.5,14);g.fillStyle='#ffd2df';g.fillRect(-1,-4,e.r+31,8);g.fillStyle=dark;g.fillRect(e.r+22,-2,12,4);g.fillRect(-e.r*.5,7,6,10)}
  else if(e.type==='burrower'){poly([[e.r+8,0],[0,-e.r],[-e.r,0],[0,e.r]]);g.strokeStyle='#dac3ef';for(let i=0;i<3;i++){g.beginPath();g.arc(e.r-i*7,0,5+i*2,-1.2,1.2);g.stroke()}g.fillStyle=dark;g.fillRect(-7,-7,5,5);g.fillRect(-7,3,5,5)}
  else if(e.type==='shieldbearer'){g.fillStyle=fill;g.fillRect(-e.r*.8,-e.r*.65,e.r*1.4,e.r*1.3);g.strokeRect(-e.r*.8,-e.r*.65,e.r*1.4,e.r*1.3);g.fillStyle='#e9dcaa';g.beginPath();g.moveTo(e.r*.25,-e.r-7);g.lineTo(e.r+9,-e.r*.72);g.lineTo(e.r+9,e.r*.72);g.lineTo(e.r*.25,e.r+7);g.closePath();g.fill();g.stroke();g.fillStyle='#806b42';g.fillRect(e.r*.45,-3,e.r*.75,6)}
  else if(e.type==='mimic'||e.type==='mirror'){poly([[e.r*.2,-e.r],[-e.r*.65,-e.r*.45],[-e.r,e.r],[e.r*.45,e.r]]);g.fillStyle=e.type==='mirror'?'#d6ffff':'#d9f6ff';g.fillRect(3,-4,e.r+18,8);g.fillStyle=dark;g.fillRect(e.r+12,-3,9,6);g.fillRect(-5,-8,5,5);g.fillRect(-5,3,5,5)}
  else if(e.type==='voidmage'||e.type==='voidboss'){poly([[e.r*.45,-e.r],[-e.r*.7,-e.r*.55],[-e.r,e.r],[0,e.r*.65],[e.r,e.r]]);g.fillStyle='#e7caff';g.fillRect(-10,-6,6,8);g.fillRect(4,-6,6,8);if(e.type==='voidboss'){g.strokeStyle='#c792ff';g.lineWidth=5;g.beginPath();g.arc(0,0,e.r+9,0,7);g.stroke();for(let i=6-e.orbs;i<6;i++){const a=e.age*1.8+i*Math.PI/3;g.fillStyle='#d39aff';g.beginPath();g.arc(Math.cos(a)*(e.r+24),Math.sin(a)*(e.r+24),8,0,7);g.fill()}}}
  else if(e.type==='frostboss'){poly([[0,-e.r-9],[e.r*.65,-e.r*.3],[e.r+5,e.r*.5],[0,e.r+7],[-e.r-5,e.r*.5],[-e.r*.65,-e.r*.3]]);g.fillStyle='#e5ffff';for(const x of [-20,0,20])poly([[x,-e.r*.2],[x+9,e.r*.45],[x-9,e.r*.45]])}
  else if(e.type==='splitboss'){g.fillStyle='#ffb077';g.beginPath();g.arc(0,0,e.r,-Math.PI/2,Math.PI/2);g.fill();g.fillStyle='#e2a2e9';g.beginPath();g.arc(0,0,e.r,Math.PI/2,Math.PI*1.5);g.fill();g.strokeStyle=dark;g.beginPath();g.moveTo(0,-e.r);g.lineTo(0,e.r);g.stroke();g.fillStyle='#fff0cf';g.fillRect(5,-6,e.r+15,12)}
  else if(e.type==='splitA'){poly([[e.r+8,0],[-e.r,-e.r],[-e.r*.5,0],[-e.r,e.r]]);g.fillStyle='#ffe0af';g.fillRect(0,-4,e.r+10,8)}
  else if(e.type==='splitB'){g.fillStyle=fill;g.fillRect(-e.r,-e.r*.7,e.r*1.7,e.r*1.4);g.strokeRect(-e.r,-e.r*.7,e.r*1.7,e.r*1.4);g.fillStyle='#f9dcff';g.fillRect(0,-4,e.r+18,8)}
  else if(e.type==='engine'){g.rotate(e.initializing?0:e.age*.18-e.face);const arms=e.initializing?e.introArms:Math.max(2,Math.ceil(12*e.hp/e.max));for(let slot=0;slot<arms;slot++){const i=engineArmOrder[slot];g.save();g.rotate(i*Math.PI/6);const pair=Math.floor(slot/2),extension=e.initializing?C((e.introTime-(.45+pair*.38))/.22,0,1):1;g.scale(extension,.45+extension*.55);g.fillStyle=e.attack<.65?'#fff2aa':'#a97a39';g.fillRect(25,-7,45,14);g.fillStyle=e.attack<.65?'#fff':'#f9d06d';g.fillRect(55,-5,15,10);g.restore()}g.fillStyle=fill;poly([[0,-e.r], [e.r*.7,-e.r*.7],[e.r,0],[e.r*.7,e.r*.7],[0,e.r],[-e.r*.7,e.r*.7],[-e.r,0],[-e.r*.7,-e.r*.7]]);g.fillStyle='#5d4524';g.beginPath();g.arc(0,0,e.r*.42,0,7);g.fill()}
  else{g.beginPath();g.arc(0,0,e.r,0,7);g.fill();g.stroke()}
  g.restore()
}
function drawBossArrival(e){
  if(!e.initializing||e.type==='engine')return;
  const t=bossIntroProgress(e),smooth=t*t*(3-2*t),fade=C(Math.min(t*4,(1-t)*9+1),0,1);g.save();g.globalAlpha=fade;
  if(e.type==='mirror'){
    const blocks=e.introBlocks?.length?e.introBlocks:[{name:'Spell',kind:'shape'}],close=C((t-.2)/.58,0,1),collapse=close*close*(3-2*close),radius=155*(1-collapse),blockScale=.72*(1-collapse)+.18,kindColors={element:'#b75646',shape:'#8360af',elasticity:'#347e9b',behavior:'#a67b37',control:'#b88a54'};
    g.fillStyle='#8ff5ff';g.globalAlpha=.3+.45*Math.sin(t*20)**2;g.beginPath();g.arc(e.x,e.y,5+10*collapse,0,Math.PI*2);g.fill();g.globalAlpha=fade*C((.84-t)/.06,0,1);
    for(let i=0;i<blocks.length;i++){const block=blocks[i],a=t*5+i*Math.PI*2/blocks.length,x=e.x+Math.cos(a)*radius,y=e.y+Math.sin(a)*radius,w=Math.max(42,Math.min(86,22+block.name.length*5))*blockScale,h=25*blockScale;g.save();g.translate(x,y);g.rotate(a+Math.PI/2);g.fillStyle=kindColors[block.kind]||'#5f83aa';g.strokeStyle='#d9fbff';g.lineWidth=Math.max(1,1.5*blockScale);g.beginPath();g.moveTo(-w/2,-h/2);g.lineTo(-w*.18,-h/2);g.lineTo(-w*.1,-h*.2);g.lineTo(w*.12,-h*.2);g.lineTo(w*.2,-h/2);g.lineTo(w/2,-h/2);g.lineTo(w/2,h/2);g.lineTo(w*.2,h/2);g.lineTo(w*.12,h*.2);g.lineTo(-w*.1,h*.2);g.lineTo(-w*.18,h/2);g.lineTo(-w/2,h/2);g.closePath();g.fill();g.stroke();if(blockScale>.38){g.rotate(-a-Math.PI/2);g.fillStyle='#fff8ee';g.font=`bold ${Math.max(6,10*blockScale)}px system-ui`;g.textAlign='center';g.textBaseline='middle';g.fillText(block.name,0,0,Math.max(35,w-8))}g.restore()}
    g.strokeStyle='#9ffaff';g.lineWidth=2;g.setLineDash([7,7]);g.beginPath();g.arc(e.x,e.y,Math.max(8,radius),0,Math.PI*2);g.stroke();g.setLineDash([]);if(t>.78){const burst=C((t-.78)/.22,0,1);g.globalAlpha=(1-burst)*.8;g.lineWidth=6*(1-burst)+1;g.beginPath();g.arc(e.x,e.y,18+burst*105,0,Math.PI*2);g.stroke()}
  }else if(e.type==='voidboss'){
    const portal=18+smooth*75;g.strokeStyle='#bb75ff';g.lineWidth=5;for(let i=0;i<3;i++){g.globalAlpha=fade*(.22+i*.16);g.beginPath();g.arc(e.x,e.y,portal+i*13,t*5+i,-t*4+i+Math.PI*1.55);g.stroke()}g.globalAlpha=fade;const count=Math.min(6,Math.floor(C((t-.2)/.09,0,1)*6)),radius=e.r+24+(1-smooth)*110;for(let i=0;i<count;i++){const a=t*5+i*Math.PI/3;drawSprite('void_orb',e.x+Math.cos(a)*radius,e.y+Math.sin(a)*radius,24,a+.5,fade)}
  }else if(e.type==='frostboss'){
    g.fillStyle='#a8f4ff99';g.strokeStyle='#e8ffff';g.lineWidth=2;for(let i=0;i<7;i++){const a=i*Math.PI*2/7,x=e.x+Math.cos(a)*(e.r+20),height=(18+((i*17)%24))*smooth;g.beginPath();g.moveTo(x,e.y+e.r+16);g.lineTo(x-7,e.y+e.r+16-height);g.lineTo(x+3,e.y+e.r+9-height*1.3);g.lineTo(x+8,e.y+e.r+16);g.closePath();g.fill();g.stroke()}
  }else if(e.type==='splitboss'){
    const gap=(1-smooth)*150;for(const side of [-1,1]){g.fillStyle=side<0?'#ff995e88':'#dda6ff88';g.beginPath();g.arc(e.x+side*gap,e.y,e.r*.72,side<0?-Math.PI/2:Math.PI/2,side<0?Math.PI/2:Math.PI*1.5);g.fill();g.strokeStyle=side<0?'#ffc08d':'#f0c4ff';g.stroke()}g.strokeStyle='#fff0cf';g.lineWidth=3;g.beginPath();g.moveTo(e.x-gap,e.y);g.lineTo(e.x+gap,e.y);g.stroke()
  }else if(e.type==='tempestboss'){
    g.strokeStyle='#e5c8ff';g.lineWidth=3;for(let i=0;i<4;i++){let x=e.x+(i-1.5)*31;g.beginPath();g.moveTo(x+(i%2?18:-18),0);for(let y=28;y<e.y-20;y+=28)g.lineTo(x+Math.sin(i*7+y*.17)*17,y);g.lineTo(e.x,e.y);g.stroke()}g.fillStyle='#d6b1ff33';g.beginPath();g.arc(e.x,e.y,e.r+28+Math.sin(t*25)*5,0,Math.PI*2);g.fill()
  }else if(e.type==='broodboss'){
    g.strokeStyle='#83df72';g.lineWidth=5;for(let i=0;i<7;i++){const a=i*Math.PI/7+Math.PI*.08,length=(e.r+35)*smooth;g.beginPath();g.moveTo(e.x,e.y+e.r*.45);g.lineTo(e.x+Math.cos(a)*length*.55,e.y+Math.abs(Math.sin(a))*length*.35);g.lineTo(e.x+Math.cos(a)*length,e.y+Math.abs(Math.sin(a))*length);g.stroke()}g.fillStyle='#b7f29a88';for(let i=0;i<5;i++){const a=i*2.1+t;g.beginPath();g.arc(e.x+Math.cos(a)*(e.r+18)*smooth,e.y+Math.sin(a)*(e.r+18)*smooth,4+i%2*2,0,7);g.fill()}
  }else if(e.type==='sunboss'){
    g.translate(e.x,e.y);g.rotate(t*1.8);for(let i=0;i<12;i++){g.rotate(Math.PI/6);g.fillStyle=i%2?'#ffb85c55':'#ffe99088';g.beginPath();g.moveTo(e.r*.4,0);g.lineTo((e.r+95)*smooth,-5);g.lineTo((e.r+95)*smooth,5);g.closePath();g.fill()}g.strokeStyle='#fff1a0';g.lineWidth=4;g.beginPath();g.arc(0,0,e.r+16+(1-smooth)*80,0,Math.PI*2);g.stroke()
  }else if(e.type==='prismboss'){
    g.fillStyle='#69f3e299';g.strokeStyle='#dffffa';g.lineWidth=2;for(let i=0;i<8;i++){const a=i*Math.PI/4-t*2,r=e.r+12+(1-smooth)*145,x=e.x+Math.cos(a)*r,y=e.y+Math.sin(a)*r;g.save();g.translate(x,y);g.rotate(a+t*3);g.beginPath();g.moveTo(12,0);g.lineTo(0,-7);g.lineTo(-10,0);g.lineTo(0,7);g.closePath();g.fill();g.stroke();g.restore()}g.globalAlpha*=.35;g.beginPath();g.moveTo(e.x,e.y-e.r-25);g.lineTo(e.x+e.r+25,e.y);g.lineTo(e.x,e.y+e.r+25);g.lineTo(e.x-e.r-25,e.y);g.closePath();g.stroke()
  }
  g.restore()
}
function draw(){
  if(window.RealmSystem)window.RealmSystem.draw(g,W,H,time);else{g.fillStyle='#121b2a';g.fillRect(0,0,W,H)}g.strokeStyle='#ffffff0b';g.lineWidth=1;
  for(let x=0;x<W;x+=40){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke()}
  for(let y=0;y<H;y+=40){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}
  for(let o of rocks)if(!drawSprite('stone',o.x,o.y,o.r*3)){g.fillStyle='#4e596f';g.beginPath();g.arc(o.x,o.y,o.r,0,7);g.fill();g.strokeStyle='#8490a5';g.lineWidth=3;g.stroke()}
  for(const o of game.crystals)if(!drawSprite('crystal',o.x,o.y,o.r*3)){g.fillStyle='#7edacc99';g.strokeStyle='#aaffff';g.lineWidth=3;g.beginPath();g.moveTo(o.x,o.y-o.r);g.lineTo(o.x+o.r,o.y);g.lineTo(o.x,o.y+o.r);g.lineTo(o.x-o.r,o.y);g.closePath();g.fill();g.stroke()}
  for(const m of game.mines)if(!drawSprite('mine',m.x,m.y,72+Math.sin(time*8)*4)){g.fillStyle=m.caster?'#fb8093':'#c3a6ff';g.beginPath();g.arc(m.x,m.y,13+Math.sin(time*8)*3,0,7);g.fill();g.strokeStyle='#fff3';g.beginPath();g.arc(m.x,m.y,35,0,7);g.stroke()}
  for(const path of game.paths){g.save();g.globalAlpha=.35+.45*(1-path.life/path.max);g.strokeStyle='#ff708e';g.lineWidth=3;g.setLineDash([8,7]);g.beginPath();path.points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();g.setLineDash([]);for(let i=5;i<path.points.length;i+=7){const p=path.points[i];g.fillStyle='#ff9aae';g.fillRect(p.x-2,p.y-2,4,4)}g.restore()}
  const shotDrawStep=Math.max(1,Math.ceil(game.shots.length/((game.fxQuality??1)<.7?380:650)));if(game.fxQuality>.62&&game.shots.length<360){g.save();g.globalAlpha=.16;for(const b of game.shots){g.fillStyle=b.caster?'#ff668d':color[b.element]||'#fff';g.beginPath();g.arc(b.x,b.y,b.r+7,0,7);g.fill()}g.restore()}
  for(let shotIndex=0;shotIndex<game.shots.length;shotIndex+=shotDrawStep){const b=game.shots[shotIndex];g.fillStyle=b.caster?'#ffb5d1':color[b.element];if(b.beam){g.strokeStyle=g.fillStyle;g.lineWidth=5;g.beginPath();g.moveTo(b.x-b.vx*.035,b.y-b.vy*.035);g.lineTo(b.x,b.y);g.stroke()}g.beginPath();g.arc(b.x,b.y,b.r,0,7);g.fill();if(!b.caster&&b.elements.length>1){g.strokeStyle=color[b.elements[0]]||'#fff';g.lineWidth=2;g.beginPath();g.arc(b.x,b.y,b.r+3,0,7);g.stroke()}}
  for(let b of game.hostile){if(b.curve){const a=Math.atan2(b.vy,b.vx);g.save();g.translate(b.x,b.y);g.rotate(a);g.fillStyle='#d8b5ff';g.strokeStyle='#251440';g.lineWidth=2;g.beginPath();g.moveTo(11,0);g.lineTo(-4,-7);g.lineTo(0,0);g.lineTo(-4,7);g.closePath();g.fill();g.stroke();g.restore()}else if(b.missile){let a=Math.atan2(b.vy,b.vx);if(!drawSprite('missile',b.x,b.y,46,a)){g.save();g.translate(b.x,b.y);g.rotate(a);g.fillStyle=b.homing>0?'#ffe38a':'#f5a557';g.beginPath();g.moveTo(12,0);g.lineTo(-8,-7);g.lineTo(-5,0);g.lineTo(-8,7);g.closePath();g.fill();g.fillStyle='#ff785d';g.fillRect(-14,-3,6,6);g.restore()}}else if(b.orb){if(!drawSprite('void_orb',b.x,b.y,42)){g.fillStyle='#b578f6';g.beginPath();g.arc(b.x,b.y,b.r,0,7);g.fill()}}else if(b.elemental){const hue=b.elemental==='water'?'#65d9ff':b.elemental==='ember'?'#ff7a3d':'#d2b7ff';g.globalAlpha=.18;g.fillStyle=hue;g.beginPath();g.arc(b.x,b.y,b.r+7,0,7);g.fill();g.globalAlpha=1;g.beginPath();g.arc(b.x,b.y,b.r,0,7);g.fill();g.strokeStyle='#fff9';g.lineWidth=2;g.beginPath();g.arc(b.x-2,b.y-2,b.r*.45,Math.PI,Math.PI*1.7);g.stroke()}else{g.fillStyle='#fb8093';g.beginPath();g.arc(b.x,b.y,b.r,0,7);g.fill()}}
  for(const corpse of game.corpses){const t=C(corpse.life/corpse.max,0,1),size=corpse.r*(corpse.boss?3:2.8),fall=1-t;drawAnimatedSprite(corpse.type,corpse.x,corpse.y,size,corpse.face,Math.min(1,t*1.8),corpse,{x:fall*corpse.r*.35,y:fall*corpse.r*.5,rotate:fall*(corpse.boss?.65:1.25),scaleX:Math.max(.05,t),scaleY:Math.max(.05,t*t)},4);g.strokeStyle=corpse.boss?'#ffe19a99':'#ffffff44';g.lineWidth=corpse.boss?5:2;g.beginPath();g.arc(corpse.x,corpse.y,corpse.r*(1+fall*2.2),0,Math.PI*2);g.stroke()}
  const enemyColor={chaser:'#ed8682',shooter:'#d48ac7',charger:'#f2ac6c',splitter:'#90c879',swarm:'#b0e783',tank:'#9b91c4',wisp:'#80d8e4',golden:'#f1ca78',sentinel:'#e4b85c',crimson:'#872b42',engine:'#ffe083',mirror:'#a9ebeb',voidboss:'#7b51a7',voidmage:'#a276cf',healer:'#83d7ae',sniper:'#d9749d',burrower:'#9675a9',shieldbearer:'#bdac74',mimic:'#90cbd3',frostboss:'#96e4ee',splitboss:'#f0a3ad',splitA:'#ffb077',splitB:'#e2a2e9',cinderhound:'#ff744d',rimeweaver:'#70dff3',thunderhead:'#c68aff',sporebrute:'#79db72',sunlancer:'#ffe17e',riftstalker:'#ad6cff',shardsmith:'#5de1d1',graviton:'#8f83ff',vectorscribe:'#8d63dc',furnacehound:'#ff7045',avalancheknight:'#8de8f3',stormchoir:'#c68aff',sporemonarch:'#83dc70',gravityjailer:'#9187ff',tempestboss:'#c68aff',broodboss:'#79db72',sunboss:'#ffe17e',prismboss:'#5de1d1'};
  for(let e of game.enemies){
    if(e.hidden){g.strokeStyle='#a989cb';g.lineWidth=2;g.beginPath();g.arc(e.x,e.y,e.r+9,0,7);g.stroke();continue}
    let spriteDrawn=false;const anim=bossIntroAnimation(e,enemyAnimation(e)),spriteAlpha=(e.flash>0?.72:1)*anim.alpha;drawBossArrival(e);
    if(e.type==='engine'){const arms=e.initializing?e.introArms:Math.max(2,Math.ceil(12*e.hp/e.max)),spin=e.initializing?e.bodyAngle:e.age*.18,coreScale=e.initializing?C(e.introTime/.45,0,1):1,coreAnim={...anim,scaleX:anim.scaleX*coreScale,scaleY:anim.scaleY*coreScale};
      if(animatedAtlases['bosses-a']?.complete&&animatedAtlases['bosses-a'].naturalWidth){const armClip=path=>{path.arc(0,0,e.r*.83,0,Math.PI*2);for(let slot=0;slot<arms;slot++){const i=engineArmOrder[slot],pair=Math.floor(slot/2),extension=e.initializing?C((e.introTime-(.45+pair*.38))/.22,0,1):1,a=i*Math.PI/6,r=e.r*(.83+.74*extension);path.moveTo(0,0);path.arc(0,0,r,a-.23,a+.23);path.closePath()}};spriteDrawn=drawAnimatedSprite('engine',e.x,e.y,e.r*3,spin,spriteAlpha,e,coreAnim,null,armClip)}
      else{for(let slot=0;slot<arms;slot++){const i=engineArmOrder[slot],pair=Math.floor(slot/2),extension=e.initializing?C((e.introTime-(.45+pair*.38))/.22,0,1):1,armAnim={...anim,scaleX:anim.scaleX*extension,scaleY:anim.scaleY*(.45+extension*.55)};drawSprite('engine_arm',e.x,e.y,e.r*3,spin+i*Math.PI/6,spriteAlpha*extension,armAnim)}spriteDrawn=drawSprite('engine_core',e.x,e.y,e.r*3,spin,spriteAlpha,coreAnim)}}
    else if(e.type==='voidboss'){spriteDrawn=drawAnimatedSprite('voidboss',e.x,e.y,e.r*3,e.face||0,spriteAlpha,e,anim)}
    else{const alias=animatedAlias[e.type]||e.type,spriteScale=e.type==='mirror'?4.4:bossTypes.includes(e.type)?3:minibossTypes.includes(e.type)?3.5:2.8;spriteDrawn=drawAnimatedSprite(alias,e.x,e.y,e.r*spriteScale,e.face||0,spriteAlpha,e,anim)}
    if(!spriteDrawn)drawEnemyModel(e,enemyColor[e.type]||'#d8cad8',anim);else if(e.flash>0&&!window.SpellFeatures?.settings?.reducedFlash){g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.arc(e.x,e.y,e.r+4,0,7);g.stroke()}
    if(e.type==='mirror'){g.fillStyle=e.dodge<=0?'#86d9ed':'#607c90';g.fillRect(e.x-18,e.y-e.r-20,36*e.mana/e.maxMana,4);g.strokeStyle=e.dodge<=0?'#a7f7ed':'#556b78';g.lineWidth=2;g.beginPath();g.arc(e.x,e.y,e.r+10,0,7);g.stroke()}
    if(e.ward>0){g.strokeStyle='#fff1a8';g.lineWidth=4;g.globalAlpha=.45+.35*Math.sin(time*18);g.beginPath();g.arc(e.x,e.y,e.r+15,0,7);g.stroke();g.globalAlpha=1}
    else if(e.castGuard>0){g.strokeStyle='#9ee9ff';g.lineWidth=3;g.globalAlpha=.8;g.beginPath();g.arc(e.x,e.y,e.r+10,0,7);g.stroke();g.globalAlpha=1}
    if(e.type==='sniper'&&e.charge>0){g.strokeStyle='#ff7c9caa';g.lineWidth=2;g.beginPath();g.moveTo(e.x,e.y);g.lineTo(e.x+Math.cos(e.lockedFace)*900,e.y+Math.sin(e.lockedFace)*900);g.stroke()}
    if(e.trait){g.strokeStyle=({shielded:'#86dbf6',swift:'#fbdd83',volatile:'#ff8a72',draining:'#b587f6'})[e.trait];g.lineWidth=3;g.beginPath();g.arc(e.x,e.y,e.r+7,0,7);g.stroke();g.fillStyle=g.strokeStyle;g.font='bold 11px system-ui';g.fillText(e.trait.toUpperCase(),e.x-24,e.y-e.r-18)}
    if(e.charge>0){g.strokeStyle='#ffd37c88';g.lineWidth=2;g.beginPath();g.moveTo(e.x,e.y);g.lineTo(e.x+e.dx*75,e.y+e.dy*75);g.stroke()}
    if(!e.initializing){let bar=bossTypes.includes(e.type)?90:minibossTypes.includes(e.type)?68:42;g.fillStyle='#1f2532';g.fillRect(e.x-bar/2,e.y-e.r-12,bar,5);g.fillStyle=e.type==='engine'?'#f8d181':e.type==='mirror'?'#8de8e7':e.type==='voidboss'?'#ce98ff':'#f2a09c';g.fillRect(e.x-bar/2,e.y-e.r-12,bar*C(e.hp/e.max,0,1),5);
    if(minibossTypes.includes(e.type)){g.fillStyle=enemyColor[e.type];g.font='bold 12px system-ui';g.textAlign='center';g.fillText(({furnacehound:'Furnace Hound',avalancheknight:'Avalanche Knight',stormchoir:'Storm Choir',sporemonarch:'Spore Monarch',gravityjailer:'Gravity Jailer'})[e.type]+' · '+Math.ceil(e.hp)+' HP',e.x,e.y-e.r-22)}if(bossTypes.includes(e.type)){g.fillStyle=enemyColor[e.type];g.font='bold 13px system-ui';g.textAlign='center';g.fillText(`${({mirror:'Counterforge',engine:'Twelvefold Engine',voidboss:'Void Sovereign',frostboss:'Glacial Architect',splitboss:'Twin Crucible',tempestboss:'Tempest Crown',broodboss:'Brood Cathedral',sunboss:'Solar Regent',prismboss:'Prism Warden'})[e.type]||e.type} · ${Math.ceil(e.hp)} HP`,e.x,e.y-e.r-22)}}
  }
  let p=game.player,a=Math.atan2(mouse.y-p.y,mouse.x-p.x),playerStep=Math.sin((p.animStride||0)*1.7)*(p.animMoving||0),playerKick=Math.sin(C((p.animAttack||0)/.22,0,1)*Math.PI),playerHit=C((p.animHit||0)/.18,0,1),playerDash=Math.sin(C((p.animDash||0)/.22,0,1)*Math.PI),playerAnim={x:-playerKick*7+Math.sin(time*65)*playerHit*5,y:Math.abs(playerStep)*1.4,rotate:playerStep*.018+Math.sin(time*52)*playerHit*.08,scaleX:1+playerKick*.12+playerDash*.24-playerHit*.08,scaleY:1-playerKick*.06-playerDash*.12+playerHit*.08};if(!drawAnimatedSprite('player',p.x,p.y,76,a,p.inv>0&&Math.floor(time*15)%2 ? .45 : 1,p,playerAnim)){g.save();g.translate(p.x,p.y);g.rotate(a);g.fillStyle=p.inv>0&&Math.floor(time*15)%2?'#fff':'#83dec8';g.strokeStyle='#214c54';g.lineWidth=3;g.beginPath();g.moveTo(8,-4);g.lineTo(-8,-15);g.lineTo(-15,13);g.lineTo(7,10);g.closePath();g.fill();g.stroke();g.fillStyle='#f4d9a7';g.beginPath();g.arc(-2,-5,7,0,7);g.fill();g.fillStyle='#30435c';g.beginPath();g.moveTo(-13,-11);g.lineTo(2,-25);g.lineTo(8,-9);g.closePath();g.fill();g.fillRect(-18,-10,28,4);g.fillStyle='#f4d9a7';g.fillRect(6,-4,28,7);g.fillStyle='#ffd985';g.beginPath();g.arc(35,-.5,4,0,7);g.fill();g.restore()}
  drawCurses();
  g.strokeStyle='#f4dda888';g.beginPath();g.arc(mouse.x,mouse.y,11,0,7);g.stroke();
  for(let a of game.lines){g.strokeStyle=color.storm;g.lineWidth=4;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(a.tx,a.ty);g.stroke()}
  g.save();g.shadowBlur=0;for(const a of game.particles){const fade=C(a.life/a.max,0,1),grow=1-fade,size=a.size*(a.style==='smoke'?.8+grow*1.5:.45+fade*.7),alpha=fade*(a.style==='smoke'?.42:1);g.globalAlpha=alpha;g.fillStyle=a.col;g.strokeStyle=a.col;if(a.style==='ring'){g.lineWidth=2;g.beginPath();g.arc(a.x,a.y,size+grow*14,0,Math.PI*2);g.stroke()}else if(a.style==='shard'||a.style==='droplet'){const cs=Math.cos(a.spin),sn=Math.sin(a.spin),px=-sn,py=cs;g.beginPath();g.moveTo(a.x+cs*size*1.5,a.y+sn*size*1.5);g.lineTo(a.x+px*size*.65,a.y+py*size*.65);g.lineTo(a.x-cs*size,a.y-sn*size);g.lineTo(a.x-px*size*.65,a.y-py*size*.65);g.closePath();g.fill()}else if(a.style==='mote'||a.style==='spore'||a.style==='smoke'){g.beginPath();g.arc(a.x,a.y,size,0,Math.PI*2);g.fill();if(a.style==='spore'){g.fillStyle='#efffc8aa';g.fillRect(a.x-1,a.y-1,2,2)}}else{g.globalAlpha=alpha*.2;g.beginPath();g.arc(a.x,a.y,size*1.8,0,Math.PI*2);g.fill();g.globalAlpha=alpha;const speed=Math.hypot(a.vx,a.vy)||1,dx=a.vx/speed*size,dy=a.vy/speed*size;g.strokeStyle=a.col;g.lineWidth=Math.max(1,size*.55);g.beginPath();g.moveTo(a.x-dx,a.y-dy);g.lineTo(a.x+dx,a.y+dy);g.stroke()}}g.restore();g.globalAlpha=1
  window.SpellFeatures?.draw?.(g,game);window.SpellExpansion?.draw?.(g,game);
}
function frame(t){const raw=Math.min(.08,(t-last)/1000||.016);last=t;game.fxFrame=(game.fxFrame||raw)*.92+raw*.08;if(raw>.034)game.fxQuality=Math.max(.45,(game.fxQuality??1)-.14);else if(game.fxFrame>.024)game.fxQuality=Math.max(.5,(game.fxQuality??1)-.035);else if(game.fxFrame<.019)game.fxQuality=Math.min(1,(game.fxQuality??1)+.008);if(raw>.045&&game.particles.length>280){game.particles.copyWithin(0,game.particles.length-280);game.particles.length=280}let dt=Math.min(.04,raw)*(window.SpellExpansion?.timeScale?.(game)||1);update(dt);draw();const shake=game.shake||0,scale=window.SpellFeatures?.settings?.shake??.6;c.style.transform=shake&&scale?`translate(${R(-shake,shake)*scale}px,${R(-shake,shake)*scale}px)`:'';game.shake=Math.max(0,shake-dt*24);requestAnimationFrame(frame)}requestAnimationFrame(frame);
function aim(e){let r=c.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width*W;mouse.y=(e.clientY-r.top)/r.height*H}c.onpointermove=e=>{if(e.pointerType!=='touch'||mouse.down)aim(e)};c.onpointerdown=e=>{e.preventDefault?.();aim(e);mouse.down=true;c.setPointerCapture(e.pointerId);if(game.cooldown<=0)cast()};c.onpointerup=()=>mouse.down=false;c.onpointercancel=()=>mouse.down=false;
function mapped(raw){const bindings=window.SpellFeatures?.bindings||{};return Object.keys(bindings).find(action=>bindings[action]===raw)||raw}
function dash(){if(game.phase!=='playing'||game.player.dash>0)return;let p=game.player,dx=Number(keys.has('d'))-Number(keys.has('a')),dy=Number(keys.has('s'))-Number(keys.has('w')),m=Math.hypot(dx,dy);if(!m){let a=Math.atan2(mouse.y-p.y,mouse.x-p.x);dx=Math.cos(a);dy=Math.sin(a);m=1}for(let i=0;i<8;i++){move(p,dx/m*18,dy/m*18,1);for(const enemy of game.enemies)if(!bossTypes.includes(enemy.type)&&enemy.hp<=40&&D(p,enemy)<p.r+enemy.r)enemy.hp-=12}p.dash=game.stats.dashCooldown;p.animDash=.22;p.inv=.4;if(game.stats.phaseDash)for(const b of game.hostile)if(D(b,p)<100)b.life=0;if(game.stats.aegis&&game.hostile.some(b=>D(b,p)<120))grantShield(12);window.SpellAudio?.play('dash',C(dx/m*.55,-.55,.55));particles(p.x,p.y,'#a5ffdf',15);game.trails?.push({x:p.x,y:p.y,life:.3})}
function togglePause(){if(editorPause||journalPause)return;if(game.phase==='playing'){game.phase='paused';say('Paused.')}else if(game.phase==='paused'){game.phase='playing';say('Back in the arena.')}}
window.onkeydown=e=>{const raw=e.key.toLowerCase(),k=mapped(raw);if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(raw))e.preventDefault();if(['1','2','3'].includes(k))SS.select(Number(k)-1);if(k==='p')togglePause();if(k==='shift')dash();keys.add(k)};window.onkeyup=e=>keys.delete(mapped(e.key.toLowerCase()));window.onblur=()=>{keys.clear();mouse.down=false};draw();
window.SpellArena={getGame:()=>game,start,wave,spawn,makeEnemy,bossHealth,compile,conditionsTrue,volleyCost,cast,shot,damage,hurt,grantShield,particles,update,say,finish,dash,togglePause,drawSprite,drawAnimatedSprite,move,enemyShot,elementalOrb,bossHazard,rocks,bossTypes,minibossTypes,setKey:(key,on)=>on?keys.add(key):keys.delete(key),setAim:(x,y)=>{mouse.x=x;mouse.y=y},setCasting:on=>mouse.down=on};
})();


