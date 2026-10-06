// 1분 눈운동 — 6가지 동작을 10초씩, 점을 눈으로만 따라가는 눈 스트레칭
(() => {
  "use strict";

  const STEP = 10; // 동작당 초
  const $ = (id) => document.getElementById(id);
  const TAU = Math.PI * 2;

  // 각 동작: pos(t, s) 는 t초 시점의 점 위치(-1..1)와 크기를 돌려준다. s = 속도 배율
  const EXERCISES = [
    {
      name: "좌우로 보기", icon: "↔",
      text: "고개는 그대로, 눈으로만 점을 따라가세요",
      track: "h",
      pos: (t, s) => ({ x: Math.sin(TAU * t * s / 2.5), y: 0 }),
    },
    {
      name: "위아래로 보기", icon: "↕",
      text: "턱을 움직이지 말고 눈만 위아래로",
      track: "v",
      pos: (t, s) => ({ x: 0, y: -Math.sin(TAU * t * s / 2.5) }),
    },
    {
      name: "크게 원 그리기", icon: "⟳",
      text: "시계 방향으로 천천히 원을 그려요",
      track: "circle",
      sub: [{ at: 5, text: "이번엔 반대 방향으로", say: "반대 방향" }],
      pos: (t, s) => {
        const a = (t < 5 ? t : 5 - (t - 5)) * TAU * s / 3.2 - Math.PI / 2;
        return { x: Math.cos(a), y: Math.sin(a), round: true };
      },
    },
    {
      name: "8자 그리기", icon: "∞",
      text: "누운 8자를 따라 부드럽게",
      track: null,
      pos: (t, s) => {
        const a = TAU * t * s / 5;
        return { x: Math.sin(a), y: Math.sin(2 * a) * 0.55 };
      },
    },
    {
      name: "가까이·멀리 초점", icon: "◎",
      text: "점이 커지면 가까이, 작아지면 멀리 본다는 느낌으로",
      track: null,
      pos: (t, s) => ({ x: 0, y: 0, scale: 0.45 + 1.9 * (0.5 - 0.5 * Math.cos(TAU * t * s / 4)) }),
    },
    {
      name: "깜빡이고 쉬기", icon: "◡",
      text: "가볍게 빠르게 깜빡이세요",
      blink: true,
      sub: [{ at: 5, text: "이제 눈을 감고 편히 쉬세요", say: "눈을 감고 쉬세요", close: true }],
    },
  ];
  const TOTAL = EXERCISES.length * STEP;

  const TIPS = [
    "20-20-20 규칙: 20분마다 6m(20피트) 떨어진 곳을 20초간 바라보세요.",
    "화면은 눈높이보다 살짝 아래, 팔 길이 정도 떨어뜨려 두면 편해요.",
    "집중하면 깜빡임이 줄어요. 의식적으로 자주 깜빡여 주세요.",
    "실내가 건조하면 눈도 쉽게 마릅니다. 물을 한 잔 마셔 보세요.",
    "어두운 방에서 밝은 화면만 보면 눈이 쉽게 피로해져요. 조명을 함께 켜세요.",
  ];

  // ── 저장소 (실패해도 앱은 동작) ──────────────────
  const KEY = "eyebreak:v1";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} };
  const data = Object.assign({ total: 0, days: {}, opt: { voice: true, sound: true, vibe: true, speed: 1 } }, load());

  const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  function streak() {
    const d = new Date();
    if (!data.days[dayKey(d)]) d.setDate(d.getDate() - 1); // 오늘 아직 안 했으면 어제부터 센다
    let n = 0;
    while (data.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function renderStats() {
    const today = data.days[dayKey()] || 0;
    $("statToday").textContent = today;
    $("statStreak").textContent = streak();
    $("statTotal").textContent = data.total;
    const h = new Date().getHours();
    $("greet").textContent = h < 11 ? "좋은 아침, 눈부터 깨워 볼까요" : h < 18 ? "잠깐, 화면에서 눈을 떼 볼까요" : "오늘도 수고한 눈에게 1분을";
  }

  // ── 화면 전환 ────────────────────────────────────
  function show(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
    document.querySelector(".sky").classList.toggle("dim", id === "workout");
  }

  // ── 인트로: 눈꺼풀이 열리는 애니메이션 ────────────
  function playIntro() {
    const lid = $("lidPath"), line = $("lidLine");
    const t0 = performance.now(), D = 1300;
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    function frame(now) {
      const k = ease(Math.min(1, (now - t0 - 300) / D));
      const p = Math.max(0, k);
      const up = 60 - 70 * p, down = 60 + 70 * p;
      lid.setAttribute("d", `M10 60 Q100 ${up} 190 60 Q100 ${down} 10 60Z`);
      line.setAttribute("d", `M10 60 Q100 ${up} 190 60`);
      line.style.opacity = String(1 - p);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  let introTimer;
  function leaveIntro() {
    clearTimeout(introTimer);
    if (!$("intro").classList.contains("active")) return;
    renderStats();
    show("home");
  }

  // ── 소리·음성·진동 ───────────────────────────────
  let audio;
  function chime(freq = 660) {
    if (!data.opt.sound) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime;
      o.type = "sine"; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.25);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      o.connect(g).connect(audio.destination); o.start(t); o.stop(t + 0.65);
    } catch {}
  }
  function say(text) {
    if (!data.opt.voice || !("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ko-KR"; u.rate = 1.05;
      speechSynthesis.speak(u);
    } catch {}
  }
  const buzz = (ms = 40) => { if (data.opt.vibe && navigator.vibrate) try { navigator.vibrate(ms); } catch {} };

  let wakeLock = null;
  async function keepAwake(on) {
    try {
      if (on && "wakeLock" in navigator) wakeLock = await navigator.wakeLock.request("screen");
      else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch {}
  }

  // ── 운동 진행 ────────────────────────────────────
  const dot = $("dot"), track = $("track"), stage = $("stage"), eye = $("blinkEye"), count = $("countdown");
  let elapsed = 0, lastTick = 0, running = false, paused = false, raf = 0, curIdx = -1, curSub = -1, countTimer = 0;

  function setTrack(kind, ax, ay) {
    const r = Math.min(ax, ay);
    const st = track.style;
    st.opacity = kind ? "1" : "0";
    st.borderRadius = kind === "circle" ? "50%" : "0";
    if (kind === "h") { st.width = ax * 2 + "px"; st.height = "0"; st.borderWidth = "1.5px 0 0 0"; }
    else if (kind === "v") { st.width = "0"; st.height = ay * 2 + "px"; st.borderWidth = "0 0 0 1.5px"; }
    else if (kind === "circle") { st.width = st.height = r * 2 + "px"; st.borderWidth = "1.5px"; }
  }

  function enterStep(i) {
    const ex = EXERCISES[i];
    curIdx = i; curSub = -1;
    $("cueStep").textContent = `${i + 1} / ${EXERCISES.length}`;
    $("cueTitle").textContent = ex.name;
    $("cueText").textContent = ex.text;
    dot.classList.toggle("on", !ex.blink);
    eye.classList.toggle("on", !!ex.blink);
    eye.classList.toggle("blink", !!ex.blink);
    eye.classList.remove("closed");
    if (i > 0) { chime(); buzz(); }
    say(ex.name);
  }

  function frame(now) {
    if (!running) return;
    // rAF 타임스탬프는 시작 시점에 잰 performance.now() 보다 앞설 수 있다 — 음수 경과가 되면 단계 번호가 -1 이 되어 멈춘다
    if (!paused) elapsed += Math.max(0, now - lastTick) / 1000;
    lastTick = now;
    if (elapsed >= TOTAL) return finish();

    const i = Math.max(0, Math.min(EXERCISES.length - 1, Math.floor(elapsed / STEP)));
    if (i !== curIdx) enterStep(i);
    const ex = EXERCISES[i], t = elapsed - i * STEP;

    // 단계 중간 안내 (원 반대 방향, 눈 감기)
    (ex.sub || []).forEach((s, k) => {
      if (t >= s.at && curSub < k) {
        curSub = k;
        $("cueText").textContent = s.text;
        say(s.say); buzz(25);
        if (s.close) { eye.classList.remove("blink"); eye.classList.add("closed"); }
      }
    });

    const w = stage.clientWidth, h = stage.clientHeight;
    const ax = w / 2 - 30, ay = h / 2 - 30;
    setTrack(ex.track, ax, ay);
    if (ex.pos) {
      const p = ex.pos(t, Number(data.opt.speed) || 1);
      const r = Math.min(ax, ay);
      const x = w / 2 + p.x * (p.round ? r : ax);
      const y = h / 2 + p.y * (p.round ? r : ay);
      dot.style.transform = `translate(${x}px, ${y}px) scale(${p.scale || 1})`;
    }

    $("timeLeft").textContent = Math.ceil(TOTAL - elapsed);
    $("barFill").style.width = (elapsed / TOTAL) * 100 + "%";
    raf = requestAnimationFrame(frame);
  }

  function start() {
    show("workout");
    keepAwake(true);
    elapsed = 0; curIdx = -1; paused = false; running = false;
    $("pauseBtn").textContent = "일시정지";
    $("timeLeft").textContent = TOTAL;
    $("barFill").style.width = "0";
    dot.classList.remove("on"); eye.classList.remove("on"); track.style.opacity = "0";
    $("cueStep").textContent = "준비";
    $("cueTitle").textContent = EXERCISES[0].name;
    $("cueText").textContent = "편하게 앉아 화면을 팔 길이만큼 떨어뜨리세요";
    let n = 3;
    const tick = () => {
      if (n === 0) {
        count.textContent = ""; chime(880); buzz(60);
        running = true; lastTick = performance.now();
        raf = requestAnimationFrame(frame);
        return;
      }
      count.textContent = n; count.classList.remove("pop"); void count.offsetWidth; count.classList.add("pop");
      chime(520); n--;
      countTimer = setTimeout(tick, 1000);
    };
    tick();
  }

  function stop() {
    running = false;
    clearTimeout(countTimer);
    cancelAnimationFrame(raf);
    count.textContent = "";
    try { speechSynthesis.cancel(); } catch {}
    keepAwake(false);
  }

  function finish() {
    stop();
    const k = dayKey();
    data.days[k] = (data.days[k] || 0) + 1;
    data.total += 1;
    save(data);
    chime(784); setTimeout(() => chime(1046), 180); buzz(120);
    say("수고하셨어요");
    $("doneToday").textContent = data.days[k];
    $("doneStreak").textContent = streak();
    $("doneMsg").textContent = data.days[k] > 1 ? `오늘 ${data.days[k]}번째 눈 휴식이에요.` : "눈이 한결 가벼워졌을 거예요.";
    $("doneTip").textContent = "💡 " + TIPS[data.total % TIPS.length];
    show("done");
  }

  // ── 이벤트 ──────────────────────────────────────
  $("introSkip").addEventListener("click", leaveIntro);
  $("intro").addEventListener("click", leaveIntro);
  $("startBtn").addEventListener("click", start);
  $("againBtn").addEventListener("click", start);
  $("homeBtn").addEventListener("click", () => { renderStats(); show("home"); });
  $("quitBtn").addEventListener("click", () => { stop(); renderStats(); show("home"); });
  $("pauseBtn").addEventListener("click", () => {
    if (!running) return;
    paused = !paused;
    $("pauseBtn").textContent = paused ? "계속하기" : "일시정지";
    eye.style.animationPlayState = paused ? "paused" : "";
    if (paused) try { speechSynthesis.cancel(); } catch {}
  });
  $("skipBtn").addEventListener("click", () => {
    if (!running) return;
    elapsed = Math.min(TOTAL, (Math.floor(elapsed / STEP) + 1) * STEP);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && running && !paused) $("pauseBtn").click();
    if (!document.hidden && running) keepAwake(true);
  });

  // 설정
  const dlg = $("settings");
  const opts = { optVoice: "voice", optSound: "sound", optVibe: "vibe" };
  $("settingsBtn").addEventListener("click", () => {
    Object.entries(opts).forEach(([id, k]) => { $(id).checked = !!data.opt[k]; });
    $("optSpeed").value = String(data.opt.speed);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  });
  dlg.addEventListener("change", () => {
    Object.entries(opts).forEach(([id, k]) => { data.opt[k] = $(id).checked; });
    data.opt.speed = Number($("optSpeed").value);
    save(data);
  });

  // 홈 화면 동작 목록
  $("planList").innerHTML = EXERCISES.map((e, i) =>
    `<li><span class="ico">${e.icon}</span><span class="nm">${e.name}</span><span class="sec">${i * STEP}–${(i + 1) * STEP}초</span></li>`
  ).join("");

  // 시작
  renderStats();
  playIntro();
  introTimer = setTimeout(leaveIntro, 3800);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
