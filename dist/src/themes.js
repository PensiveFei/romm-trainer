// Visual themes are original vector interpretations; they never change judgement or input.
const palette = (name, motif, accent, tap, hold, shape = 'circle') =>
  Object.freeze({ name, motif, accent, tap: Object.freeze(tap), hold: Object.freeze(hold), shape });

export const THEMES = Object.freeze({
  base: palette('基础主题', 'star', '#ead49a', ['#fff0c4','#efb44f','#c88c3d'], ['#ded2ff','#9479e8','#7256c1']),
  wind: palette('风与自由', 'wind', '#a6f7e6', ['#eafff7','#73e4da','#209f9f'], ['#fff9c0','#ffd94a','#dbac1d']),
  geo: palette('岩与契约', 'geo', '#f2cb83', ['#fff1c4','#e8b85c','#a76c31'], ['#ffebbc','#c9955c','#845433'], 'diamond'),
  electro: palette('雷与永恒', 'electro', '#e9c2ff', ['#f8eaff','#ab9df1','#6758a8'], ['#ffddf8','#e99adb','#b45aab']),
  hydro: palette('水与正义', 'hydro', '#a3dfff', ['#eaffff','#8bd6f4','#438aa9'], ['#e7edff','#91aef1','#596dc0']),
  pyro: palette('火与战争', 'pyro', '#ffbe7b', ['#fff2bc','#ff9741','#b65322'], ['#fff6a8','#ffcf3e','#d98421'], 'flame'),
  dendro: palette('草与智慧', 'dendro', '#c1ff9d', ['#e3fff4','#69ddba','#2b9984'], ['#edffbb','#a7db5a','#679f32'], 'heart'),
  dream: palette('静思浮梦', 'dream', '#d9ffad', ['#f3ffd2','#a5db59','#648f33'], ['#dbfff1','#72dfbd','#39a995'], 'flower'),
  frost: palette('霜月的祷言', 'frost', '#c8fff0', ['#ecfaff','#a7dcf4','#609fc8'], ['#e5ffc3','#77d6a6','#359d8a'], 'flower')
});

export function getTheme(id) { return Object.hasOwn(THEMES, id) ? THEMES[id] : THEMES.base; }

export function rgba(hex, alpha) {
  const value = Number.parseInt(hex.slice(1), 16);
  return 'rgba(' + ((value >> 16) & 255) + ',' + ((value >> 8) & 255) + ',' + (value & 255) + ',' + alpha + ')';
}

function leaf(ctx, x, y, angle, size) {
  ctx.save(); ctx.translate(x,y); ctx.rotate(angle); ctx.scale(size,size);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(-.68,-.45,0,-1);
  ctx.quadraticCurveTo(.68,-.45,0,0); ctx.fill(); ctx.restore();
}

function star(ctx) {
  ctx.beginPath(); ctx.moveTo(0,-1);
  ctx.quadraticCurveTo(.18,-.18,1,0); ctx.quadraticCurveTo(.18,.18,0,1);
  ctx.quadraticCurveTo(-.18,.18,-1,0); ctx.quadraticCurveTo(-.18,-.18,0,-1); ctx.fill();
}

// Drawn at a common size so the same motif can appear in notes, scenery and hit effects.
export function paintMotif(ctx, motif, x, y, radius, color, angle = 0) {
  ctx.save(); ctx.translate(x,y); ctx.rotate(angle); ctx.scale(radius,radius);
  ctx.fillStyle=color; ctx.strokeStyle=color; ctx.lineWidth=.12;
  ctx.lineCap='round'; ctx.lineJoin='round';
  switch (motif) {
    case 'wind':
      ctx.beginPath(); ctx.moveTo(-.95,.22); ctx.bezierCurveTo(-.42,-.25,.16,.57,.64,.06);
      ctx.bezierCurveTo(1,-.33,.47,-.7,.15,-.36); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-.75,.57); ctx.bezierCurveTo(-.2,.19,.32,.81,.72,.45); ctx.stroke();
      leaf(ctx,-.52,-.15,-.8,.43); break;
    case 'geo':
      ctx.beginPath(); ctx.moveTo(0,-1); ctx.lineTo(.88,0); ctx.lineTo(0,1); ctx.lineTo(-.88,0); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,-.46); ctx.lineTo(.42,0); ctx.lineTo(0,.46); ctx.lineTo(-.42,0); ctx.closePath(); ctx.fill(); break;
    case 'electro':
      for(let i=0;i<3;i++) {ctx.save();ctx.rotate(i*Math.PI*2/3);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-.22,-.42,.05,-.9,.45,-.8);ctx.bezierCurveTo(.8,-.72,.75,-.2,.28,-.12);ctx.bezierCurveTo(.14,-.11,.06,-.04,0,0);ctx.fill();ctx.restore();} break;
    case 'hydro':
      ctx.lineWidth=.19;ctx.beginPath();ctx.arc(0,0,.78,-Math.PI*.88,Math.PI*.77);ctx.stroke();
      ctx.beginPath();ctx.arc(.08,.14,.47,-Math.PI*.85,Math.PI*.7);ctx.stroke();
      ctx.beginPath();ctx.arc(.12,.22,.16,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(-.68,.52,.11,0,Math.PI*2);ctx.fill();break;
    case 'pyro':
      ctx.beginPath(); ctx.moveTo(0,-1); ctx.bezierCurveTo(.13,-.42,.83,-.24,.72,.42);
      ctx.bezierCurveTo(.62,1,-.58,1,-.72,.37); ctx.bezierCurveTo(-.8,-.04,-.45,-.42,-.33,-.62);
      ctx.bezierCurveTo(-.35,-.18,-.05,-.12,0,-1); ctx.closePath(); ctx.fill();
      break;
    case 'dendro':
      leaf(ctx,0,.57,0,1.35); leaf(ctx,-.12,.56,-.93,.92); leaf(ctx,.12,.56,.93,.92);
      ctx.beginPath(); ctx.moveTo(0,.12); ctx.lineTo(0,.95); ctx.stroke(); break;
    case 'dream':
      for (let i=0;i<5;i++) leaf(ctx,0,0,i*Math.PI*2/5,.93);
      ctx.beginPath(); ctx.arc(0,0,.19,0,Math.PI*2); ctx.fill(); break;
    case 'frost':
      for (let i=0;i<6;i++) {
        ctx.save(); ctx.rotate(i*Math.PI/3); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-.98);
        ctx.moveTo(0,-.55); ctx.lineTo(-.24,-.75); ctx.moveTo(0,-.55); ctx.lineTo(.24,-.75); ctx.stroke(); ctx.restore();
      } break;
    default: star(ctx);
  }
  ctx.restore();
}

export function paintBackdrop(ctx, theme, w, h) {
  const color=theme.accent, y=h*.58;
  ctx.save(); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=1;
  ctx.globalAlpha=.13;
  paintMotif(ctx,theme.motif,w*.075,h*.36,18,color,-.16);
  paintMotif(ctx,theme.motif,w*.925,h*.67,22,color,.16);
  ctx.globalAlpha=.08;
  paintMotif(ctx,theme.motif,w*.5,h*.50,70,color,theme.motif==='dream'?.3:0);
  ctx.globalAlpha=.17;
  switch (theme.motif) {
    case 'wind':
      for (let i=0;i<3;i++) { ctx.beginPath(); ctx.moveTo(-20,y+i*27); ctx.bezierCurveTo(w*.15,y-95+i*20,w*.2,y+75+i*18,w*.32,y-5+i*15); ctx.stroke(); }
      break;
    case 'geo':
      for (let i=0;i<3;i++) { const s=28+i*20, x=w*.07, a=h*.78;
        ctx.beginPath(); ctx.moveTo(x,a-s); ctx.lineTo(x+s,a); ctx.lineTo(x,a+s); ctx.lineTo(x-s,a); ctx.closePath(); ctx.stroke(); }
      break;
    case 'electro':
      for (let i=0;i<2;i++) { ctx.beginPath();ctx.moveTo(w*.91-i*20,h*.16);ctx.lineTo(w*.85-i*20,h*.30);ctx.lineTo(w*.9-i*20,h*.30);ctx.lineTo(w*.81-i*20,h*.47);ctx.stroke(); }
      break;
    case 'hydro':
      for (let i=0;i<3;i++) { ctx.beginPath();ctx.moveTo(-20,h*.81+i*13);ctx.bezierCurveTo(w*.12,h*.74+i*13,w*.18,h*.91+i*13,w*.34,h*.81+i*13);ctx.stroke(); }
      for (let i=0;i<3;i++) { ctx.beginPath();ctx.arc(w*.92-i*9,h*.32-i*28,3+i*2,0,Math.PI*2);ctx.stroke(); }
      break;
    case 'pyro':
      for (let i=0;i<3;i++) { ctx.beginPath();ctx.moveTo(w*.9+i*13,h*.88);ctx.bezierCurveTo(w*.8+i*13,h*.78,w*.98+i*13,h*.73,w*.88+i*13,h*.60);ctx.stroke(); }
      break;
    case 'dendro':
      ctx.beginPath();ctx.moveTo(w*.04,h*.91);ctx.bezierCurveTo(w*.18,h*.75,w*.02,h*.65,w*.17,h*.48);ctx.stroke();
      leaf(ctx,w*.095,h*.76,-.8,17);leaf(ctx,w*.095,h*.63,.9,14);leaf(ctx,w*.15,h*.51,-.7,12); break;
    case 'dream':
      ctx.beginPath();ctx.ellipse(w*.5,h*.51,Math.min(w*.21,120),Math.min(w*.21,120),0,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.ellipse(w*.5,h*.51,Math.min(w*.26,150),Math.min(w*.16,90),-.35,0,Math.PI*2);ctx.stroke(); break;
    case 'frost':
      ctx.beginPath();ctx.arc(w*.88,h*.25,36,.65,Math.PI*1.7);ctx.stroke();
      ctx.beginPath();ctx.arc(w*.87,h*.235,24,.55,Math.PI*1.7);ctx.stroke();
      for (let i=0;i<3;i++) paintMotif(ctx,'frost',w*(.07+i*.04),h*(.70+i*.07),7+i*3,color,i*.2);
      break;
    default:
      ctx.beginPath();ctx.arc(w*.5,h*.55,Math.min(w*.21,120),0,Math.PI*2);ctx.stroke();
  }
  // Architectural silhouettes and a luminous lower border echo the themed
  // performance screens while leaving the note lanes visually uncluttered.
  ctx.globalAlpha=.13; ctx.lineWidth=2;
  const base=h*.98, mid=w*.5, unit=Math.min(w*.065,72);
  for (let i=-2;i<=2;i++) {
    const x=mid+i*unit*1.5, tower=unit*(i===0?2.1:1.45);
    ctx.beginPath();ctx.moveTo(x-unit*.48,base);ctx.lineTo(x-unit*.48,base-tower*.62);
    ctx.lineTo(x-unit*.62,base-tower*.62);ctx.lineTo(x,base-tower);ctx.lineTo(x+unit*.62,base-tower*.62);
    ctx.lineTo(x+unit*.48,base-tower*.62);ctx.lineTo(x+unit*.48,base);ctx.stroke();
    ctx.beginPath();ctx.arc(x,base-unit*.36,unit*.20,Math.PI,0);ctx.lineTo(x+unit*.20,base);ctx.stroke();
  }
  for(let i=0;i<3;i++) {ctx.beginPath();ctx.moveTo(-20,h*(.84+i*.04));ctx.bezierCurveTo(w*.28,h*(.77+i*.04),w*.68,h*(1.02-i*.025),w+20,h*(.83+i*.045));ctx.stroke();}
  ctx.globalAlpha=.14;
  for(let i=0;i<10;i++) paintMotif(ctx,theme.motif,w*(i+.5)/10,h*.975,Math.min(16,w*.018),color,i*.4);
  ctx.restore();
}

// Progress is normalized to [0, 1]; the caller creates effects only for successful manual presses.
export function paintHit(ctx, theme, x, y, radius, progress, compact = false) {
  if (progress < 0 || progress >= 1) return;
  const fade=1-progress, spread=radius*(.65+progress*2.2), color=theme.accent;
  ctx.save(); ctx.globalAlpha=fade*.85; ctx.strokeStyle=color; ctx.fillStyle=color;
  ctx.lineWidth=1.5+fade; ctx.shadowColor=color; ctx.shadowBlur=(compact ? 4 : 8)*fade;
  if (theme.motif === 'geo') {
    ctx.beginPath();ctx.moveTo(x,y-spread);ctx.lineTo(x+spread,y);ctx.lineTo(x,y+spread);ctx.lineTo(x-spread,y);ctx.closePath();ctx.stroke();
  } else if (theme.motif === 'electro') {
    for (let i=0;i<5;i++) {
      const a=i*Math.PI*2/5, c=Math.cos(a), s=Math.sin(a);
      ctx.beginPath();ctx.moveTo(x+c*radius*.6,y+s*radius*.6);
      ctx.lineTo(x+c*spread*.5-s*5,y+s*spread*.5+c*5);
      ctx.lineTo(x+c*spread*.7+s*3,y+s*spread*.7-c*3);ctx.lineTo(x+c*spread,y+s*spread);ctx.stroke();
    }
  } else {
    ctx.beginPath();ctx.arc(x,y,spread,0,Math.PI*2);ctx.stroke();
    if (theme.motif === 'hydro') {ctx.beginPath();ctx.arc(x,y,spread*.68,0,Math.PI*2);ctx.stroke();}
    if (theme.motif === 'dream' || theme.motif === 'frost') {
      ctx.beginPath();ctx.arc(x,y,spread*1.17,0,Math.PI*2);ctx.stroke();
    }
  }
  const count=compact ? 4 : (theme.motif==='dream'?5:6);
  for (let i=0;i<count;i++) {
    const a=i*Math.PI*2/count-Math.PI/2+(theme.motif==='wind'?progress*.9:0);
    const distance=radius*(.65+progress*2.8);
    const drift=theme.motif==='pyro' ? -progress*radius : 0;
    const px=x+Math.cos(a)*distance, py=y+Math.sin(a)*distance+drift;
    paintMotif(ctx,theme.motif,px,py,Math.max(2,radius*(.18+.12*fade)),color,a+progress);
  }
  ctx.restore();
}
