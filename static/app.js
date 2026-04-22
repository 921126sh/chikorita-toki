// Toki — main app with API integration

const PLACEHOLDERS = {
  dawn: '잠 못 자고 있어?', morning: '오늘 하루 어떨 것 같아?',
  day: '지금 어때?', evening: '오늘 수고했어', night: '뭐든 털어놔봐',
};

const TEXT_COLOR = {
  dawn: 'rgba(240,232,255,0.92)', morning: 'rgba(80,55,35,0.88)',
  day: 'rgba(60,80,70,0.88)', evening: 'rgba(70,35,55,0.9)', night: 'rgba(230,222,255,0.92)',
};

const INPUT_BG = {
  dawn: 'rgba(255,255,255,0.1)', morning: 'rgba(255,255,255,0.45)',
  day: 'rgba(255,255,255,0.55)', evening: 'rgba(255,255,255,0.18)', night: 'rgba(255,255,255,0.1)',
};

const INPUT_BORDER = {
  dawn: 'rgba(220,210,255,0.2)', morning: 'rgba(255,240,220,0.7)',
  day: 'rgba(255,255,255,0.8)', evening: 'rgba(255,220,200,0.35)', night: 'rgba(200,190,240,0.22)',
};

// ── Utilities ─────────────────────────────────────
function getTimeOfDay() {
  const h = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' })).getHours();
  if (h < 6) return 'dawn';
  if (h < 12) return 'morning';
  if (h < 18) return 'day';
  if (h < 21) return 'evening';
  return 'night';
}

function daysSince(isoStr) {
  return Math.floor((Date.now() - new Date(isoStr)) / 86400000);
}

// ── API helpers ────────────────────────────────────
async function apiPost(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '오류가 발생했어요');
  return data;
}

async function apiPatch(path, body, token) {
  const res = await fetch(path, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '오류가 발생했어요');
  return data;
}

async function apiGet(path, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(path, { headers });
  if (!res.ok) return null;
  return res.json();
}

// ── FlyingText ─────────────────────────────────────
function FlyingText({ text, timeOfDay, onDone }) {
  const [phase, setPhase] = React.useState('rising');
  const seed = React.useMemo(() => Math.random() * 20 - 10, []);
  const particles = React.useMemo(() =>
    [...Array(14)].map(() => ({
      dx: (Math.random() - 0.5) * 120,
      dy: -60 - Math.random() * 100,
      delay: Math.random() * 0.6,
      size: 2 + Math.random() * 3,
    })), []);

  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase('dissolving'), 2200);
    const t2 = setTimeout(() => onDone && onDone(), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const color = TEXT_COLOR[timeOfDay];
  const particleColor = timeOfDay === 'night' || timeOfDay === 'dawn'
    ? 'rgba(230,220,255,0.85)'
    : timeOfDay === 'evening' ? 'rgba(255,220,195,0.9)'
    : 'rgba(255,255,255,0.9)';

  return (
    <div style={{ position: 'absolute', left: `calc(50% + ${seed * 2}px)`, bottom: '26%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 9 }}>
      {phase === 'rising' && (
        <div style={{
          fontFamily: "'Gowun Dodum', 'Noto Sans KR', sans-serif",
          fontSize: 18, color,
          textShadow: timeOfDay === 'night' ? '0 0 12px rgba(200,180,255,0.4)' : '0 1px 3px rgba(255,255,255,0.3)',
          whiteSpace: 'nowrap',
          animation: 'toki-fly 2.5s cubic-bezier(.25,.6,.3,1) forwards',
          '--sway': `${seed}px`,
        }}>
          {text}
        </div>
      )}
      {phase === 'dissolving' && (
        <div style={{ position: 'relative', width: 1, height: 1 }}>
          {particles.map((p, i) => (
            <div key={i} style={{
              position: 'absolute', left: 0, top: 0,
              width: p.size, height: p.size, borderRadius: '50%',
              background: particleColor, boxShadow: `0 0 ${p.size * 2}px ${particleColor}`,
              animation: `toki-particle 2.2s ease-out ${p.delay}s forwards`,
              '--dx': `${p.dx}px`, '--dy': `${p.dy}px`,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── InputBar ───────────────────────────────────────
function InputBar({ timeOfDay, onFly }) {
  const [value, setValue] = React.useState('');
  const handleKey = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      onFly && onFly(value.trim());
      setValue('');
    }
  };
  return (
    <div style={{
      width: '100%', maxWidth: 520, margin: '0 auto',
      background: INPUT_BG[timeOfDay],
      backdropFilter: 'blur(14px) saturate(1.1)',
      WebkitBackdropFilter: 'blur(14px) saturate(1.1)',
      border: `1px solid ${INPUT_BORDER[timeOfDay]}`,
      borderRadius: 18,
      padding: '16px 22px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.25)',
      transition: 'all 0.6s ease',
    }}>
      <input
        type="text" value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder={PLACEHOLDERS[timeOfDay]}
        maxLength={100}
        autoComplete="off"
        style={{
          width: '100%', background: 'transparent', border: 'none', outline: 'none',
          fontFamily: "'Gowun Dodum', 'Noto Sans KR', sans-serif",
          fontSize: 17, color: TEXT_COLOR[timeOfDay], letterSpacing: '-0.01em',
        }}
      />
    </div>
  );
}

// ── LoginModal ─────────────────────────────────────
function LoginModal({ timeOfDay, onClose, onAuth }) {
  const [tab, setTab] = React.useState('login');
  const [nickname, setNickname] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const path = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const data = await apiPost(path, { nickname, pin });
      onAuth(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: '11px 14px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10,
    background: 'rgba(255,255,255,0.7)', fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 13, color: '#3a2f28', outline: 'none', width: '100%',
  };

  return (
    <div
      style={{ position: 'absolute', inset: 0, background: 'rgba(20,15,30,0.35)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, animation: 'toki-fade-in 0.4s ease' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '90%', maxWidth: 380, background: 'rgba(255,253,248,0.96)', backdropFilter: 'blur(24px)', borderRadius: 22, padding: '34px 32px 28px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', fontFamily: "'Noto Sans KR', sans-serif", color: '#3a2f28', animation: 'toki-scale-in 0.35s cubic-bezier(.2,.8,.3,1)', position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 16, background: 'transparent', border: 'none', fontSize: 18, color: 'rgba(0,0,0,0.4)', cursor: 'pointer', padding: 4 }}>×</button>

        <div style={{ fontFamily: "'Gowun Dodum', serif", fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>🥚  토키에게</div>
        <div style={{ fontSize: 13, lineHeight: 1.75, opacity: 0.75, marginBottom: 18 }}>
          마음에 걸리는 말이 있다면 이곳에 흘려보내요.<br/>
          토키가 조용히 듣고, 하늘로 실어 보내 줄게요.
        </div>

        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)', margin: '0 0 18px' }} />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }} style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1px solid ${tab === t ? 'rgba(58,47,40,0.4)' : 'rgba(0,0,0,0.1)'}`, background: tab === t ? '#3a2f28' : 'transparent', color: tab === t ? '#fef6e8' : '#3a2f28', fontFamily: "'Noto Sans KR', sans-serif", fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}>
              {t === 'login' ? '로그인' : '처음이에요'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="닉네임" maxLength={20} style={inputStyle} />
          <input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="PIN 4자리 (숫자)" type="password" inputMode="numeric" maxLength={4} style={inputStyle}
            onKeyDown={e => e.key === 'Enter' && submit()} />
          {error && <div style={{ fontSize: 12, color: '#c0392b', textAlign: 'center' }}>{error}</div>}
          <button onClick={submit} disabled={loading} style={{ marginTop: 6, padding: '12px', borderRadius: 12, border: 'none', background: '#3a2f28', color: '#fef6e8', fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, fontWeight: 500, letterSpacing: '0.05em', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : tab === 'login' ? '로그인' : '알 입양하기'}
          </button>
        </div>

        <div style={{ marginTop: 14, fontSize: 11, opacity: 0.45, lineHeight: 1.6, textAlign: 'center' }}>
          PIN을 잊으면 새 알을 입양하면 돼요.
        </div>
      </div>
    </div>
  );
}

// ── NameToast ──────────────────────────────────────
function NameToast({ timeOfDay, token, onNamed, onSkip }) {
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const tc = TEXT_COLOR[timeOfDay];

  const submit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const data = await apiPatch('/api/egg/name', { name: name.trim() }, token);
      onNamed(data.egg_name);
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', bottom: 110, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(30,20,50,0.88)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center',
      gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.8)', zIndex: 50,
      backdropFilter: 'blur(8px)', whiteSpace: 'nowrap', animation: 'toki-scale-in 0.3s ease',
    }}>
      <span>알 이름을 지어줄래요?</span>
      <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="이름" maxLength={20}
        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '6px 10px', color: '#fff', fontSize: 13, width: 100, outline: 'none' }} />
      <button onClick={submit} disabled={loading} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'rgba(201,160,220,0.35)', color: '#fff', fontSize: 12, cursor: 'pointer' }}>지어주기</button>
      <button onClick={onSkip} style={{ padding: '6px 8px', borderRadius: 8, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer' }}>나중에</button>
    </div>
  );
}

// ── App ────────────────────────────────────────────
function App() {
  const [timeOfDay, setTimeOfDay] = React.useState(getTimeOfDay());
  const [weather, setWeather] = React.useState('clear');
  const [weatherIntensity, setWeatherIntensity] = React.useState('moderate');
  const [hasThunder, setHasThunder] = React.useState(false);
  const [flying, setFlying] = React.useState([]);
  const [showModal, setShowModal] = React.useState(false);
  const [showNameToast, setShowNameToast] = React.useState(false);
  const [eggState, setEggState] = React.useState('idle');

  // Auth state
  const [token, setToken] = React.useState(() => localStorage.getItem('toki_token'));
  const [nickname, setNickname] = React.useState(() => localStorage.getItem('toki_nickname'));
  const [eggName, setEggName] = React.useState(() => localStorage.getItem('toki_egg_name'));
  const [adoptedAt, setAdoptedAt] = React.useState(() => localStorage.getItem('toki_adopted_at'));
  const lastInteraction = React.useRef(Date.now());

  // Update time of day every minute
  React.useEffect(() => {
    const iv = setInterval(() => setTimeOfDay(getTimeOfDay()), 60000);
    return () => clearInterval(iv);
  }, []);

  // Fetch weather
  React.useEffect(() => {
    const load = async () => {
      const data = await apiGet('/api/weather');
      if (data) {
        setWeather(data.condition);
        setWeatherIntensity(data.intensity || 'moderate');
        setHasThunder(data.has_thunder || false);
      }
    };
    load();
    const iv = setInterval(load, 30 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  // Restore session
  React.useEffect(() => {
    if (!token) return;
    apiGet('/api/egg/me', token).then(data => {
      if (!data) {
        localStorage.removeItem('toki_token');
        localStorage.removeItem('toki_nickname');
        setToken(null); setNickname(null);
        return;
      }
      setEggName(data.egg_name);
      setAdoptedAt(data.adopted_at);
      if (data.egg_name) localStorage.setItem('toki_egg_name', data.egg_name);
      if (data.adopted_at) localStorage.setItem('toki_adopted_at', data.adopted_at);
      if (!data.egg_name) setShowNameToast(true);
    }).catch(() => {});
  }, []);

  // Idle state check
  React.useEffect(() => {
    const iv = setInterval(() => {
      const idle = (Date.now() - lastInteraction.current) / 1000 / 60;
      setEggState(idle > 30 ? 'idle-long' : 'idle');
    }, 60000);
    return () => clearInterval(iv);
  }, []);

  const handleAuth = (data) => {
    setToken(data.token);
    setNickname(data.nickname);
    setEggName(data.egg_name);
    setAdoptedAt(data.adopted_at);
    localStorage.setItem('toki_token', data.token);
    localStorage.setItem('toki_nickname', data.nickname);
    if (data.egg_name) localStorage.setItem('toki_egg_name', data.egg_name);
    if (data.adopted_at) localStorage.setItem('toki_adopted_at', data.adopted_at);
    setShowModal(false);
    if (!data.egg_name) setShowNameToast(true);
  };

  const handleEggClick = async () => {
    lastInteraction.current = Date.now();
    setEggState('idle');
    if (token) {
      try { await apiPost('/api/egg/touch', {}, token); } catch {}
    }
  };

  const handleFly = (text) => {
    lastInteraction.current = Date.now();
    const id = Date.now() + Math.random();
    setFlying(prev => [...prev, { id, text }]);
  };

  const tc = TEXT_COLOR[timeOfDay];
  const loggedIn = !!token;
  const days = adoptedAt ? daysSince(adoptedAt) : null;

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Scene timeOfDay={timeOfDay} weather={weather} intensity={weatherIntensity} hasThunder={hasThunder}>

        {/* Top right — user info */}
        {loggedIn && (
          <div style={{ position: 'absolute', top: 22, right: 28, textAlign: 'right', fontFamily: "'Gowun Dodum', 'Noto Sans KR', sans-serif", color: tc, zIndex: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em' }}>{nickname}</div>
            {days !== null && <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>D+{days} 함께한 날</div>}
          </div>
        )}

        {/* Egg */}
        <div style={{ position: 'absolute', left: '50%', top: '38%', transform: 'translate(-50%, -30%)', zIndex: 6 }}>
          <Egg
            timeOfDay={timeOfDay}
            weather={weather}
            size={200}
            state={eggState}
            interactive={true}
            showName={loggedIn && !!eggName}
            name={eggName || '토키'}
            onClick={handleEggClick}
          />
        </div>

        {/* Flying texts */}
        {flying.map(f => (
          <FlyingText key={f.id} text={f.text} timeOfDay={timeOfDay} onDone={() => setFlying(prev => prev.filter(x => x.id !== f.id))} />
        ))}

        {/* Input */}
        <div style={{ position: 'absolute', left: '50%', bottom: '22%', transform: 'translateX(-50%)', width: '80%', maxWidth: 520, zIndex: 7 }}>
          <InputBar timeOfDay={timeOfDay} onFly={handleFly} />
        </div>

        {/* Bottom chrome */}
        <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 28px', zIndex: 6 }}>
          <button onClick={() => setShowModal(true)} style={{ background: 'transparent', border: 'none', color: tc, fontFamily: "'Noto Sans KR', sans-serif", fontSize: 12, opacity: 0.6, cursor: 'pointer', letterSpacing: '0.05em', padding: 4 }}>
            ? 도움말
          </button>
          {!loggedIn && (
            <button onClick={() => setShowModal(true)} style={{ background: 'transparent', border: 'none', color: tc, fontFamily: "'Noto Sans KR', sans-serif", fontSize: 12, opacity: 0.7, cursor: 'pointer', letterSpacing: '0.05em', padding: 4 }}>
              로그인
            </button>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <LoginModal timeOfDay={timeOfDay} onClose={() => setShowModal(false)} onAuth={handleAuth} />
        )}
      </Scene>

      {/* Name toast */}
      {showNameToast && token && (
        <NameToast
          timeOfDay={timeOfDay}
          token={token}
          onNamed={(name) => { setEggName(name); localStorage.setItem('toki_egg_name', name); setShowNameToast(false); }}
          onSkip={() => setShowNameToast(false)}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
