// ── 상태 ──────────────────────────────────────────
const state = {
  token: localStorage.getItem('toki_token'),
  nickname: localStorage.getItem('toki_nickname'),
  eggName: localStorage.getItem('toki_egg_name'),
  adoptedAt: localStorage.getItem('toki_adopted_at'),
  weather: null,
  lastInteraction: Date.now(),
};

// ── DOM ───────────────────────────────────────────
const egg = document.getElementById('egg');
const eggLabel = document.getElementById('egg-label');
const daysLabel = document.getElementById('days-label');
const userLabel = document.getElementById('user-label');
const msgInput = document.getElementById('message-input');
const messagesArea = document.getElementById('messages-area');
const modalOverlay = document.getElementById('modal-overlay');
const helpBtn = document.getElementById('help-btn');
const modalClose = document.getElementById('modal-close');
const nameToast = document.getElementById('name-toast');
const nameInput = document.getElementById('name-input');
const nameBtn = document.getElementById('name-btn');
const nameSkip = document.getElementById('name-skip');

// ── 배경 캔버스 ───────────────────────────────────
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function getBgGradient(hour, weather) {
  const gradients = {
    dawn:    ['#0d0b2e', '#2d1b4e', '#4a1942'],
    morning: ['#ffd6a5', '#ffafcc', '#cdb4db'],
    day:     ['#a8dadc', '#caf0f8', '#e9f5f7'],
    evening: ['#e07a5f', '#f2a65a', '#9e6b8c'],
    night:   ['#0d0b2e', '#1a1040', '#2a1650'],
  };

  let g;
  if (hour >= 0 && hour < 6)       g = gradients.dawn;
  else if (hour >= 6 && hour < 12) g = gradients.morning;
  else if (hour >= 12 && hour < 18) g = gradients.day;
  else if (hour >= 18 && hour < 21) g = gradients.evening;
  else                               g = gradients.night;

  return g;
}

function spawnParticle(weather, hour) {
  if (!weather) return;
  const cond = weather.condition;
  if (cond === 'rain' || cond === 'drizzle' || cond === 'thunderstorm') {
    return { type: 'rain', x: Math.random() * canvas.width, y: -10, speed: 8 + Math.random() * 4, opacity: 0.4 + Math.random() * 0.3 };
  }
  if (cond === 'snow') {
    return { type: 'snow', x: Math.random() * canvas.width, y: -10, speed: 1 + Math.random() * 1.5, drift: (Math.random() - 0.5) * 0.5, opacity: 0.6 + Math.random() * 0.3 };
  }
  if (hour >= 21 || hour < 6) {
    return { type: 'star', x: Math.random() * canvas.width, y: Math.random() * canvas.height * 0.6, twinkle: Math.random() * Math.PI * 2, opacity: 0.3 + Math.random() * 0.5 };
  }
  return null;
}

function drawBg() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const hour = now.getHours();
  const colors = getBgGradient(hour, state.weather);

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(0.5, colors[1]);
  grad.addColorStop(1, colors[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 파티클 스폰
  if (Math.random() < 0.05) {
    const p = spawnParticle(state.weather, hour);
    if (p && particles.length < 200) particles.push(p);
  }

  // 파티클 그리기
  particles = particles.filter(p => {
    ctx.save();
    if (p.type === 'rain') {
      ctx.strokeStyle = `rgba(180,210,255,${p.opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 1, p.y + 10);
      ctx.stroke();
      p.y += p.speed;
      ctx.restore();
      return p.y < canvas.height + 20;
    }
    if (p.type === 'snow') {
      ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      p.y += p.speed;
      p.x += p.drift;
      ctx.restore();
      return p.y < canvas.height + 20;
    }
    if (p.type === 'star') {
      p.twinkle += 0.02;
      const op = p.opacity * (0.7 + 0.3 * Math.sin(p.twinkle));
      ctx.fillStyle = `rgba(255,255,255,${op})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true; // 별은 사라지지 않음
    }
    ctx.restore();
    return false;
  });

  requestAnimationFrame(drawBg);
}
drawBg();

// ── 날씨 로드 ─────────────────────────────────────
async function loadWeather() {
  try {
    const res = await fetch('/api/weather');
    if (res.ok) state.weather = await res.json();
  } catch {}
}
loadWeather();
setInterval(loadWeather, 30 * 60 * 1000);

// ── 알 상태 ───────────────────────────────────────
function updateEggState() {
  const idle = (Date.now() - state.lastInteraction) / 1000 / 60; // 분
  if (idle > 30) {
    egg.classList.add('cold');
  } else {
    egg.classList.remove('cold');
  }

  if (state.eggName) {
    eggLabel.textContent = state.eggName;
  } else if (state.token) {
    eggLabel.textContent = '이름 없는 알';
  } else {
    eggLabel.textContent = '';
  }

  if (state.adoptedAt) {
    const days = Math.floor((Date.now() - new Date(state.adoptedAt)) / 86400000);
    daysLabel.textContent = `D+${days} 함께한 날`;
  }

  userLabel.textContent = state.nickname ? `${state.nickname}의 알` : '';
}
setInterval(updateEggState, 60 * 1000);
updateEggState();

// ── 알 클릭 ───────────────────────────────────────
egg.addEventListener('click', async () => {
  state.lastInteraction = Date.now();
  egg.classList.remove('clicked');
  void egg.offsetWidth;
  egg.classList.add('clicked');
  setTimeout(() => egg.classList.remove('clicked'), 400);
  updateEggState();

  if (state.token) {
    try {
      await fetch('/api/egg/touch', { method: 'POST', headers: { Authorization: `Bearer ${state.token}` } });
    } catch {}
  }
});

// ── 메시지 날리기 ─────────────────────────────────
msgInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && msgInput.value.trim()) {
    launchMessage(msgInput.value.trim());
    msgInput.value = '';
    state.lastInteraction = Date.now();
    updateEggState();
  }
});

function launchMessage(text) {
  const el = document.createElement('div');
  el.className = 'floating-msg';
  el.textContent = text;

  const inputRect = msgInput.getBoundingClientRect();
  const startX = inputRect.left + inputRect.width / 2 + (Math.random() - 0.5) * 60;
  const startY = inputRect.top - 10;
  const drift = ((Math.random() - 0.5) * 80) + 'px';

  el.style.left = startX + 'px';
  el.style.top = startY + 'px';
  el.style.setProperty('--drift', drift);

  messagesArea.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// ── 모달 ──────────────────────────────────────────
helpBtn.addEventListener('click', () => modalOverlay.classList.remove('hidden'));
modalClose.addEventListener('click', () => modalOverlay.classList.add('hidden'));
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
});

// 탭 전환
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const which = tab.dataset.tab;
    document.getElementById('login-form').classList.toggle('hidden', which !== 'login');
    document.getElementById('register-form').classList.toggle('hidden', which !== 'register');
  });
});

// 로그인
document.getElementById('login-btn').addEventListener('click', async () => {
  const nickname = document.getElementById('login-nickname').value.trim();
  const pin = document.getElementById('login-pin').value.trim();
  const errEl = document.getElementById('login-error');
  errEl.classList.add('hidden');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, pin }),
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.detail || '로그인 실패'; errEl.classList.remove('hidden'); return; }
    saveAuth(data);
    modalOverlay.classList.add('hidden');
    checkNameToast();
  } catch {
    errEl.textContent = '서버 오류가 발생했어요'; errEl.classList.remove('hidden');
  }
});

// 회원가입
document.getElementById('register-btn').addEventListener('click', async () => {
  const nickname = document.getElementById('reg-nickname').value.trim();
  const pin = document.getElementById('reg-pin').value.trim();
  const errEl = document.getElementById('reg-error');
  errEl.classList.add('hidden');

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, pin }),
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.detail || '가입 실패'; errEl.classList.remove('hidden'); return; }
    saveAuth(data);
    modalOverlay.classList.add('hidden');
    checkNameToast();
  } catch {
    errEl.textContent = '서버 오류가 발생했어요'; errEl.classList.remove('hidden');
  }
});

function saveAuth(data) {
  state.token = data.token;
  state.nickname = data.nickname;
  state.eggName = data.egg_name;
  state.adoptedAt = data.adopted_at;
  localStorage.setItem('toki_token', data.token);
  localStorage.setItem('toki_nickname', data.nickname);
  if (data.egg_name) localStorage.setItem('toki_egg_name', data.egg_name);
  if (data.adopted_at) localStorage.setItem('toki_adopted_at', data.adopted_at);
  updateEggState();
}

// ── 이름 토스트 ───────────────────────────────────
function checkNameToast() {
  if (state.token && !state.eggName) {
    nameToast.classList.remove('hidden');
  }
}

nameSkip.addEventListener('click', () => nameToast.classList.add('hidden'));
nameBtn.addEventListener('click', async () => {
  const name = nameInput.value.trim();
  if (!name) return;
  try {
    const res = await fetch('/api/egg/name', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.token}` },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const data = await res.json();
      state.eggName = data.egg_name;
      localStorage.setItem('toki_egg_name', data.egg_name);
      updateEggState();
      nameToast.classList.add('hidden');
    }
  } catch {}
});

// ── 세션 복원 ─────────────────────────────────────
if (state.token) {
  fetch('/api/egg/me', { headers: { Authorization: `Bearer ${state.token}` } })
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data) {
        state.eggName = data.egg_name;
        state.adoptedAt = data.adopted_at;
        if (data.egg_name) localStorage.setItem('toki_egg_name', data.egg_name);
        if (data.adopted_at) localStorage.setItem('toki_adopted_at', data.adopted_at);
        updateEggState();
        checkNameToast();
      } else {
        // 토큰 만료
        localStorage.removeItem('toki_token');
        localStorage.removeItem('toki_nickname');
        state.token = null;
        state.nickname = null;
      }
    })
    .catch(() => {});
}

// 플레이스홀더 시간대별
function updatePlaceholder() {
  const hour = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' })).getHours();
  const placeholders = {
    dawn: '잠 못 자고 있어?',
    morning: '오늘 하루 어떨 것 같아?',
    day: '지금 어때?',
    evening: '오늘 수고했어',
    night: '뭐든 털어놔봐',
  };
  let ph;
  if (hour < 6) ph = placeholders.dawn;
  else if (hour < 12) ph = placeholders.morning;
  else if (hour < 18) ph = placeholders.day;
  else if (hour < 21) ph = placeholders.evening;
  else ph = placeholders.night;
  msgInput.placeholder = ph;
}
updatePlaceholder();
setInterval(updatePlaceholder, 60 * 1000);
