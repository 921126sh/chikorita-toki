// Scene component — Ghibli-style backgrounds for Toki
const SKY_GRADIENTS = {
  dawn:    ['#3e5478', '#8d9bb5', '#e8bfb0', '#f9d4a8'],
  morning: ['#7ec4e0', '#bde0ea', '#fbe4cf', '#ffe8c8'],
  day:     ['#6fb8e0', '#a8d8ee', '#d8ecf4', '#f0f8fa'],
  evening: ['#50305a', '#b85068', '#ec8060', '#f4c080'],
  night:   ['#020308', '#05081a', '#0a1028', '#121838'],
};

const CLOUD_COLORS = {
  dawn:    ['rgba(255,225,205,0.9)', 'rgba(240,195,200,0.75)'],
  morning: ['rgba(255,250,240,0.95)', 'rgba(255,225,195,0.75)'],
  day:     ['rgba(255,255,255,1)', 'rgba(230,245,250,0.8)'],
  evening: ['rgba(255,195,165,0.9)', 'rgba(220,130,140,0.75)'],
  night:   ['rgba(245,240,225,0.35)', 'rgba(200,190,170,0.22)'],
};

const LANDSCAPE_COLOR = {
  dawn: '#3d4466', morning: '#8aa070', day: '#7ba878', evening: '#3a2248', night: '#0d0f28',
};
const LANDSCAPE_HIGHLIGHT = {
  dawn: '#a8a0b8', morning: '#cadc9a', day: '#b8d89c', evening: '#c86a78', night: '#2a2550',
};

function Scene({ timeOfDay = 'morning', weather = 'clear', width, height, children }) {
  const grads = SKY_GRADIENTS[timeOfDay];
  const clouds = CLOUD_COLORS[timeOfDay];
  const land = LANDSCAPE_COLOR[timeOfDay];
  const desatAmount = weather === 'cloudy' || weather === 'rain' ? 0.25 : 0;
  const cover = weather === 'clear' ? 0.1 : weather === 'cloudy' ? 0.85 : weather === 'rain' ? 0.95 : weather === 'snow' ? 0.6 : 0.35;

  return (
    <div style={{
      position: 'relative',
      width: width || '100%', height: height || '100%',
      overflow: 'hidden',
      background: `linear-gradient(180deg, ${grads[0]} 0%, ${grads[1]} 30%, ${grads[2]} 65%, ${grads[3]} 100%)`,
      filter: desatAmount ? `saturate(${1 - desatAmount})` : 'none',
      transition: 'background 1.2s ease, filter 1.2s ease',
    }}>
      {(timeOfDay === 'night' || timeOfDay === 'dawn') && <Stars count={timeOfDay === 'night' ? 110 : 30} />}
      <CelestialBody timeOfDay={timeOfDay} />
      <Clouds colors={clouds} timeOfDay={timeOfDay} cover={cover} />
      <Landscape color={land} highlight={LANDSCAPE_HIGHLIGHT[timeOfDay]} timeOfDay={timeOfDay} />
      {weather === 'rain' && <Rain />}
      {weather === 'snow' && <Snow />}
      {weather === 'cloudy' && <Haze />}
      <AtmosphereOverlay timeOfDay={timeOfDay} />
      <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 5 }}>
        {children}
      </div>
    </div>
  );
}

function Stars({ count = 50 }) {
  const stars = React.useMemo(() => [...Array(count)].map(() => ({
    x: Math.random() * 100, y: Math.random() * 70,
    s: Math.random() * 2.5 + 1, d: Math.random() * 3 + 2, delay: Math.random() * 4,
  })), [count]);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {stars.map((st, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${st.x}%`, top: `${st.y}%`,
          width: st.s, height: st.s, borderRadius: '50%', background: '#fff',
          boxShadow: `0 0 ${st.s*4}px rgba(255,255,255,0.95), 0 0 ${st.s*8}px rgba(220,220,255,0.5)`,
          animation: `toki-star ${st.d}s ease-in-out ${st.delay}s infinite`,
        }} />
      ))}
    </div>
  );
}

function CelestialBody({ timeOfDay }) {
  if (timeOfDay === 'day' || timeOfDay === 'morning') {
    const pos = timeOfDay === 'morning' ? { right: '18%', top: '22%' } : { right: '12%', top: '14%' };
    return (
      <div style={{ position: 'absolute', ...pos, width: 90, height: 90, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: -40, background: timeOfDay === 'morning' ? 'radial-gradient(circle, rgba(255,220,150,0.7) 0%, transparent 60%)' : 'radial-gradient(circle, rgba(255,245,200,0.55) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: timeOfDay === 'morning' ? 'radial-gradient(circle at 35% 35%, #fff8d8, #fdd9a0)' : 'radial-gradient(circle at 35% 35%, #ffffff, #fff0c8)', boxShadow: '0 0 50px rgba(255,230,180,0.6)' }} />
      </div>
    );
  }
  if (timeOfDay === 'evening') {
    return (
      <div style={{ position: 'absolute', right: '15%', top: '45%', width: 80, height: 80, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: -50, background: 'radial-gradient(circle, rgba(255,170,120,0.7) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #fff0c0, #f49060)', boxShadow: '0 0 60px rgba(255,150,100,0.7)' }} />
      </div>
    );
  }
  const pos = timeOfDay === 'dawn' ? { left: '15%', top: '20%' } : { right: '15%', top: '12%' };
  const size = timeOfDay === 'night' ? 100 : 70;
  return (
    <div style={{ position: 'absolute', ...pos, width: size, height: size, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: timeOfDay === 'night' ? -60 : -30, background: timeOfDay === 'night' ? 'radial-gradient(circle, rgba(255,250,220,0.5) 0%, rgba(255,240,200,0.15) 40%, transparent 70%)' : 'radial-gradient(circle, rgba(230,220,255,0.4) 0%, transparent 65%)' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: timeOfDay === 'night' ? 'radial-gradient(circle at 38% 38%, #ffffff, #fff5d0)' : 'radial-gradient(circle at 38% 38%, #f8f4ff, #c8bedc)', boxShadow: timeOfDay === 'night' ? '0 0 50px rgba(255,245,210,0.8), 0 0 100px rgba(255,235,180,0.4)' : '0 0 30px rgba(220,210,255,0.5)' }} />
      <div style={{ position: 'absolute', left: '55%', top: '45%', width: size * 0.14, height: size * 0.14, borderRadius: '50%', background: timeOfDay === 'night' ? 'rgba(230,215,170,0.35)' : 'rgba(170,160,200,0.35)' }} />
    </div>
  );
}

function Cloud({ color, scale = 1, x = 0, timeOfDay = 'day' }) {
  const w = 200 * scale, h = 70 * scale;
  const highlight = { dawn: 'rgba(255,245,225,0.85)', morning: 'rgba(255,255,245,0.95)', day: 'rgba(255,255,255,1)', evening: 'rgba(255,230,200,0.9)', night: 'rgba(220,210,245,0.55)' }[timeOfDay];
  const shadow = { dawn: 'rgba(180,150,165,0.4)', morning: 'rgba(220,180,160,0.5)', day: 'rgba(180,200,215,0.55)', evening: 'rgba(150,90,110,0.55)', night: 'rgba(80,70,120,0.3)' }[timeOfDay];
  return (
    <svg viewBox="0 0 200 70" width={w} height={h} style={{ position: 'absolute', left: `${x}%`, top: 0, overflow: 'visible' }}>
      <g fill={shadow}>
        <ellipse cx="45" cy="50" rx="30" ry="18" /><ellipse cx="78" cy="44" rx="34" ry="22" />
        <ellipse cx="115" cy="42" rx="32" ry="20" /><ellipse cx="150" cy="48" rx="28" ry="18" />
        <ellipse cx="98" cy="54" rx="42" ry="14" />
      </g>
      <g fill={color}>
        <ellipse cx="45" cy="42" rx="30" ry="18" /><ellipse cx="78" cy="34" rx="34" ry="22" />
        <ellipse cx="115" cy="32" rx="32" ry="20" /><ellipse cx="150" cy="40" rx="28" ry="18" />
        <ellipse cx="98" cy="46" rx="42" ry="14" />
      </g>
      <g fill={highlight} opacity="0.7">
        <ellipse cx="78" cy="24" rx="26" ry="10" /><ellipse cx="115" cy="22" rx="22" ry="8" />
        <ellipse cx="48" cy="32" rx="18" ry="7" />
      </g>
    </svg>
  );
}

function Clouds({ colors, timeOfDay, cover = 0.35 }) {
  const allLayers = [
    { y: 18, scale: 1.4, dur: 90, delay: 0, color: colors[0] },
    { y: 35, scale: 0.9, dur: 120, delay: -40, color: colors[1] },
    { y: 10, scale: 1.1, dur: 110, delay: -70, color: colors[0] },
    { y: 48, scale: 0.75, dur: 140, delay: -20, color: colors[1] },
  ];
  const numLayers = Math.round(cover * 4);
  const layers = allLayers.slice(0, numLayers);
  const allPositions = [5, 22, 40, 58, 78, 92];
  const numClouds = Math.max(1, Math.round(cover * 6));
  const step = allPositions.length / numClouds;
  const positions = Array.from({ length: numClouds }, (_, i) => allPositions[Math.floor(i * step)]);
  const scaleMultipliers = [1, 0.8, 1.1, 0.9, 1, 0.85];
  if (numLayers === 0) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {layers.map((layer, i) => (
        <div key={i} style={{ position: 'absolute', top: `${layer.y}%`, left: 0, width: '200%', height: 120, animation: `toki-cloud-drift ${layer.dur}s linear ${layer.delay}s infinite` }}>
          {positions.map((x, j) => (
            <Cloud key={j} color={layer.color} scale={layer.scale * (scaleMultipliers[allPositions.indexOf(x)] ?? 1)} x={x} timeOfDay={timeOfDay} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Landscape({ color, highlight, timeOfDay }) {
  const alpha = timeOfDay === 'night' ? 0.85 : timeOfDay === 'dawn' ? 0.7 : 0.6;
  const trees = (baseX, baseY, count, scale = 1) => (
    <g>
      {[...Array(count)].map((_, i) => {
        const x = baseX + (i - count / 2) * 14 * scale + (i % 2 ? 3 : -3);
        const y = baseY + (i % 3) * 2;
        const s = scale * (0.7 + (i % 3) * 0.2);
        return (
          <g key={i} transform={`translate(${x}, ${y})`}>
            <rect x={-1.2 * s} y="0" width={2.4 * s} height={10 * s} fill={color} />
            <ellipse cx="0" cy={-3 * s} rx={7 * s} ry={10 * s} fill={color} />
          </g>
        );
      })}
    </g>
  );
  return (
    <svg viewBox="0 0 1000 320" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '44%', pointerEvents: 'none' }}>
      <path d="M0 160 L 80 130 L 150 145 L 230 110 L 310 138 L 400 118 L 490 140 L 580 112 L 680 135 L 780 108 L 870 132 L 1000 120 L 1000 320 L 0 320 Z" fill={color} opacity={alpha * 0.32} />
      <path d="M0 200 Q 120 160, 260 175 Q 380 188, 500 168 T 780 170 Q 900 162, 1000 182 L 1000 320 L 0 320 Z" fill={color} opacity={alpha * 0.5} />
      <g opacity={alpha * 0.45}>{trees(380, 180, 5, 0.6)}{trees(720, 175, 4, 0.55)}</g>
      <path d="M0 240 Q 150 200, 300 225 Q 420 245, 560 220 T 820 230 Q 920 222, 1000 244 L 1000 320 L 0 320 Z" fill={color} opacity={alpha * 0.72} />
      <g opacity={alpha * 0.68}>{trees(180, 228, 4, 0.8)}{trees(600, 222, 3, 0.75)}</g>
      <path d="M0 278 Q 200 250, 420 268 Q 580 280, 740 262 Q 880 256, 1000 275 L 1000 320 L 0 320 Z" fill={color} opacity={alpha} />
      <path d="M0 278 Q 200 250, 420 268 Q 580 280, 740 262 Q 880 256, 1000 275 L 1000 282 Q 880 263, 740 269 Q 580 287, 420 275 Q 200 257, 0 285 Z" fill={highlight} opacity={alpha * 0.7} />
      <g opacity={alpha} transform="translate(790, 238)">
        <rect x="-2" y="0" width="4" height="20" fill={color} />
        <ellipse cx="-2" cy="-5" rx="10" ry="12" fill={color} />
        <ellipse cx="3" cy="-9" rx="8" ry="10" fill={color} />
        <ellipse cx="0" cy="-2" rx="11" ry="8" fill={color} />
      </g>
    </svg>
  );
}

function AtmosphereOverlay({ timeOfDay }) {
  const bloomColor = { dawn: 'rgba(255,220,180,0.22)', morning: 'rgba(255,235,195,0.3)', day: 'rgba(255,250,230,0.18)', evening: 'rgba(255,180,130,0.3)', night: 'rgba(200,195,240,0.15)' }[timeOfDay];
  const bloomPos = { dawn: '30% 70%', morning: '30% 40%', day: '60% 30%', evening: '75% 55%', night: '72% 35%' }[timeOfDay];
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 55% 50% at ${bloomPos}, ${bloomColor} 0%, transparent 65%)`, mixBlendMode: 'screen' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 90% 75% at 50% 50%, transparent 50%, rgba(60,40,30,0.18) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.14, mixBlendMode: 'multiply', backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.8  0 0 0 0 0.7  0 0 0 0 0.6  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")` }} />
    </>
  );
}

function Rain() {
  const drops = React.useMemo(() => [...Array(45)].map(() => ({ x: Math.random() * 100, delay: Math.random() * 1.5, dur: 0.7 + Math.random() * 0.5, len: 12 + Math.random() * 18 })), []);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {drops.map((d, i) => (
        <div key={i} style={{ position: 'absolute', left: `${d.x}%`, top: '-10%', width: 1, height: d.len, background: 'linear-gradient(180deg, transparent, rgba(200,220,240,0.55))', animation: `toki-rain ${d.dur}s linear ${d.delay}s infinite` }} />
      ))}
    </div>
  );
}

function Snow() {
  const flakes = React.useMemo(() => [...Array(40)].map(() => ({ x: Math.random() * 100, delay: Math.random() * 8, dur: 8 + Math.random() * 8, size: 2 + Math.random() * 4, drift: (Math.random() - 0.5) * 40 })), []);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {flakes.map((f, i) => (
        <div key={i} style={{ position: 'absolute', left: `${f.x}%`, top: '-5%', width: f.size, height: f.size, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', boxShadow: '0 0 4px rgba(255,255,255,0.5)', animation: `toki-snow ${f.dur}s linear ${f.delay}s infinite`, '--drift': `${f.drift}px` }} />
      ))}
    </div>
  );
}

function Haze() {
  return <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(240,235,230,0.3), rgba(200,195,190,0.4))', pointerEvents: 'none', mixBlendMode: 'overlay' }} />;
}

// Inject scene styles
(function() {
  if (document.getElementById('toki-scene-styles')) return;
  const s = document.createElement('style');
  s.id = 'toki-scene-styles';
  s.textContent = `
    @keyframes toki-cloud-drift { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    @keyframes toki-star { 0%,100%{opacity:0.3} 50%{opacity:1} }
    @keyframes toki-rain { from{transform:translateY(0);opacity:0} 10%{opacity:1} to{transform:translateY(120vh);opacity:0.3} }
    @keyframes toki-snow { from{transform:translateY(0) translateX(0);opacity:0} 10%{opacity:1} 90%{opacity:1} to{transform:translateY(110vh) translateX(var(--drift,0px));opacity:0} }
  `;
  document.head.appendChild(s);
})();

window.Scene = Scene;
window.SKY_GRADIENTS = SKY_GRADIENTS;
