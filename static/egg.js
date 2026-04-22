// Egg component — cute pastel egg for Toki
const EGG_PALETTES = {
  dawn:    { shell: '#fffdf6', spot: '#c5d9c0', glow: '#fff0dc', shadow: '#5a6a8a' },
  morning: { shell: '#fffdf6', spot: '#c5d9c0', glow: '#fff0d8', shadow: '#c89870' },
  day:     { shell: '#ffffff', spot: '#c5d9c0', glow: '#f0f8e8', shadow: '#a8b8a0' },
  evening: { shell: '#fff8ec', spot: '#c5d9c0', glow: '#ffd8c0', shadow: '#b86858' },
  night:   { shell: '#fff4ea', spot: '#c5d9c0', glow: '#ffe8d4', shadow: '#b8a898' },
};

function Egg({ state = 'idle', timeOfDay = 'morning', weather = 'clear', size = 200, interactive = false, onHover, onClick, showName = false, name = '토키' }) {
  const [hover, setHover] = React.useState(false);
  const [clicked, setClicked] = React.useState(false);
  const palette = EGG_PALETTES[timeOfDay] || EGG_PALETTES.morning;
  const effectiveState = clicked ? 'clicked' : (hover ? 'hover' : state);
  const breathDur = effectiveState === 'idle-long' ? '5s' : '3.5s';
  const glowIntensity = effectiveState === 'idle-long' ? 0.35 : effectiveState === 'hover' ? 1 : 0.7;
  const uid = React.useMemo(() => 'egg-' + Math.random().toString(36).slice(2, 9), []);

  const handleClick = () => {
    if (!interactive) return;
    setClicked(true);
    setTimeout(() => setClicked(false), 600);
    onClick && onClick();
  };

  return (
    <div
      className={clicked ? 'egg-wrap egg-shake' : 'egg-wrap'}
      style={{
        width: size, height: size * 1.15,
        position: 'relative', display: 'inline-block',
        cursor: interactive ? 'pointer' : 'default',
        filter: `drop-shadow(0 ${size*0.04}px ${size*0.08}px rgba(${timeOfDay==='night'||timeOfDay==='dawn'?'30,20,60':'120,90,60'},0.22))`,
      }}
      onMouseEnter={() => { setHover(true); onHover && onHover(true); }}
      onMouseLeave={() => { setHover(false); onHover && onHover(false); }}
      onClick={handleClick}
    >
      <div className="egg-aura" style={{
        position: 'absolute', inset: '-15%',
        background: `radial-gradient(ellipse at 50% 55%, ${palette.glow}${Math.round(glowIntensity*80).toString(16).padStart(2,'0')} 0%, transparent 65%)`,
        opacity: glowIntensity,
        animation: `egg-aura-pulse ${breathDur} ease-in-out infinite`,
        pointerEvents: 'none',
      }} />

      {timeOfDay === 'night' && (
        <>
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI * 2 + 0.3;
            const r = 0.55;
            return (
              <div key={i} style={{
                position: 'absolute',
                left: `${50 + Math.cos(angle) * r * 50}%`,
                top: `${55 + Math.sin(angle) * r * 50}%`,
                width: 3, height: 3, borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 0 4px #fff, 0 0 8px rgba(230,220,255,0.6)',
                animation: `egg-twinkle 2.${i}s ease-in-out ${i*0.3}s infinite`,
              }} />
            );
          })}
        </>
      )}

      <div style={{ width: '100%', height: '100%', animation: `egg-breathe ${breathDur} ease-in-out infinite`, transformOrigin: '50% 55%' }}>
        <svg viewBox="0 0 220 250" width="100%" height="100%" style={{ overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${uid}-shell`} cx="36%" cy="28%" r="80%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="30%" stopColor={palette.shell} />
              <stop offset="100%" stopColor={palette.shadow} stopOpacity="0.35" />
            </radialGradient>
            <radialGradient id={`${uid}-pulse`} cx="50%" cy="60%" r="45%">
              <stop offset="0%" stopColor={palette.glow} stopOpacity="0.9" />
              <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${uid}-shine`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${uid}-blush`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff9eae" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ff9eae" stopOpacity="0" />
            </radialGradient>
            <clipPath id={`${uid}-clip`}>
              <path d="M110 22 C 150 22, 184 78, 188 150 C 192 216, 158 244, 110 244 C 62 244, 28 216, 32 150 C 36 78, 70 22, 110 22 Z" />
            </clipPath>
          </defs>

          <ellipse cx="110" cy="242" rx="58" ry="6" fill={palette.shadow} opacity="0.22" />

          <path d="M110 22 C 150 22, 184 78, 188 150 C 192 216, 158 244, 110 244 C 62 244, 28 216, 32 150 C 36 78, 70 22, 110 22 Z" fill={`url(#${uid}-shell)`} />

          <g clipPath={`url(#${uid}-clip)`} opacity="0.1">
            <ellipse cx="190" cy="175" rx="30" ry="65" fill={palette.shadow} />
          </g>

          <ellipse cx="110" cy="160" rx="68" ry="78" fill={`url(#${uid}-pulse)`}
            style={{ animation: `egg-inner-pulse ${breathDur} ease-in-out infinite`, transformOrigin: '110px 160px' }} />

          <circle cx="76" cy="158" r="14" fill={`url(#${uid}-blush)`} />
          <circle cx="144" cy="158" r="14" fill={`url(#${uid}-blush)`} />

          <path d="M 90 148 Q 96 155, 102 148" stroke="#6b4838" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.78" />
          <path d="M 118 148 Q 124 155, 130 148" stroke="#6b4838" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.78" />
          <path d="M 106 168 Q 110 172, 114 168" stroke="#6b4838" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.65" />

          <ellipse cx="82" cy="70" rx="26" ry="36" fill={`url(#${uid}-shine)`} opacity={hover ? 0.95 : 0.72} style={{ transition: 'opacity 0.4s' }} />
          <g opacity={hover ? 1 : 0.8} style={{ transition: 'opacity 0.4s' }}>
            <circle cx="150" cy="55" r="3" fill="#ffffff" />
            <circle cx="150" cy="55" r="6" fill="#ffffff" opacity="0.35" />
          </g>

          {weather === 'rain' && (
            <g clipPath={`url(#${uid}-clip)`}>
              {[[70,60],[130,80],[100,130],[160,170],[75,190]].map(([x,y],i) => (
                <ellipse key={i} cx={x} cy={y} rx="3" ry="4" fill="rgba(180,210,230,0.55)" stroke="rgba(255,255,255,0.7)" strokeWidth="0.6" />
              ))}
            </g>
          )}
          {weather === 'snow' && (
            <g clipPath={`url(#${uid}-clip)`}>
              {[[80,55],[135,75],[110,135],[160,175],[72,200]].map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r="2.2" fill="rgba(255,255,255,0.95)" />
              ))}
            </g>
          )}
        </svg>
      </div>

      {showName && (
        <div style={{
          position: 'absolute', top: '-12%', left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Nanum Pen Script', 'Gowun Dodum', cursive",
          fontSize: size * 0.13,
          color: timeOfDay === 'night' || timeOfDay === 'dawn' ? '#f0e8ff' : '#6b5540',
          textShadow: timeOfDay === 'night' ? '0 0 12px rgba(200,180,255,0.5)' : '0 1px 2px rgba(255,255,255,0.6)',
          whiteSpace: 'nowrap',
          letterSpacing: '0.04em',
        }}>
          {name}
        </div>
      )}
    </div>
  );
}

// Inject egg styles
(function() {
  if (document.getElementById('toki-egg-styles')) return;
  const s = document.createElement('style');
  s.id = 'toki-egg-styles';
  s.textContent = `
    @keyframes egg-breathe { 0%,100%{transform:scale(1,1)} 50%{transform:scale(1.025,1.03)} }
    @keyframes egg-inner-pulse { 0%,100%{opacity:0.5;transform:scale(0.95)} 50%{opacity:1;transform:scale(1.08)} }
    @keyframes egg-aura-pulse { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
    @keyframes egg-twinkle { 0%,100%{opacity:0.2;transform:scale(0.5)} 50%{opacity:1;transform:scale(1.2)} }
    @keyframes egg-shake-kf { 0%,100%{transform:translateX(0) rotate(0)} 15%{transform:translateX(-3px) rotate(-2deg)} 30%{transform:translateX(3px) rotate(2deg)} 45%{transform:translateX(-2px) rotate(-1deg)} 60%{transform:translateX(2px) rotate(1deg)} 75%{transform:translateX(-1px) rotate(0)} }
    .egg-shake { animation: egg-shake-kf 0.6s ease-out !important; }
  `;
  document.head.appendChild(s);
})();

window.Egg = Egg;
window.EGG_PALETTES = EGG_PALETTES;
