// These eight themes are hand-drawn from the supplied reference screenshots.
// The normalised canvas artwork scales with the stage without changing timing or input.
const IDS = new Set(['moonfeather', 'feast', 'plum', 'lotus', 'flameheart', 'whitestar', 'icefang', 'sakura']);
export const isReferenceTheme = id => IDS.has(id);

const TAU = Math.PI * 2;
const NOTE_COLORS = {
  moonfeather: {tap:['#c5faff','#66affb','#d8f7ff','#2d5eaa'],hold:['#f8e7ff','#bda8fa','#fae8ff','#63569e']},
  feast: {tap:['#fff4a1','#61dccb','#e4fff2','#306a80'],hold:['#b8f2ff','#8f9dff','#e6e4ff','#515da2']},
  plum: {tap:['#ffe781','#ffb13c','#ffc65d','#a65c2e'],hold:['#ffd0a3','#ff7970','#ff9a78','#9c414d']},
  lotus: {tap:['#d3ebff','#488dff','#89bdff','#174b9d'],hold:['#fff2f7','#f98cb8','#fbb4ce','#a94e78']},
  flameheart: {tap:['#f7d6ff','#a869f4','#d2a4ff','#5b3593'],hold:['#ffe3ca','#f45394','#ff8aac','#a72571']},
  whitestar: {tap:['#fff2ff','#eca2f5','#f4d4ff','#9d62bb'],hold:['#e8f5ff','#80bbff','#c6dcff','#548ad2']},
  icefang: {tap:['#d2ffff','#82c9d3','#b6edf1','#477884'],hold:['#e9e8ff','#9796f0','#b4c5ff','#5a5ca8']},
  sakura: {tap:['#fff0f7','#f5a7d1','#ffd4e9','#ae699c'],hold:['#edffff','#9bdcec','#caf1f7','#5c9fb8']}
};

function circle(ctx,x,y,r,fill,stroke,width=.04) {
  ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.lineWidth=width;ctx.strokeStyle=stroke;ctx.stroke();}
}
function polygon(ctx, points, fill, stroke, width=.04) {
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
}
function roundBox(ctx,x,y,w,h,r,fill,stroke,width=.05) {
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
}
function sparkle(ctx,x,y,r,color) {
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y-r);ctx.quadraticCurveTo(x+r*.18,y-r*.18,x+r,y);
  ctx.quadraticCurveTo(x+r*.18,y+r*.18,x,y+r);ctx.quadraticCurveTo(x-r*.18,y+r*.18,x-r,y);
  ctx.quadraticCurveTo(x-r*.18,y-r*.18,x,y-r);ctx.fill();
}
function flower(ctx, count, color, edge, petalWidth, petalHeight, tipY, rotation=0) {
  for(let i=0;i<count;i++) {
    ctx.save();ctx.rotate(rotation+i*TAU/count);
    ctx.beginPath();ctx.ellipse(0,tipY,petalWidth,petalHeight,0,0,TAU);
    ctx.fillStyle=color;ctx.fill();if(edge){ctx.strokeStyle=edge;ctx.lineWidth=.07;ctx.stroke();}ctx.restore();
  }
}
function pointedPetals(ctx,count,color,edge,scale=1,rotation=0) {
  for(let i=0;i<count;i++) {
    ctx.save();ctx.rotate(rotation+i*TAU/count);ctx.scale(scale,scale);
    ctx.beginPath();ctx.moveTo(0,.12);ctx.quadraticCurveTo(-.36,-.27,-.36,-.61);ctx.lineTo(0,-1);
    ctx.lineTo(.36,-.61);ctx.quadraticCurveTo(.36,-.27,0,.12);ctx.closePath();ctx.fillStyle=color;ctx.fill();
    if(edge){ctx.strokeStyle=edge;ctx.lineWidth=.065;ctx.stroke();}ctx.restore();
  }
}
function noteMoon(ctx,c) {
  circle(ctx,0,0,.97,c[1],c[3],.12);circle(ctx,0,0,.87,c[2],null);
  circle(ctx,-.16,-.06,.71,c[1],null);
  ctx.save();ctx.strokeStyle='rgba(255,255,255,.38)';ctx.lineWidth=.022;
  for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(-.16,-.06,.72+i*.045,-1.05,1.25);ctx.stroke();}ctx.restore();
  circle(ctx,-.31,-.44,.06,'rgba(255,255,255,.33)');
}
function notePudding(ctx,c,isHold) {
  const dark=c[3];
  // A scalloped pudding on a plate, with cream and a cherry on top.
  ctx.beginPath();ctx.moveTo(-.8,.49);ctx.lineTo(-.59,-.49);ctx.quadraticCurveTo(-.52,-.67,-.32,-.67);
  ctx.quadraticCurveTo(-.25,-.92,0,-.96);ctx.quadraticCurveTo(.26,-.92,.34,-.67);
  ctx.quadraticCurveTo(.53,-.67,.6,-.49);ctx.lineTo(.8,.49);ctx.lineTo(.92,.55);
  ctx.quadraticCurveTo(.94,.67,.73,.71);ctx.lineTo(.63,.9);ctx.lineTo(-.62,.9);ctx.lineTo(-.73,.71);
  ctx.quadraticCurveTo(-.94,.67,-.92,.55);ctx.closePath();ctx.fillStyle=dark;ctx.fill();
  ctx.beginPath();ctx.moveTo(-.67,.51);ctx.lineTo(-.47,-.38);ctx.quadraticCurveTo(0,-.52,.47,-.38);ctx.lineTo(.67,.51);
  ctx.closePath();ctx.fillStyle=c[1];ctx.fill();
  ctx.beginPath();ctx.moveTo(-.36,-.25);ctx.quadraticCurveTo(0,-.35,.36,-.25);ctx.lineTo(.46,.38);
  ctx.quadraticCurveTo(0,.47,-.46,.38);ctx.closePath();ctx.fillStyle=isHold?'#8fe9f5':'#ffefa3';ctx.fill();
  ctx.beginPath();ctx.moveTo(-.51,-.36);ctx.quadraticCurveTo(-.53,-.57,-.31,-.58);
  ctx.quadraticCurveTo(-.24,-.76,0,-.76);ctx.quadraticCurveTo(.25,-.76,.32,-.58);
  ctx.quadraticCurveTo(.53,-.57,.51,-.36);ctx.quadraticCurveTo(.44,-.26,.33,-.38);
  ctx.quadraticCurveTo(.23,-.47,.14,-.34);ctx.quadraticCurveTo(.03,-.22,-.08,-.34);
  ctx.quadraticCurveTo(-.22,-.46,-.34,-.34);ctx.quadraticCurveTo(-.45,-.25,-.51,-.36);
  ctx.closePath();ctx.fillStyle=c[2];ctx.fill();
  circle(ctx,0,-.73,.15,isHold?'#a7bfff':'#ffcc8b');
  roundBox(ctx,-.78,.49,1.56,.19,.09,c[2]);
  polygon(ctx,[[-.62,.68],[.62,.68],[.48,.8],[-.48,.8]],isHold?'#a5c8ff':'#a6f4df');
}
function notePlum(ctx,c) {
  flower(ctx,6,c[3],null,.43,.52,-.49,Math.PI/6);
  flower(ctx,6,c[1],null,.38,.47,-.47,Math.PI/6);
  flower(ctx,6,c[2],null,.30,.39,-.39,Math.PI/6);
  flower(ctx,5,c[0],null,.19,.29,-.26,0);
  circle(ctx,0,0,.11,'rgba(255,252,211,.78)');
}
function noteLotus(ctx,c) {
  pointedPetals(ctx,8,c[3],null,1.05,Math.PI/8);
  pointedPetals(ctx,8,c[1],c[2],.91,Math.PI/8);
  pointedPetals(ctx,8,c[0],null,.53,0);
  sparkle(ctx,0,0,.22,'rgba(255,255,255,.85)');
}
function heartPoints(scale) {
  return [[0,-.54],[-.34,-.83],[-.64,-.66],[-.89,-.42],[-.77,-.10],[-.49,.31],[0,.75],[.49,.31],[.77,-.10],[.89,-.42],[.64,-.66],[.34,-.83]].map(([x,y])=>[x*scale,y*scale]);
}
function noteFlameheart(ctx,c) {
  polygon(ctx,heartPoints(1.12),c[3]);polygon(ctx,heartPoints(1),c[1]);
  polygon(ctx,heartPoints(.76),c[2]);polygon(ctx,heartPoints(.53),c[0]);
  polygon(ctx,[[-.69,-.34],[-.43,-.56],[0,-.31],[0,.51]],'rgba(255,255,255,.11)');
  sparkle(ctx,0,-.04,.38,'rgba(255,255,243,.9)');
}
function noteWhiteStar(ctx,c,isHold) {
  // The two note types have different expressions, as in the reference.
  ctx.beginPath();ctx.moveTo(-.9,-.25);ctx.quadraticCurveTo(-.84,-.78,0,-.91);
  ctx.quadraticCurveTo(.84,-.78,.9,-.25);ctx.quadraticCurveTo(.92,-.09,.79,-.04);
  ctx.quadraticCurveTo(.79,.76,0,.9);ctx.quadraticCurveTo(-.79,.76,-.79,-.04);
  ctx.quadraticCurveTo(-.92,-.09,-.9,-.25);ctx.closePath();ctx.fillStyle=c[3];ctx.fill();
  ctx.beginPath();ctx.moveTo(-.77,-.23);ctx.quadraticCurveTo(-.7,-.67,0,-.73);ctx.quadraticCurveTo(.7,-.67,.77,-.23);
  ctx.quadraticCurveTo(.7,-.15,.68,.01);ctx.quadraticCurveTo(.64,.64,0,.72);ctx.quadraticCurveTo(-.64,.64,-.68,.01);
  ctx.quadraticCurveTo(-.7,-.15,-.77,-.23);ctx.closePath();ctx.fillStyle=c[2];ctx.fill();
  circle(ctx,0,.04,.58,c[0],c[1],.055);
  ctx.strokeStyle=c[1];ctx.lineWidth=.085;ctx.lineCap='round';ctx.lineJoin='round';
  if(isHold){ctx.beginPath();ctx.moveTo(-.38,-.18);ctx.lineTo(-.18,-.04);ctx.lineTo(-.37,.08);ctx.moveTo(.38,-.18);ctx.lineTo(.18,-.04);ctx.lineTo(.37,.08);ctx.stroke();}
  else {circle(ctx,-.25,-.08,.095,null,c[1],.065);circle(ctx,.25,-.08,.095,null,c[1],.065);}
  polygon(ctx,[[-.38,.24],[-.18,.24],[-.28,.39]],c[1]);polygon(ctx,[[.18,.24],[.38,.24],[.28,.39]],c[1]);
  ctx.beginPath();ctx.arc(0,-.11,.66,-2.6,-.55);ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=.04;ctx.stroke();
}
function noteIcefang(ctx,c) {
  // A little icy music box with the keyboard below and a winding piece at right.
  polygon(ctx,[[.60,-.54],[.80,-.45],[.99,-.06],[.88,.06],[.98,.24],[.78,.36],[.58,.22]],c[3]);
  polygon(ctx,[[.65,-.42],[.75,-.36],[.88,-.07],[.75,0],[.85,.20],[.65,.25]],c[1]);
  roundBox(ctx,-.83,-.88,1.52,1.52,.15,c[3]);roundBox(ctx,-.72,-.78,1.30,1.34,.1,c[1]);
  roundBox(ctx,-.65,-.70,1.16,.26,.05,c[0]);
  polygon(ctx,[[-.63,-.42],[-.23,-.42],[-.16,-.25],[.08,-.19],[.24,-.25],[.31,-.42],[.49,-.42],[.49,.16],[-.63,.16]],c[2]);
  roundBox(ctx,-.71,.12,1.32,.23,.055,c[0]);
  for(let i=0;i<3;i++)roundBox(ctx,-.59+i*.37,.39,.30,.23,.045,c[2],c[3],.025);
}
function noteSakura(ctx,c) {
  flower(ctx,5,c[3],null,.47,.54,-.48);
  flower(ctx,5,c[1],null,.41,.49,-.46);
  flower(ctx,5,c[2],null,.32,.41,-.37);
  flower(ctx,5,c[0],null,.20,.29,-.24,Math.PI/5);
  circle(ctx,0,0,.09,'#fff8fb');
  ctx.strokeStyle='#fff8fb';ctx.lineWidth=.035;ctx.lineCap='round';
  for(let i=0;i<10;i++){const a=i*TAU/10;ctx.beginPath();ctx.moveTo(Math.cos(a)*.08,Math.sin(a)*.08);ctx.lineTo(Math.cos(a)*.26,Math.sin(a)*.26);ctx.stroke();circle(ctx,Math.cos(a)*.29,Math.sin(a)*.29,.035,'#fff8fb');}
}
const NOTE_PAINTERS = {moonfeather:noteMoon,feast:notePudding,plum:notePlum,lotus:noteLotus,flameheart:noteFlameheart,whitestar:noteWhiteStar,icefang:noteIcefang,sakura:noteSakura};

export function paintReferenceNote(ctx,id,x,y,radius,isHold) {
  if(!isReferenceTheme(id)) return false;
  const colors=NOTE_COLORS[id][isHold?'hold':'tap'];
  ctx.save();ctx.translate(x,y);ctx.scale(radius,radius);ctx.lineJoin='round';ctx.lineCap='round';
  ctx.shadowColor=colors[3];ctx.shadowBlur=.10;NOTE_PAINTERS[id](ctx,colors,isHold);ctx.restore();return true;
}

const HOLD_COLORS = {moonfeather:['#f4baff','#db6fe7'],feast:['#d8e1ff','#818bff'],plum:['#ffd38a','#f55e46'],lotus:['#fff0ff','#dca6ff'],flameheart:['#ffc0de','#ed4d9b'],whitestar:['#d5e9ff','#4d9eff'],icefang:['#b9faff','#4d9ef2'],sakura:['#cefbff','#4fc4ff']};
export function paintReferenceHold(ctx,id,x,top,bottom,radius) {
  if(!isReferenceTheme(id))return false;
  const [light,color]=HOLD_COLORS[id], width=radius*1.72;
  ctx.save();const beam=ctx.createLinearGradient(x-width/2,0,x+width/2,0);
  beam.addColorStop(0,'rgba(255,255,255,0.03)');beam.addColorStop(.14,color+'66');
  beam.addColorStop(.46,color+'c0');beam.addColorStop(.52,light+'df');beam.addColorStop(.86,color+'66');beam.addColorStop(1,'rgba(255,255,255,0.03)');
  ctx.fillStyle=beam;ctx.fillRect(x-width/2,top,width,bottom-top);
  ctx.strokeStyle=light+'bb';ctx.lineWidth=Math.max(1,radius*.035);ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,bottom);ctx.stroke();
  ctx.strokeStyle=color+'77';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-width*.48,top);ctx.lineTo(x-width*.48,bottom);ctx.moveTo(x+width*.48,top);ctx.lineTo(x+width*.48,bottom);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.53)';
  for(let y=top+26,i=0;y<bottom-12;y+=46,i++){const dx=Math.sin(i*12.4+top*.03)*width*.34;ctx.beginPath();ctx.arc(x+dx,y,Math.max(.5,radius*.018),0,TAU);ctx.fill();}
  ctx.restore();return true;
}

// The scene is drawn in a fixed, low-contrast coordinate system and occupies
// only the lower portion of the playfield, like the original previews.
function curves(ctx, color, base=195) {
  ctx.strokeStyle=color;ctx.lineWidth=2;
  for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-80,base+i*17);ctx.bezierCurveTo(180,base-90+i*20,270,base+110+i*8,510,base+5+i*12);ctx.bezierCurveTo(710,base-60+i*12,800,base+60+i*16,1080,base-24+i*14);ctx.stroke();}
}
function snowflake(ctx,x,y,r,color) {
  ctx.save();ctx.translate(x,y);ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,r*.065);ctx.lineCap='round';
  for(let i=0;i<6;i++){ctx.save();ctx.rotate(i*TAU/6);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-r);ctx.moveTo(0,-r*.55);ctx.lineTo(-r*.22,-r*.75);ctx.moveTo(0,-r*.55);ctx.lineTo(r*.22,-r*.75);ctx.stroke();ctx.restore();}ctx.restore();
}
function sceneMoon(ctx) {
  curves(ctx,'rgba(218,255,255,.30)',175);
  ctx.save();ctx.translate(500,215);ctx.strokeStyle='rgba(222,255,255,.35)';ctx.fillStyle='rgba(184,241,255,.13)';ctx.lineWidth=3;
  // Two feathered wings frame the rising crescent.
  for(const side of [-1,1]){ctx.save();ctx.scale(side,1);ctx.beginPath();ctx.moveTo(0,22);ctx.bezierCurveTo(60,-6,138,-84,250,-125);ctx.bezierCurveTo(218,-48,157,24,42,50);ctx.closePath();ctx.fill();ctx.stroke();
    for(let i=0;i<7;i++){ctx.beginPath();ctx.moveTo(13+i*5,35);ctx.quadraticCurveTo(98+i*8,-15-i*4,207+i*4,-103+i*9);ctx.stroke();}ctx.restore();}
  circle(ctx,0,-4,43,'rgba(214,255,255,.16)','rgba(226,255,255,.38)',3);
  ctx.beginPath();ctx.arc(8,-13,32,-1.5,1.8);ctx.arc(-7,-13,27,1.8,-1.5,true);ctx.closePath();ctx.fillStyle='rgba(230,255,255,.54)';ctx.fill();ctx.restore();
  for(const [x,y,r] of [[83,174,9],[177,105,7],[307,207,6],[681,166,7],[812,112,10],[935,194,8]])sparkle(ctx,x,y,r,'rgba(229,255,255,.65)');
}
function sceneFeast(ctx) {
  ctx.strokeStyle='rgba(186,242,255,.27)';ctx.fillStyle='rgba(170,225,255,.09)';ctx.lineWidth=5;
  for(const [x,w,h] of [[40,118,135],[164,95,93],[276,115,110],[688,95,107],[810,140,140],[951,95,92]]){
    ctx.beginPath();ctx.moveTo(x,265);ctx.lineTo(x,265-h*.68);ctx.quadraticCurveTo(x+w/2,265-h*1.5,x+w,265-h*.68);ctx.lineTo(x+w,265);ctx.closePath();ctx.fill();ctx.stroke();
    for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(x+w*(i+1)/4,250-h*.32,8,Math.PI,0);ctx.lineTo(x+w*(i+1)/4+8,260);ctx.stroke();}}
  for(const [x,y] of [[375,196],[500,163],[625,196]]){circle(ctx,x,y,46,'rgba(177,243,255,.06)','rgba(182,237,255,.24)',4);ctx.save();ctx.translate(x,y);ctx.scale(25,25);notePudding(ctx,['#fff4a1','#83dcca','#e8fff9','#8abec9'],false);ctx.restore();}
  for(const [x,y,r] of [[80,90,9],[225,175,6],[710,78,7],[886,157,11],[967,92,6]])circle(ctx,x,y,r,null,'rgba(161,245,255,.45)',2);
}
function scenePlum(ctx) {
  curves(ctx,'rgba(255,202,133,.33)',185);
  ctx.save();ctx.translate(500,242);ctx.fillStyle='rgba(255,212,132,.34)';ctx.strokeStyle='rgba(255,222,164,.45)';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(-125,30);ctx.lineTo(-112,-54);ctx.lineTo(-82,-38);ctx.quadraticCurveTo(0,-110,82,-38);ctx.lineTo(112,-54);ctx.lineTo(125,30);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(189,103,55,.45)';ctx.beginPath();ctx.arc(-30,-29,7,0,TAU);ctx.arc(30,-29,7,0,TAU);ctx.fill();
  ctx.beginPath();ctx.arc(0,-22,20,.15,Math.PI-.15);ctx.fill();ctx.restore();
  for(const [x,y,s] of [[140,156,22],[270,216,18],[733,172,23],[875,211,20]]){ctx.save();ctx.translate(x,y);ctx.scale(s,s);flower(ctx,6,'rgba(255,205,119,.28)','rgba(255,214,155,.35)',.35,.45,-.42,Math.PI/6);ctx.restore();}
}
function sceneLotus(ctx) {
  curves(ctx,'rgba(215,239,255,.35)',178);
  ctx.save();ctx.translate(500,239);ctx.scale(110,110);pointedPetals(ctx,8,'rgba(172,218,255,.15)','rgba(210,236,255,.30)',1,Math.PI/8);
  pointedPetals(ctx,8,'rgba(217,238,255,.18)',null,.58,0);ctx.restore();
  for(const [x,y,r] of [[82,126,10],[156,191,6],[278,104,8],[698,147,8],[852,100,10],[920,206,7]]){circle(ctx,x,y,r,null,'rgba(203,236,255,.38)',2);}
  for(const [x,y] of [[215,208],[349,180],[666,214],[786,171]]){ctx.save();ctx.translate(x,y);ctx.rotate(-.5);ctx.fillStyle='rgba(255,228,245,.75)';ctx.beginPath();ctx.ellipse(0,0,7,3,0,0,TAU);ctx.fill();ctx.restore();}
}
function sceneFlame(ctx) {
  curves(ctx,'rgba(255,193,220,.30)',191);
  ctx.save();ctx.translate(500,234);ctx.scale(95,95);polygon(ctx,heartPoints(1.15),'rgba(255,146,190,.12)','rgba(255,190,219,.27)',.04);polygon(ctx,heartPoints(.8),'rgba(255,174,212,.14)','rgba(255,199,226,.28)',.04);
  for(const side of [-1,1]){ctx.save();ctx.scale(side,1);ctx.beginPath();ctx.moveTo(.42,.44);ctx.bezierCurveTo(1.2,.21,1.4,-.57,2.9,-.87);ctx.bezierCurveTo(2.2,-.25,1.89,.32,.71,.69);ctx.closePath();ctx.strokeStyle='rgba(255,205,227,.36)';ctx.lineWidth=.045;ctx.stroke();ctx.restore();}ctx.restore();
  for(const [x,y,r] of [[82,145,12],[206,211,15],[294,98,8],[692,167,10],[815,225,15],[928,107,8]])sparkle(ctx,x,y,r,'rgba(255,216,168,.7)');
}
function sceneWhiteStar(ctx) {
  curves(ctx,'rgba(226,219,255,.28)',195);
  ctx.save();ctx.translate(500,232);ctx.scale(95,95);ctx.globalAlpha=.34;noteWhiteStar(ctx,['#eef9ff','#b1c4ff','#f1e9ff','#af9de3'],true);ctx.restore();
  for(const [x,y,r] of [[80,120,18],[200,190,23],[325,131,11],[681,177,15],[810,96,22],[930,200,15]])snowflake(ctx,x,y,r,'rgba(223,239,255,.5)');
  for(const [x,y,r] of [[115,218,28],[285,210,16],[732,213,25],[905,139,20]])circle(ctx,x,y,r,null,'rgba(219,221,255,.20)',3);
}
function sceneIcefang(ctx) {
  curves(ctx,'rgba(183,225,255,.25)',192);
  ctx.save();ctx.translate(500,245);ctx.strokeStyle='rgba(255,167,217,.30)';ctx.fillStyle='rgba(242,130,198,.10)';ctx.lineWidth=4;
  polygon(ctx,[[0,-138],[-48,-66],[-121,-85],[-74,-8],[-138,35],[0,12],[138,35],[74,-8],[121,-85],[48,-66]],'rgba(239,135,211,.11)','rgba(248,177,223,.30)',4);
  circle(ctx,0,-25,52,null,'rgba(255,185,220,.25)',3);ctx.restore();
  for(const [x,y,r] of [[80,81,16],[168,184,23],[282,120,12],[694,193,20],[809,74,17],[925,173,25]])snowflake(ctx,x,y,r,'rgba(200,235,255,.38)');
  for(const [x,y,r] of [[58,209,24],[293,215,18],[715,113,13],[944,220,20]]){ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);polygon(ctx,[[0,-r],[r,0],[0,r],[-r,0]],'rgba(182,226,255,.12)','rgba(192,234,255,.35)',2);ctx.restore();}
}
function sceneSakura(ctx) {
  curves(ctx,'rgba(202,240,255,.35)',186);
  ctx.save();ctx.translate(500,262);ctx.fillStyle='rgba(233,243,213,.23)';ctx.strokeStyle='rgba(219,245,248,.42)';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(-145,0);ctx.quadraticCurveTo(-125,-121,0,-152);ctx.quadraticCurveTo(125,-121,145,0);ctx.closePath();ctx.fill();ctx.stroke();
  for(let i=0;i<=10;i++){const a=Math.PI+i*Math.PI/10;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*140,Math.sin(a)*150);ctx.stroke();}
  ctx.beginPath();ctx.arc(0,0,60,Math.PI,TAU);ctx.stroke();ctx.restore();
  for(const [x,y,s] of [[94,184,15],[212,106,11],[320,216,13],[690,189,17],[812,100,12],[912,213,16]]){ctx.save();ctx.translate(x,y);ctx.scale(s,s);flower(ctx,5,'rgba(237,244,255,.38)',null,.37,.49,-.44);ctx.restore();}
  for(const [x,y,r] of [[65,125,12],[265,180,12],[725,108,13],[923,135,11]])snowflake(ctx,x,y,r,'rgba(220,248,255,.43)');
}
const SCENES={moonfeather:sceneMoon,feast:sceneFeast,plum:scenePlum,lotus:sceneLotus,flameheart:sceneFlame,whitestar:sceneWhiteStar,icefang:sceneIcefang,sakura:sceneSakura};
function upperPattern(ctx,id,w,h) {
  ctx.save();
  if(id==='feast' || id==='whitestar'){
    ctx.strokeStyle=id==='feast'?'rgba(167,143,255,.10)':'rgba(190,166,255,.11)';ctx.lineWidth=1;
    const size=Math.max(50,Math.min(110,w/10));
    for(let x=-w;x<w*2;x+=size){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+h*.42,h*.42);ctx.moveTo(x+size,0);ctx.lineTo(x+size-h*.42,h*.42);ctx.stroke();}
  }
  if(id==='icefang'||id==='sakura'){
    for(let i=0;i<30;i++){const x=((i*137+41)%997)/997*w,y=((i*59+13)%281)/1000*h; snowflake(ctx,x,y,3+(i%4)*2,'rgba(196,225,255,.13)');}
  }
  if(id==='flameheart'||id==='moonfeather'||id==='lotus'){
    for(let i=0;i<32;i++){const x=((i*149+17)%991)/991*w,y=((i*79+7)%661)/1000*h;circle(ctx,x,y,i%8===0?1.3:.6,'rgba(255,244,230,.36)');}
  }
  ctx.restore();
}
export function paintReferenceBackdrop(ctx,id,w,h) {
  if(!isReferenceTheme(id))return false;
  ctx.save();upperPattern(ctx,id,w,h);
  const sceneHeight=Math.min(h*.39,w*.30);ctx.translate(0,h-sceneHeight);ctx.scale(w/1000,sceneHeight/270);
  SCENES[id](ctx);ctx.restore();return true;
}
