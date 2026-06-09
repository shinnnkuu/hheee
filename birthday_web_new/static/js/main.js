// === VAULT PARTICLES ===
(function spawnParticles() {
  const container = document.getElementById("particles");
  if (!container) return;
  for (let i = 0; i < 60; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --dur: ${2 + Math.random() * 4}s;
      --delay: ${Math.random() * 5}s;
      width: ${1 + Math.random() * 3}px;
      height: ${1 + Math.random() * 3}px;
    `;
    container.appendChild(p);
  }
})();

document.getElementById("passwordInput")?.addEventListener("keydown", function(e) {
  if (e.key === "Enter") tryUnlock();
});

// === UNLOCK LOGIC ===
async function tryUnlock() {
  const input = document.getElementById("passwordInput");
  const btn = document.getElementById("unlockBtn");
  const errorMsg = document.getElementById("errorMsg");
  const dial = document.getElementById("dial");
  const vaultDoor = document.getElementById("vaultDoor");

  const password = input.value.trim();
  if (!password) { showError("Masukkan password dulu ya 😊"); return; }

  btn.disabled = true;
  btn.textContent = "...";
  errorMsg.textContent = "";

  dial.classList.add("stopped");
  vaultDoor.classList.add("spinning");
  setTimeout(() => vaultDoor.classList.remove("spinning"), 700);

  try {
    const res = await fetch("/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await res.json();

    if (data.success) {
      vaultDoor.classList.add("opened");
      setTimeout(() => {
        document.getElementById("vault-screen").style.display = "none";
        showBloomAnimation();
      }, 1100);
    } else {
      showError(data.error || "Password salah 💔");
      vaultDoor.classList.remove("spinning");
      dial.classList.remove("stopped");
      btn.disabled = false;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg> Buka`;
      input.value = "";
      input.focus();
    }
  } catch {
    showError("Terjadi kesalahan, coba lagi.");
    btn.disabled = false;
  }
}

function showError(msg) {
  const el = document.getElementById("errorMsg");
  el.textContent = msg;
  el.style.animation = "none";
  requestAnimationFrame(() => el.style.animation = "shake 0.3s ease");
}

// ========================
// PAGE NAVIGATION SYSTEM
// ========================
const TOTAL_PAGES = 5;
let currentPage = 0;
let isAnimating = false;
let touchStartX = 0;
let touchStartY = 0;

function buildPageDots() {
  const dots = document.getElementById("pageDots");
  dots.innerHTML = "";
  for (let i = 0; i < TOTAL_PAGES; i++) {
    const d = document.createElement("div");
    d.className = "page-dot" + (i === 0 ? " active" : "");
    d.onclick = () => goToPage(i);
    dots.appendChild(d);
  }
}

function updateDots() {
  document.querySelectorAll(".page-dot").forEach((d, i) => {
    d.classList.toggle("active", i === currentPage);
  });
}

function updateArrows() {
  const prev = document.getElementById("navPrev");
  const next = document.getElementById("navNext");
  if (prev) prev.disabled = currentPage === 0;
  if (next) next.disabled = currentPage === TOTAL_PAGES - 1;
}

function goToPage(idx) {
  if (isAnimating || idx === currentPage) return;
  if (idx < 0 || idx >= TOTAL_PAGES) return;
  isAnimating = true;
  currentPage = idx;

  const wrapper = document.getElementById("pagesWrapper");
  wrapper.style.transform = `translateX(-${currentPage * 100}vw)`;

  updateDots();
  updateArrows();
  onPageEnter(currentPage);

  setTimeout(() => { isAnimating = false; }, 700);
}

function changePage(dir) {
  goToPage(currentPage + dir);
}

function onPageEnter(page) {
  if (page === 2) {
    // Gallery — trigger visible animations
    setTimeout(() => {
      document.querySelectorAll(".gallery-item").forEach((el, i) => {
        setTimeout(() => el.classList.add("visible"), i * 80);
      });
    }, 200);
  }
  if (page === 3) {
    // Make a wish — init cake if not yet
    setTimeout(() => { if (!cakeInitialized) initCake(); }, 200);
  }
  if (page === 4) {
    // Blue flower — start animation
    setTimeout(startBlueFlowerAnimation, 200);
  }
}

// Touch/swipe support
function setupSwipe() {
  const wrapper = document.getElementById("birthday-screen");
  wrapper.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  wrapper.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      changePage(dx < 0 ? 1 : -1);
    }
  }, { passive: true });
}

// Keyboard arrow keys
document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight" || e.key === "ArrowDown") changePage(1);
  if (e.key === "ArrowLeft" || e.key === "ArrowUp") changePage(-1);
});

// === BIRTHDAY SCREEN ===
function showBirthdayScreen() {
  const screen = document.getElementById("birthday-screen");
  screen.classList.remove("hidden");
  spawnPetals();
  spawnHeroStars();
  setupLightbox();
  buildPageDots();
  updateArrows();
  setupSwipe();
  window.scrollTo(0, 0);
}

function spawnPetals() {
  const container = document.getElementById("petals-container");
  const emojis = ["🌸", "🌺", "🌹", "💮", "🌷", "✿", "❀"];
  let count = 0;
  function drop() {
    if (count > 80) return;
    const p = document.createElement("div");
    p.className = "petal";
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${12 + Math.random() * 18}px;
      animation-duration: ${4 + Math.random() * 5}s;
      animation-delay: ${Math.random() * 2}s;
    `;
    container.appendChild(p);
    count++;
    setTimeout(() => p.remove(), 9000);
    setTimeout(drop, 150 + Math.random() * 300);
  }
  drop();
  setTimeout(() => {
    setInterval(() => {
      const p = document.createElement("div");
      p.className = "petal";
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        font-size: ${10 + Math.random() * 14}px;
        animation-duration: ${5 + Math.random() * 6}s;
        animation-delay: 0s;
      `;
      container.appendChild(p);
      setTimeout(() => p.remove(), 12000);
    }, 800);
  }, 8000);
}

function spawnHeroStars() {
  const container = document.getElementById("heroStars");
  if (!container) return;
  const symbols = ["✦", "✧", "⋆", "★", "✩"];
  for (let i = 0; i < 40; i++) {
    const s = document.createElement("div");
    s.className = "hero-star";
    s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    s.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      font-size: ${8 + Math.random() * 12}px;
      animation-delay: ${Math.random() * 1.5}s;
      color: ${Math.random() > 0.5 ? "#F5C518" : "#c4476e"};
    `;
    container.appendChild(s);
  }
}

function setupLightbox() {
  document.querySelectorAll(".polaroid").forEach(polaroid => {
    polaroid.addEventListener("click", () => {
      const src = polaroid.dataset.src;
      const caption = polaroid.dataset.caption;
      const message = polaroid.dataset.message;
      document.getElementById("modalImg").src = src;
      document.getElementById("modalTitle").textContent = caption;
      document.getElementById("modalMessage").textContent = message;
      document.getElementById("photoModal").classList.add("open");
    });
    const tilt = (Math.random() - 0.5) * 8;
    polaroid.style.transform = `rotate(${tilt}deg)`;
  });
}

function closePhotoModal() {
  document.getElementById("photoModal").classList.remove("open");
}
document.addEventListener("keydown", e => { if (e.key === "Escape") closePhotoModal(); });

// === BLOOM FLOWER ANIMATION ===
function showBloomAnimation() {
  const overlay = document.getElementById("bloom-overlay");
  const canvas = document.getElementById("bloomCanvas");
  const bloomText = document.getElementById("bloomText");
  overlay.classList.remove("hidden");

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  const flowers = [];
  const COLORS = [
    ["#8B2252","#c4476e","#e8789a"],
    ["#c4476e","#f09aba","#ffd0e0"],
    ["#F5C518","#f0b800","#fff3a0"],
    ["#a02060","#d4608a","#ffb0cc"],
    ["#6b1540","#9b3565","#d4809a"],
  ];

  class Flower {
    constructor(x, y, delay, scale, colorSet) {
      this.x = x; this.y = y; this.delay = delay; this.scale = scale; this.colors = colorSet;
      this.progress = 0; this.petals = 5 + Math.floor(Math.random() * 3);
      this.rotation = Math.random() * Math.PI * 2; this.started = false; this.done = false;
      this.alpha = 0; this.fadeOut = false;
    }
    update(t) {
      if (t < this.delay) return;
      this.started = true;
      if (!this.fadeOut) { this.progress = Math.min(1, (t - this.delay) / 1800); this.alpha = Math.min(1, this.progress * 3); }
      else { this.alpha -= 0.008; if (this.alpha <= 0) this.done = true; }
    }
    draw(ctx) {
      if (!this.started || this.alpha <= 0) return;
      ctx.save(); ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y); ctx.rotate(this.rotation); ctx.scale(this.scale, this.scale);
      const p = this.progress; const petalLen = 40 * p; const petalW = 18 * p;
      for (let i = 0; i < this.petals; i++) {
        const angle = (i / this.petals) * Math.PI * 2;
        ctx.save(); ctx.rotate(angle);
        const grad = ctx.createRadialGradient(0, -petalLen * 0.4, 0, 0, -petalLen * 0.4, petalLen);
        grad.addColorStop(0, this.colors[1]); grad.addColorStop(1, this.colors[0] + "88");
        ctx.fillStyle = grad; ctx.beginPath();
        ctx.ellipse(0, -petalLen * 0.55, petalW * 0.5, petalLen * 0.55, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.restore();
      }
      for (let i = 0; i < this.petals; i++) {
        const angle = (i / this.petals) * Math.PI * 2 + Math.PI / this.petals;
        ctx.save(); ctx.rotate(angle); ctx.fillStyle = this.colors[2] + "cc"; ctx.beginPath();
        ctx.ellipse(0, -petalLen * 0.35, petalW * 0.3, petalLen * 0.35, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.restore();
      }
      const cGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 12 * p);
      cGrad.addColorStop(0, "#fff8c0"); cGrad.addColorStop(0.5, "#F5C518"); cGrad.addColorStop(1, "#c9a012");
      ctx.fillStyle = cGrad; ctx.beginPath(); ctx.arc(0, 0, 12 * p, 0, Math.PI * 2); ctx.fill();
      if (p > 0.7) {
        ctx.fillStyle = "#8B2252";
        for (let i = 0; i < 6; i++) {
          const da = (i / 6) * Math.PI * 2;
          ctx.beginPath(); ctx.arc(Math.cos(da) * 7, Math.sin(da) * 7, 1.5, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  const positions = [
    { x: cx, y: cy, delay: 0, scale: 1.6 }, { x: cx-120, y: cy+80, delay: 300, scale: 1.1 },
    { x: cx+130, y: cy+60, delay: 450, scale: 1.2 }, { x: cx-80, y: cy-130, delay: 550, scale: 1.0 },
    { x: cx+100, y: cy-120, delay: 650, scale: 0.9 }, { x: cx-220, y: cy-30, delay: 750, scale: 0.85 },
    { x: cx+230, y: cy-10, delay: 800, scale: 0.9 }, { x: cx+40, y: cy+200, delay: 900, scale: 0.8 },
    { x: cx-160, y: cy+200, delay: 950, scale: 0.75 }, { x: cx+180, y: cy+190, delay: 1000, scale: 0.7 },
    { x: cx-300, y: cy+150, delay: 1100, scale: 0.65 }, { x: cx+300, y: cy+130, delay: 1150, scale: 0.6 },
    { x: cx-250, y: cy-180, delay: 1200, scale: 0.65 }, { x: cx+260, y: cy-170, delay: 1250, scale: 0.6 },
    { x: cx, y: cy-260, delay: 1300, scale: 0.7 }, { x: cx, y: cy+300, delay: 1350, scale: 0.65 },
  ];
  positions.forEach((pos, i) => flowers.push(new Flower(pos.x, pos.y, pos.delay, pos.scale, COLORS[i % COLORS.length])));

  const sparkles = [];
  class Sparkle {
    constructor() { this.reset(); }
    reset() { this.x = cx + (Math.random()-0.5)*canvas.width*0.9; this.y = cy + (Math.random()-0.5)*canvas.height*0.9; this.size = 1+Math.random()*3; this.alpha = 0; this.maxAlpha = 0.4+Math.random()*0.5; this.speed = 0.02+Math.random()*0.03; this.growing = true; }
    update() { if (this.growing) { this.alpha+=this.speed; if(this.alpha>=this.maxAlpha) this.growing=false; } else { this.alpha-=this.speed*0.7; if(this.alpha<=0) this.reset(); } }
    draw(ctx) { ctx.save(); ctx.globalAlpha=this.alpha; ctx.fillStyle="#F5C518"; ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2); ctx.fill(); ctx.restore(); }
  }
  for (let i = 0; i < 40; i++) sparkles.push(new Sparkle());

  const startTime = performance.now();
  let fadeStarted = false;

  function animate(now) {
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(canvas.width, canvas.height) * 0.7);
    bgGrad.addColorStop(0, "#2a0a20"); bgGrad.addColorStop(1, "#0d0a1a");
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);
    sparkles.forEach(s => { s.update(); s.draw(ctx); });
    flowers.forEach(f => { f.update(elapsed); f.draw(ctx); });
    if (elapsed > 1500 && !bloomText.classList.contains("visible")) bloomText.classList.add("visible");
    if (elapsed > 4000 && !fadeStarted) {
      fadeStarted = true;
      flowers.forEach(f => { if (f.started) f.fadeOut = true; });
      bloomText.style.transition = "opacity 1.2s ease";
      bloomText.style.opacity = "0";
    }
    if (elapsed > 5500) { overlay.classList.add("hidden"); showBirthdayScreen(); return; }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

// =============================================
// MAKE A WISH — CANDLE + MIC BLOW DETECTION
// =============================================
let candleState = [];
let cakeAnimFrame = null;
let audioCtx = null, analyser = null, micStream = null;
let isListening = false;
let candlesBlown = 0;
let cakeInitialized = false;
const CANDLE_COUNT = 5;
const BLOW_THRESHOLD = 18;

function initCake() {
  if (cakeInitialized) return;
  cakeInitialized = true;
  const canvas = document.getElementById("cakeCanvas");
  if (!canvas) return;
  const W = canvas.width, H = canvas.height;
  const cakeTop = H * 0.30;
  const cakeLeft = W * 0.18;
  const cakeWidth = W * 0.64;
  const spacing = cakeWidth / (CANDLE_COUNT - 1);
  candleState = [];
  for (let i = 0; i < CANDLE_COUNT; i++) {
    candleState.push({ x: cakeLeft + i * spacing, y: cakeTop, lit: true, flickerOffset: Math.random() * Math.PI * 2, flickerSpeed: 0.08 + Math.random() * 0.06, extinguishing: false, extProgress: 0 });
  }
  drawCake();
}

function drawCake() {
  const canvas = document.getElementById("cakeCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const t = performance.now() / 1000;
  const cakeX = W * 0.12, cakeW = W * 0.76;
  const tier1Y = H * 0.38, tier1H = H * 0.34;
  const g1 = ctx.createLinearGradient(cakeX, tier1Y, cakeX, tier1Y + tier1H);
  g1.addColorStop(0, "#8B2252"); g1.addColorStop(0.5, "#a83060"); g1.addColorStop(1, "#5a1035");
  ctx.fillStyle = g1; ctx.beginPath(); ctx.roundRect(cakeX, tier1Y, cakeW, tier1H, [0,0,14,14]); ctx.fill();
  ctx.fillStyle = "#c4476e"; ctx.beginPath(); ctx.ellipse(cakeX+cakeW/2, tier1Y, cakeW/2, 14, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#ffd0e8";
  for (let i = 0; i < 7; i++) { const dx = cakeX+20+i*(cakeW-30)/6; const dh = 12+(i%3)*6; ctx.beginPath(); ctx.roundRect(dx-5, tier1Y-4, 10, dh, [0,0,5,5]); ctx.fill(); }
  ctx.fillStyle = "rgba(255,208,232,0.35)"; ctx.fillRect(cakeX, tier1Y+tier1H*0.42, cakeW, tier1H*0.18);
  const dotColors = ["#F5C518","#ff9dc6","#fff","#ffd0e8"];
  for (let i = 0; i < 12; i++) { ctx.fillStyle = dotColors[i%dotColors.length]; ctx.beginPath(); ctx.arc(cakeX+18+i*(cakeW-28)/11, tier1Y+tier1H*0.52, 4, 0, Math.PI*2); ctx.fill(); }
  const plateG = ctx.createLinearGradient(cakeX-10, tier1Y+tier1H, cakeX-10, tier1Y+tier1H+16);
  plateG.addColorStop(0, "#fffaf0"); plateG.addColorStop(1, "#e8d8c0");
  ctx.fillStyle = plateG; ctx.beginPath(); ctx.ellipse(cakeX+cakeW/2, tier1Y+tier1H+6, cakeW/2+14, 10, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = "#d4b890"; ctx.lineWidth = 1.5; ctx.stroke();
  const candleW = 12, candleH = 38;
  candleState.forEach((c, i) => {
    const cx = c.x, baseY = c.y, candleTop = baseY - candleH;
    const colors = [["#ff9dc6","#e06090"],["#ffe066","#c9a012"],["#9dc6ff","#5080c0"],["#c6ff9d","#60a030"],["#e09dff","#9040c0"]];
    const [cLight, cDark] = colors[i % colors.length];
    const cg = ctx.createLinearGradient(cx-candleW/2, candleTop, cx+candleW/2, candleTop);
    cg.addColorStop(0, cLight); cg.addColorStop(1, cDark);
    ctx.fillStyle = cg; ctx.beginPath(); ctx.roundRect(cx-candleW/2, candleTop, candleW, candleH, [3,3,0,0]); ctx.fill();
    ctx.strokeStyle = "#3a1a0a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, candleTop); ctx.lineTo(cx, candleTop-7); ctx.stroke();
    if (c.lit && !c.extinguishing) {
      const flicker = Math.sin(t * 8 + c.flickerOffset) * 4;
      const flicker2 = Math.cos(t * 6 + c.flickerOffset) * 2;
      const fh = 22 + flicker, fw = 9 + Math.abs(flicker2 * 0.4);
      const glow = ctx.createRadialGradient(cx+flicker2*0.3, candleTop-fh*0.5, 0, cx, candleTop-fh*0.3, fh*1.2);
      glow.addColorStop(0, "rgba(255,220,80,0.35)"); glow.addColorStop(1, "rgba(255,100,0,0)");
      ctx.fillStyle = glow; ctx.beginPath(); ctx.ellipse(cx+flicker2*0.3, candleTop-fh*0.4, fw*1.6, fh*1.2, 0, 0, Math.PI*2); ctx.fill();
      const fg = ctx.createLinearGradient(cx, candleTop-fh, cx, candleTop);
      fg.addColorStop(0, "#fff8c0"); fg.addColorStop(0.3, "#ffdd40"); fg.addColorStop(0.7, "#ff8820"); fg.addColorStop(1, "#cc3300");
      ctx.fillStyle = fg; ctx.beginPath();
      ctx.moveTo(cx+flicker2*0.5, candleTop-fh);
      ctx.bezierCurveTo(cx+fw+flicker*0.3, candleTop-fh*0.5, cx+fw*0.6, candleTop-2, cx, candleTop);
      ctx.bezierCurveTo(cx-fw*0.6, candleTop-2, cx-fw-flicker*0.3, candleTop-fh*0.5, cx+flicker2*0.5, candleTop-fh);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,240,0.85)"; ctx.beginPath(); ctx.ellipse(cx+flicker2*0.3, candleTop-fh*0.45, fw*0.3, fh*0.28, 0, 0, Math.PI*2); ctx.fill();
    } else if (c.extinguishing) {
      c.extProgress += 0.06;
      const scale = Math.max(0, 1 - c.extProgress);
      if (scale > 0) {
        ctx.save(); ctx.globalAlpha = scale; ctx.translate(cx, candleTop-10); ctx.scale(scale, scale); ctx.translate(-cx, -(candleTop-10));
        ctx.fillStyle = "#ffdd40"; ctx.beginPath(); ctx.ellipse(cx, candleTop-12, 4, 8, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
      }
      if (c.extProgress >= 1) {
        c.lit = false; c.extinguishing = false; candlesBlown++;
        if (candlesBlown >= CANDLE_COUNT) setTimeout(onAllCandlesBlown, 400);
      }
    } else {
      const smokeT = ((t * 0.8) % 1);
      ctx.save(); ctx.globalAlpha = (1 - smokeT) * 0.5; ctx.strokeStyle = "#d0c0d0"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, candleTop-6); ctx.bezierCurveTo(cx+6, candleTop-14, cx-5, candleTop-22, cx+3, candleTop-30-smokeT*20); ctx.stroke(); ctx.restore();
    }
  });
  cakeAnimFrame = requestAnimationFrame(drawCake);
}

async function startBlowDetection() {
  if (isListening) return;
  if (candleState.every(c => !c.lit && !c.extinguishing)) return;
  const btn = document.getElementById("micBtn");
  const hint = document.getElementById("micHint");
  const meterWrap = document.getElementById("micMeterWrap");
  const meterBar = document.getElementById("micMeterBar");
  const meterLabel = document.getElementById("micMeterLabel");
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(micStream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512; analyser.smoothingTimeConstant = 0.5;
    source.connect(analyser);
    isListening = true;
    btn.classList.add("listening");
    btn.querySelector(".mic-label").textContent = "Tiup Sekarang!";
    hint.textContent = "Mic aktif — tiup keras ke arah mic kamu! 💨";
    meterWrap.style.display = "block";
    const dataArray = new Uint8Array(analyser.fftSize);
    let blowFrames = 0;
    function detectBlow() {
      if (!isListening) return;
      analyser.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) { const v = (dataArray[i]-128)/128; sum += v*v; }
      const vol = Math.min(100, Math.round(Math.sqrt(sum/dataArray.length)*300));
      meterBar.style.width = vol + "%";
      if (vol > BLOW_THRESHOLD) {
        blowFrames++;
        meterLabel.textContent = "Terus tiup! 💨💨💨";
        meterBar.style.background = "linear-gradient(to right, #F5C518, #ff6090)";
        if (blowFrames >= 3) { blowFrames = 0; blowOutCandle(); }
      } else {
        blowFrames = 0;
        meterBar.style.background = "linear-gradient(to right, #8B2252, #F5C518)";
        meterLabel.textContent = vol < 5 ? "Mic siap — tiup sekarang!" : "Tiup lebih keras… 💨";
      }
      requestAnimationFrame(detectBlow);
    }
    detectBlow();
  } catch {
    document.getElementById("micHint").textContent = "Tidak bisa akses mic. Pastikan kamu izinkan akses mic. 🎤";
    btn.classList.remove("listening");
  }
}

function blowOutCandle() {
  const next = candleState.find(c => c.lit && !c.extinguishing);
  if (!next) { stopMic(); return; }
  next.extinguishing = true;
  spawnBlowPuff(next.x, next.y - 38);
}

function spawnBlowPuff(x, y) {
  const container = document.getElementById("smokewrap") || document.body;
  for (let i = 0; i < 5; i++) {
    const p = document.createElement("span");
    p.textContent = ["💨","✨","⭐","💫"][Math.floor(Math.random()*4)];
    p.style.cssText = `position:absolute;left:${x+(Math.random()-.5)*40}px;top:${y+(Math.random()-.5)*20}px;font-size:${14+Math.random()*10}px;pointer-events:none;animation:puffUp 0.9s ease forwards;z-index:5;`;
    container.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

function stopMic() {
  isListening = false;
  if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
  if (audioCtx) { audioCtx.close(); audioCtx = null; }
}

function onAllCandlesBlown() {
  stopMic();
  document.getElementById("micArea").style.display = "none";
  document.getElementById("wishGranted").style.display = "block";
  spawnWishPetals();
}

function spawnWishPetals() {
  const container = document.getElementById("petals-container");
  const emojis = ["⭐","🌟","✨","💖","🌸","💫","🎉","🎊"];
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const p = document.createElement("div");
      p.className = "petal";
      p.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      p.style.cssText = `left:${Math.random()*100}%;font-size:${14+Math.random()*20}px;animation-duration:${3+Math.random()*4}s;animation-delay:0s;`;
      container.appendChild(p);
      setTimeout(() => p.remove(), 8000);
    }, i * 80);
  }
}

// === BLUE FLOWER CLOSING PAGE ===
let blueFlowerStarted = false;
function startBlueFlowerAnimation() {
  if (blueFlowerStarted) return;
  blueFlowerStarted = true;

  const canvas = document.getElementById("blueFlowerCanvas");
  if (!canvas) return;
  canvas.width = canvas.offsetWidth || window.innerWidth;
  canvas.height = canvas.offsetHeight || window.innerHeight;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;

  // Blue color palette
  const BLUE_COLORS = [
    ["#1a5fff","#4a9eff","#b0d8ff"],
    ["#0a3acc","#3a7aee","#90c8ff"],
    ["#2266ee","#66aaff","#cce8ff"],
    ["#0a2a88","#1a6aff","#88ccff"],
    ["#1144cc","#4488ff","#aaddff"],
  ];

  class BlueFlower {
    constructor(x, y, delay, scale, colorSet) {
      this.x = x; this.y = y; this.delay = delay; this.scale = scale; this.colors = colorSet;
      this.progress = 0; this.petals = 6 + Math.floor(Math.random() * 4);
      this.rotation = Math.random() * Math.PI * 2;
      this.started = false; this.alpha = 0;
    }
    update(t) {
      if (t < this.delay) return;
      this.started = true;
      this.progress = Math.min(1, (t - this.delay) / 2200);
      this.alpha = Math.min(1, this.progress * 2.5);
    }
    draw(ctx) {
      if (!this.started || this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(this.scale, this.scale);

      const p = this.progress;
      const petalLen = 48 * p;
      const petalW = 20 * p;

      // Draw petals — blue shades
      for (let i = 0; i < this.petals; i++) {
        const angle = (i / this.petals) * Math.PI * 2;
        ctx.save();
        ctx.rotate(angle);
        const grad = ctx.createRadialGradient(0, -petalLen * 0.4, 0, 0, -petalLen * 0.5, petalLen);
        grad.addColorStop(0, this.colors[2]);
        grad.addColorStop(0.5, this.colors[1]);
        grad.addColorStop(1, this.colors[0] + "99");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, -petalLen * 0.55, petalW * 0.5, petalLen * 0.58, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Inner ring
      for (let i = 0; i < this.petals; i++) {
        const angle = (i / this.petals) * Math.PI * 2 + Math.PI / this.petals;
        ctx.save();
        ctx.rotate(angle);
        ctx.fillStyle = this.colors[2] + "bb";
        ctx.beginPath();
        ctx.ellipse(0, -petalLen * 0.32, petalW * 0.28, petalLen * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Center glow
      const cGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 14 * p);
      cGrad.addColorStop(0, "#ffffff");
      cGrad.addColorStop(0.4, "#c0e8ff");
      cGrad.addColorStop(1, "#4a9eff");
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 14 * p, 0, Math.PI * 2);
      ctx.fill();

      // Center stamen dots
      if (p > 0.6) {
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 8; i++) {
          const da = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(Math.cos(da) * 8, Math.sin(da) * 8, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  // Blue sparkles
  class BlueSparkle {
    constructor() { this.reset(); }
    reset() {
      this.x = cx + (Math.random() - 0.5) * W * 0.9;
      this.y = cy + (Math.random() - 0.5) * H * 0.9;
      this.size = 1 + Math.random() * 2.5;
      this.alpha = 0; this.maxAlpha = 0.5 + Math.random() * 0.5;
      this.speed = 0.015 + Math.random() * 0.025;
      this.growing = true;
    }
    update() {
      if (this.growing) { this.alpha += this.speed; if (this.alpha >= this.maxAlpha) this.growing = false; }
      else { this.alpha -= this.speed * 0.6; if (this.alpha <= 0) this.reset(); }
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = "#7ec8ff";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const flowers = [];
  const sparkles = [];
  for (let i = 0; i < 50; i++) sparkles.push(new BlueSparkle());

  // Flower positions — center blooms first
  const fpositions = [
    { x: cx, y: cy, delay: 0, scale: 1.8 },
    { x: cx-130, y: cy+70, delay: 400, scale: 1.2 },
    { x: cx+140, y: cy+50, delay: 550, scale: 1.25 },
    { x: cx-70, y: cy-140, delay: 650, scale: 1.05 },
    { x: cx+90, y: cy-130, delay: 750, scale: 0.95 },
    { x: cx-240, y: cy-20, delay: 850, scale: 0.85 },
    { x: cx+250, y: cy-10, delay: 900, scale: 0.9 },
    { x: cx+30, y: cy+220, delay: 1000, scale: 0.85 },
    { x: cx-170, y: cy+210, delay: 1050, scale: 0.75 },
    { x: cx+190, y: cy+200, delay: 1100, scale: 0.7 },
    { x: cx-320, y: cy+140, delay: 1200, scale: 0.65 },
    { x: cx+320, y: cy+120, delay: 1250, scale: 0.6 },
    { x: cx-270, y: cy-190, delay: 1300, scale: 0.65 },
    { x: cx+280, y: cy-175, delay: 1350, scale: 0.6 },
    { x: cx, y: cy-280, delay: 1400, scale: 0.7 },
  ];

  fpositions.forEach((pos, i) => {
    flowers.push(new BlueFlower(pos.x, pos.y, pos.delay, pos.scale, BLUE_COLORS[i % BLUE_COLORS.length]));
  });

  const startTime = performance.now();

  function animateBlue(now) {
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, W, H);

    // Deep blue background gradient
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
    bgGrad.addColorStop(0, "#040e2a");
    bgGrad.addColorStop(0.5, "#020a1e");
    bgGrad.addColorStop(1, "#010510");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Soft blue ambient glow at center
    if (elapsed > 200) {
      const glowProgress = Math.min(1, (elapsed - 200) / 2000);
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300 * glowProgress);
      glowGrad.addColorStop(0, `rgba(30, 100, 255, ${0.18 * glowProgress})`);
      glowGrad.addColorStop(1, "rgba(30, 100, 255, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, W, H);
    }

    sparkles.forEach(s => { s.update(); s.draw(ctx); });
    flowers.forEach(f => { f.update(elapsed); f.draw(ctx); });

    // Show text after 2s
    const textEl = document.getElementById("blueFlowerText");
    if (textEl && elapsed > 2000) {
      const textProgress = Math.min(1, (elapsed - 2000) / 800);
      textEl.style.opacity = textProgress;
    }

    requestAnimationFrame(animateBlue);
  }

  // Init text opacity
  const textEl = document.getElementById("blueFlowerText");
  if (textEl) textEl.style.opacity = "0";

  requestAnimationFrame(animateBlue);
}

// Puff keyframe
const style = document.createElement("style");
style.textContent = `
  @keyframes puffUp {
    0%   { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-50px) scale(0.5); }
  }
  #smokewrap { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
`;
document.head.appendChild(style);
