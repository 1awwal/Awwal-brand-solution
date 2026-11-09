// Awwal Courses — progress tracking, track filter, video embeds and certificate.
(() => {
  const KEY = "awwal-course-video-editing";
  const COURSE = "Professional Video Editing";
  const TRACKS = {
    all: "Final Cut Pro & DaVinci Resolve",
    fcp: "Final Cut Pro track",
    resolve: "DaVinci Resolve track",
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  let state = { done: {}, track: "all", cert: null };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && typeof saved === "object") state = { ...state, ...saved, done: saved.done || {} };
  } catch (_) {}
  if (!TRACKS[state.track]) state.track = "all";
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} };

  const lessons = $$(".lesson");
  const boxes = $$("input[data-lesson]");
  const fill = $("#progress-fill"), text = $("#progress-text"), bar = $(".progress-track");
  const lock = $("#cert-lock"), remaining = $("#cert-remaining"), form = $("#cert-form");
  const output = $("#cert-output"), canvas = $("#cert-canvas"), nameInput = $("#cert-name");

  const inTrack = (el) => {
    const t = el.dataset.track;
    return state.track === "all" || t === "both" || t === state.track;
  };
  const required = () => boxes.filter((b) => { const l = b.closest(".lesson"); return !l || inTrack(l); });

  function render() {
    $$("[data-track-btn]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.trackBtn === state.track)));
    lessons.forEach((l) => { l.hidden = !inTrack(l); });
    boxes.forEach((b) => {
      b.checked = !!state.done[b.dataset.lesson];
      b.closest(".lesson")?.classList.toggle("is-done", b.checked);
    });
    $$(".module").forEach((m) => {
      const visible = $$(".lesson", m).filter((l) => !l.hidden);
      const done = visible.filter((l) => l.classList.contains("is-done")).length;
      m.hidden = visible.length === 0;
      m.classList.toggle("is-done", visible.length > 0 && done === visible.length);
      const c = $("[data-module-count]", m);
      if (c) c.textContent = `${done}/${visible.length} lessons`;
    });
    const req = required(), total = req.length, done = req.filter((b) => b.checked).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    fill.style.width = pct + "%";
    bar.setAttribute("aria-valuenow", String(pct));
    text.textContent = `${done} of ${total} complete · ${pct}%`;
    const complete = total > 0 && done === total;
    lock.hidden = complete;
    form.hidden = !complete;
    if (!complete) {
      output.hidden = true;
      remaining.textContent = `${total - done} to go`;
    } else if (state.cert && state.cert.track === state.track) {
      nameInput.value = state.cert.name;
      draw(state.cert);
    } else {
      output.hidden = true;
    }
  }

  boxes.forEach((b) => b.addEventListener("change", () => {
    if (b.checked) state.done[b.dataset.lesson] = 1; else delete state.done[b.dataset.lesson];
    save(); render();
  }));
  $$("[data-track-btn]").forEach((b) => b.addEventListener("click", () => {
    state.track = b.dataset.trackBtn; save(); render();
  }));

  // Click-to-load YouTube embeds (privacy-enhanced mode, nothing loads until asked).
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button.yt");
    if (!btn) return;
    const id = btn.dataset.yt;
    if (!/^[\w-]{11}$/.test(id)) return;
    const frame = document.createElement("iframe");
    frame.className = "yt-frame";
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    frame.title = btn.getAttribute("aria-label") || "YouTube video";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    btn.replaceWith(frame);
  });

  // ---------- certificate ----------
  const loadImage = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  const logoReady = loadImage("assets/awwal-mark-white.png");

  function fitText(ctx, str, maxWidth, size, weight, family) {
    do { ctx.font = `${weight} ${size}px ${family}`; size -= 4; } while (ctx.measureText(str).width > maxWidth && size > 40);
  }
  function spaced(ctx, str, x, y, spacing) {
    const chars = [...str];
    const width = chars.reduce((w, c) => w + ctx.measureText(c).width + spacing, -spacing);
    let cx = x - width / 2;
    ctx.textAlign = "left";
    chars.forEach((c) => { ctx.fillText(c, cx, y); cx += ctx.measureText(c).width + spacing; });
    ctx.textAlign = "center";
  }

  async function draw(cert) {
    const W = canvas.width, H = canvas.height, ctx = canvas.getContext("2d");
    const SANS = "Poppins, Arial, sans-serif", MONO = "'DM Mono', monospace";
    try { await Promise.all([document.fonts.load(`800 100px Poppins`), document.fonts.load(`500 30px 'DM Mono'`), document.fonts.load("600 40px Poppins")]); } catch (_) {}
    const logo = await logoReady;
    const NAVY = "#0A192F", AMBER = "#FFB703", ORANGE = "#FF6D12";

    ctx.fillStyle = NAVY; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W * 0.82, H * 0.16, 0, W * 0.82, H * 0.16, W * 0.6);
    glow.addColorStop(0, "rgba(51,84,225,.34)"); glow.addColorStop(1, "rgba(51,84,225,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    // rings
    ctx.strokeStyle = "rgba(255,183,3,.16)"; ctx.lineWidth = 2;
    [520, 400, 280].forEach((r) => { ctx.beginPath(); ctx.arc(W - 150, H - 110, r, 0, Math.PI * 2); ctx.stroke(); });
    // frame
    ctx.strokeStyle = AMBER; ctx.lineWidth = 8; ctx.strokeRect(56, 56, W - 112, H - 112);
    ctx.strokeStyle = "rgba(255,255,255,.28)"; ctx.lineWidth = 2; ctx.strokeRect(84, 84, W - 168, H - 168);

    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    if (logo) { const lh = 104, lw = logo.width * (lh / logo.height); ctx.drawImage(logo, (W - lw) / 2, 150, lw, lh); }
    ctx.fillStyle = "#fff"; ctx.font = `700 46px ${SANS}`; ctx.fillText("Awwal Brands", W / 2, 318);

    ctx.fillStyle = AMBER; ctx.font = `500 34px ${MONO}`; spaced(ctx, "CERTIFICATE OF COMPLETION", W / 2, 420, 14);
    ctx.fillStyle = "rgba(255,255,255,.78)"; ctx.font = `400 36px ${SANS}`; ctx.fillText("This certifies that", W / 2, 520);

    ctx.fillStyle = "#fff"; fitText(ctx, cert.name, W - 420, 132, 800, SANS); ctx.fillText(cert.name, W / 2, 680);
    const grad = ctx.createLinearGradient(W / 2 - 260, 0, W / 2 + 260, 0); grad.addColorStop(0, AMBER); grad.addColorStop(1, ORANGE);
    ctx.fillStyle = grad; ctx.fillRect(W / 2 - 260, 730, 520, 6);

    ctx.fillStyle = "rgba(255,255,255,.78)"; ctx.font = `400 36px ${SANS}`; ctx.fillText("has successfully completed the self-paced course", W / 2, 830);
    ctx.fillStyle = "#fff"; ctx.font = `700 72px ${SANS}`; ctx.fillText(COURSE, W / 2, 930);
    ctx.fillStyle = AMBER; ctx.font = `600 42px ${SANS}`; ctx.fillText(TRACKS[cert.track], W / 2, 1000);

    // footer row
    const y = 1190, cols = [[W * 0.24, "DATE", cert.date], [W * 0.5, "CERTIFICATE ID", cert.id], [W * 0.76, "ISSUED BY", "Awwal Brands"]];
    cols.forEach(([x, label, value]) => {
      ctx.fillStyle = "rgba(255,255,255,.3)"; ctx.fillRect(x - 190, y - 62, 380, 2);
      ctx.fillStyle = "#fff"; ctx.font = `600 34px ${SANS}`; ctx.fillText(value, x, y - 84);
      ctx.fillStyle = "rgba(255,255,255,.62)"; ctx.font = `500 22px ${MONO}`; spaced(ctx, label, x, y - 18, 5);
    });
    ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.font = `400 22px ${MONO}`;
    ctx.fillText("awwalbrands.com/video-editing-course  ·  Certificate of completion for a self-paced course", W / 2, 1272);

    output.hidden = false;
    try { $("#cert-download").href = canvas.toDataURL("image/png"); } catch (_) {}
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.replace(/\s+/g, " ").trim();
    if (!name) { nameInput.focus(); return; }
    const now = new Date();
    const same = state.cert && state.cert.track === state.track;
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    state.cert = {
      name,
      track: state.track,
      date: same ? state.cert.date : now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      id: same ? state.cert.id : `AWB-VE-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    };
    save();
    draw(state.cert).then(() => output.scrollIntoView({ behavior: "smooth", block: "center" }));
  });

  $("#cert-print").addEventListener("click", () => {
    document.body.classList.add("printing-cert");
    const done = () => { document.body.classList.remove("printing-cert"); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    window.print();
  });

  // Open the module a deep link points into.
  const openHash = () => {
    const target = location.hash && document.getElementById(location.hash.slice(1));
    const mod = target && target.closest("details.module");
    if (mod) mod.open = true;
  };
  window.addEventListener("hashchange", openHash); openHash();
  $$(".toc-list a, .course-cta a").forEach((a) => a.addEventListener("click", () => {
    const t = document.getElementById(a.getAttribute("href").slice(1));
    if (t && t.tagName === "DETAILS") t.open = true;
  }));

  const nav = $(".nav-wrap");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 30);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  render();
})();
