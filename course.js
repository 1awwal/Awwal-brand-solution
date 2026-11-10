// Awwal Courses — progress, levels, track filter, video embeds and level certificates.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const main = $(".course-page[data-course-key]");

  const nav = $(".nav-wrap");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 30);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  if (!main) return;

  const KEY = "awwal-course-" + main.dataset.courseKey;
  const COURSE = main.dataset.courseName;
  const CODE = main.dataset.courseCode;
  const LEVEL_LABEL = { 1: "Beginner level", 2: "Intermediate level", 3: "Professional level" };
  const TRACKS = { all: "", general: "General editing", fcp: "FCP", premiere: "Premiere Pro", resolve: "DaVinci Resolve" };
  const hasTracks = !!$("[data-track-btn]");
  const isVideo = main.dataset.courseKey === "video-editing";

  let state = { done: {}, track: "all", certs: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && typeof saved === "object") state = { ...state, ...saved, done: saved.done || {}, certs: saved.certs || {} };
  } catch (_) {}
  if (!hasTracks || !(state.track in TRACKS)) state.track = "all";
  if (isVideo && state.track === "all") state.track = "general";
  const store = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} };
  // Every change is stamped, saved on this device, and (when signed in) pushed to the learner's account.
  const save = () => { state.updatedAt = Date.now(); store(); queuePush(); };

  const account = window.AwwalAccount || null;
  let pushTimer = 0;
  let snapshot = { done: 0, total: 0, level: 0 };
  function queuePush() {
    if (isVideo) return; // Module quiz passes are persisted in D1 by the assessment endpoint.
    if (!account || !account.user) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
      account.saveProgress(main.dataset.courseKey, {
        track: state.track, done: state.done, certs: state.certs,
        done_count: snapshot.done, total_count: snapshot.total, level_earned: snapshot.level,
      });
    }, 700);
  }
  async function pullFromAccount() {
    if (!account) return;
    await account.ready;
    if (!account.user) return;
    if (isVideo) {
      // Video assessment passes belong to the signed-in learner and come only from the server.
      await loadAssessments();
      return;
    }
    const row = await account.loadProgress(main.dataset.courseKey);
    const firstTime = state.syncedUser !== account.user.id;
    if (row) {
      const remoteTime = Date.parse(row.updated_at) || 0;
      if (firstTime) {
        // First sign-in on this device: keep everything from both sides.
        state.done = { ...row.done, ...state.done };
        state.certs = { ...row.certs, ...state.certs };
        if (hasTracks && state.track === "all" && row.track in TRACKS) state.track = row.track;
      } else if (remoteTime > (state.updatedAt || 0)) {
        state.done = row.done || {}; state.certs = row.certs || {};
        if (hasTracks && row.track in TRACKS) state.track = row.track;
      }
    }
    state.syncedUser = account.user.id;
    store(); render(); queuePush();
  }

  const levels = $$(".level");
  const lessons = $$(".lesson");
  const boxes = $$("input[data-lesson]");
  const fill = $("#progress-fill"), text = $("#progress-text"), bar = $(".progress-track");
  const form = $("#cert-form"), output = $("#cert-output"), canvas = $("#cert-canvas"), nameInput = $("#cert-name");
  let certificateName = (nameInput?.value || nameInput?.textContent || "").trim();
  let earned = 0;
  let assessmentData = null;
  let certificateLevel = 0;
  let assessmentRequest = null;
  const certMessage = document.createElement("p");
  certMessage.setAttribute("role", "status");
  form.after(certMessage);

  async function assessmentApi(input) {
    const options = input ? {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    } : { cache: "no-store" };
    let response = await fetch("/api/course-assessments", options);
    if (response.status === 401 && account?.refreshCourseSession && await account.refreshCourseSession()) {
      response = await fetch("/api/course-assessments", options);
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load course assessments. Please try again.");
    return data;
  }
  async function loadAssessments() {
    if (assessmentRequest) return assessmentRequest;
    assessmentRequest = (async () => {
      try {
        assessmentData = await assessmentApi();
        certificateName = assessmentData.name;
        nameInput.textContent = certificateName;
        state.done = assessmentData.done;
        certMessage.textContent = "";
        render(); queuePush();
      } catch (error) {
        certMessage.textContent = error.message;
        $("#quiz-load-status").textContent = error.message;
      } finally { assessmentRequest = null; }
    })();
    return assessmentRequest;
  }

  function renderQuizzes() {
    if (!isVideo) return;
    const status = $("#quiz-load-status");
    if (!assessmentData) { status.textContent = "Loading your module quizzes…"; return; }
    status.textContent = "Pass each module quiz with at least 80%. You can review the lessons and retry. Earlier manual completion ticks need a quiz pass.";
    $("#track-section-title").textContent = state.track === "general" ? "General editing · shared by every software track" : TRACKS[state.track] + " · software modules";
    $("#track-section-description").textContent = state.track === "general" ? "Complete these shared lessons, then continue with FCP, Premiere Pro or DaVinci Resolve. General passes count towards every track." : "These lessons and quizzes belong to " + TRACKS[state.track] + ". Complete the general modules as well to earn your certificate.";
    for (const a of assessmentData.assessments) {
      let quiz = document.getElementById("quiz-" + a.id);
      if (!quiz) {
        quiz = document.createElement("form"); quiz.id = "quiz-" + a.id; quiz.className = "module-quiz";
        const heading = document.createElement("h4"); heading.textContent = a.label + " · Module quiz";
        const intro = document.createElement("p"); intro.textContent = "Answer all three questions. Pass mark: 80% (all 3 correct). Your module passes automatically when you pass this quiz.";
        quiz.append(heading, intro);
        a.questions.forEach((q, i) => {
          const field = document.createElement("fieldset"), legend = document.createElement("legend");
          legend.textContent = `${i + 1}. ${q.prompt}`; field.append(legend);
          q.options.forEach((option, j) => {
            const label = document.createElement("label"), radio = document.createElement("input"), span = document.createElement("span");
            radio.type = "radio"; radio.name = "q" + i; radio.value = option; radio.required = true;
            radio.id = `answer-${a.id}-${i}-${j}`; span.textContent = option;
            label.append(radio, span); field.append(label);
          });
          quiz.append(field);
        });
        const button = document.createElement("button"); button.type = "submit"; button.className = "button button-amber"; button.textContent = "Submit module quiz";
        const message = document.createElement("p"); message.className = "quiz-result"; message.setAttribute("role", "status");
        quiz.append(button, message);
        quiz.addEventListener("submit", async event => {
          event.preventDefault(); button.disabled = true; message.textContent = "Checking your answers…";
          try {
            const answers = a.questions.map((_, i) => $("input[name='q" + i + "']:checked", quiz)?.value);
            const data = await assessmentApi({ id: a.id, answers });
            assessmentData = data; state.done = data.done;
            output.hidden = true;
            render(); save();
            message.textContent = data.result.passed ? `Passed · ${data.result.score}%. Module completed.`
              : `${data.result.score}% · You need 80%. Review the lessons and retry. Review: ${data.result.review.join(" ")}`;
          } catch (error) { message.textContent = error.message; }
          finally { button.disabled = !!assessmentData?.scores[a.id]?.passed; }
        });
        document.getElementById(a.module).append(quiz);
      }
      quiz.hidden = a.track !== state.track;
      const passed = !!assessmentData.scores[a.id]?.passed;
      quiz.classList.toggle("is-passed", passed);
      $("button[type='submit']", quiz).disabled = passed;
      if (passed) $(".quiz-result", quiz).textContent = `Passed · ${assessmentData.scores[a.id].score}%. Module completed.`;
    }
    $$("[data-track-progress]").forEach(node => {
      const required = assessmentData.assessments.filter(a => a.track === node.dataset.trackProgress);
      const passed = required.filter(a => assessmentData.scores[a.id]?.passed).length;
      node.textContent = `${passed}/${required.length} modules passed`;
    });
    const select = $("#cert-level-select");
    const levels = assessmentData.eligible;
    const previous = Number(select.value) || certificateLevel;
    select.replaceChildren(...levels.map(e => {
      const option = document.createElement("option"); option.value = e.level;
      option.textContent = LEVEL_LABEL[e.level] + " · " + e.tracks.map(t => TRACKS[t]).join(" + "); return option;
    }));
    certificateLevel = levels.some(e => e.level === previous) ? previous : levels.at(-1)?.level || 0;
    select.value = String(certificateLevel);
  }

  const inTrack = (el) => {
    const t = el.dataset.track;
    if (isVideo) return state.track === "general" ? t === "both" : t === state.track;
    return state.track === "all" || t === "both" || t === state.track;
  };
  const counts = (root) => {
    const req = $$("input[data-lesson]", root).filter((b) => { const l = b.closest(".lesson"); return !l || inTrack(l); });
    return { total: req.length, done: req.filter((b) => b.checked).length };
  };

  function render() {
    if (isVideo) {
      state.done = assessmentData?.done || {};
      renderQuizzes();
    }
    $$("[data-track-btn]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.trackBtn === state.track)));
    lessons.forEach((l) => { l.hidden = !inTrack(l); });
    boxes.forEach((b) => {
      b.checked = !!state.done[b.dataset.lesson];
      const l = b.closest(".lesson");
      if (l) l.classList.toggle("is-done", b.checked);
    });
    $$(".module").forEach((m) => {
      const visible = $$(".lesson", m).filter((l) => !l.hidden);
      const done = visible.filter((l) => l.classList.contains("is-done")).length;
      m.hidden = visible.length === 0;
      m.classList.toggle("is-done", visible.length > 0 && done === visible.length);
      const c = $("[data-module-count]", m);
      if (c) c.textContent = `${done}/${visible.length} sessions`;
    });

    earned = 0; let chain = true;
    levels.forEach((lv) => {
      const n = Number(lv.dataset.level), c = counts(lv);
      const complete = c.total > 0 && c.done === c.total;
      const status = $("[data-level-status]", lv);
      if (status) status.textContent = (c.total ? Math.round((c.done / c.total) * 100) : 0) + "%";
      lv.classList.toggle("is-done", complete);
      const count = $("[data-level-count]", lv);
      if (count) count.textContent = String($$(".lesson", lv).filter((l) => !l.hidden).length);
      chain = chain && complete;
      if (chain) earned = n;
      const row = $(`[data-cert-level="${n}"]`);
      if (row) {
        if (isVideo) {
          const e = assessmentData?.eligible.find(e => e.level === n);
          row.classList.toggle("is-unlocked", !!e);
          $(".cert-level-state", row).textContent = e ? e.tracks.map(t => TRACKS[t]).join(" + ") + " · Unlocked ✓" : "Pass general modules + a software track";
          return;
        }
        row.classList.toggle("is-unlocked", chain);
        $(".cert-level-state", row).textContent = chain ? "Unlocked ✓" : complete ? "Finish the earlier levels" : `${c.total - c.done} to go`;
      }
    });
    if (isVideo) earned = assessmentData?.eligible.at(-1)?.level || 0;

    const all = counts(main), pct = all.total ? Math.round((all.done / all.total) * 100) : 0;
    snapshot = { done: all.done, total: all.total, level: earned };
    fill.style.width = pct + "%";
    bar.setAttribute("aria-valuenow", String(pct));
    text.textContent = `${all.done} of ${all.total} complete · ${pct}%`;

    form.hidden = earned === 0 || !certificateName;
    if (form.hidden) { output.hidden = true; return; }
    $("#cert-button-text").textContent = `Generate ${LEVEL_LABEL[earned].replace(" level", "")} certificate`;
    if (isVideo) { $("#cert-button-text").textContent = "Generate certificate"; return; }
    const cert = state.certs[earned];
    if (cert && cert.track === state.track) draw(cert);
    else output.hidden = true;
  }

  boxes.forEach((b) => {
    if (isVideo) {
      b.disabled = true;
      const label = b.closest("label");
      if (label) label.hidden = true;
      return;
    }
    b.addEventListener("change", () => {
    if (b.checked) state.done[b.dataset.lesson] = 1; else delete state.done[b.dataset.lesson];
    save(); render();
    });
  });
  function selectTrack(track) {
    state.track = track;
    save();
    render();
  }
  $$("[data-track-btn]").forEach((button) => button.addEventListener("click", () => selectTrack(button.dataset.trackBtn)));
  $$("[data-study-track]").forEach((link) => link.addEventListener("click", () => selectTrack(link.dataset.studyTrack)));
  if (isVideo) $("#cert-level-select").addEventListener("change", event => { certificateLevel = Number(event.target.value); output.hidden = true; });
  if (isVideo) $("#quiz-retry-load").addEventListener("click", () => loadAssessments());

  // Click-to-load YouTube embeds (privacy-enhanced mode; nothing loads until asked).
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
  const loadImage = (src) => new Promise((res) => {
    const i = new Image(), timer = setTimeout(() => res(null), 8000);
    i.onload = () => { clearTimeout(timer); res(i); };
    i.onerror = () => { clearTimeout(timer); res(null); }; i.src = src;
  });
  const logoReady = loadImage("assets/awwal-mark-white.png");
  const markReady = loadImage("assets/awwal-mark-navy.png");

  function fitText(ctx, str, maxWidth, size, weight, family) {
    do { ctx.font = `${weight} ${size}px ${family}`; size -= 4; } while (ctx.measureText(str).width > maxWidth && size > 36);
  }
  function spaced(ctx, str, x, y, spacing) {
    const chars = [...str];
    const width = chars.reduce((w, c) => w + ctx.measureText(c).width + spacing, -spacing);
    let cx = x - width / 2;
    ctx.textAlign = "left";
    chars.forEach((c) => { ctx.fillText(c, cx, y); cx += ctx.measureText(c).width + spacing; });
    ctx.textAlign = "center";
  }

  function spacedLeft(ctx, str, x, y, spacing) {
    ctx.textAlign = "left";
    [...str].forEach((c) => { ctx.fillText(c, x, y); x += ctx.measureText(c).width + spacing; });
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  // Certificate artwork follows the Awwal Brands letterhead: royal blue ground, white swoosh,
  // hairline rounded frame with an italic label, a postage-stamp seal and a contact footer.
  async function draw(cert) {
    const W = canvas.width, H = canvas.height, ctx = canvas.getContext("2d");
    const SANS = "Poppins, Arial, sans-serif", MONO = "'DM Mono', monospace", SERIF = "'Playfair Display', Georgia, serif";
    try {
      await Promise.race([Promise.all([document.fonts.load("800 100px Poppins"), document.fonts.load("700 40px Poppins"), document.fonts.load("600 40px Poppins"), document.fonts.load("500 40px Poppins"), document.fonts.load("400 40px Poppins"), document.fonts.load("500 30px 'DM Mono'"),
        document.fonts.load("italic 500 44px 'Playfair Display'")]), new Promise(resolve => setTimeout(resolve, 5000))]);
    } catch (_) {}
    const [logo, mark] = await Promise.all([logoReady, markReady]);
    const BLUE = "#000080", AMBER = "#FFB703", CREAM = "#ECE6DF";

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = BLUE; ctx.fillRect(0, 0, W, H);
    // soft glows
    [[-40, 640, 460, "rgba(138,104,170,.42)"], [1480, 1400, 560, "rgba(170,120,165,.42)"]].forEach(([x, y, r, c]) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, c); g.addColorStop(1, "rgba(0,0,128,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    });
    // faint mark, bottom left
    if (mark) { ctx.globalAlpha = 0.22; const mh = 260, mw = mark.width * (mh / mark.height); ctx.drawImage(mark, 50, H - 150, mw, mh); ctx.globalAlpha = 1; }
    // white swoosh, top left
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 50; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-40, 150); ctx.bezierCurveTo(150, 160, 270, 140, 330, -40); ctx.stroke();

    // logo, top right
    ctx.textBaseline = "alphabetic"; ctx.textAlign = "right";
    ctx.fillStyle = "#fff"; ctx.font = `700 42px ${SANS}`;
    ctx.fillText("Awwal Brands", W - 110, 132);
    if (logo) { const lh = 84, lw = logo.width * (lh / logo.height); ctx.drawImage(logo, W - 110 - ctx.measureText("Awwal Brands").width - 26 - lw, 74, lw, lh); }

    // hairline frame with italic label
    const FX = 90, FY = 220, FW = W - 180, FH = 990;
    ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 2;
    roundRect(ctx, FX, FY, FW, FH, 30); ctx.stroke();
    ctx.font = `italic 500 46px ${SERIF}`; ctx.textAlign = "left";
    const label = "Certificate of Completion", lw2 = ctx.measureText(label).width;
    ctx.fillStyle = "#2B3391"; roundRect(ctx, 300, FY - 34, lw2 + 64, 68, 34); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillText(label, 332, FY + 15);

    // body, left aligned
    const X = 200;
    ctx.fillStyle = "rgba(255,255,255,.72)"; ctx.font = `500 26px ${MONO}`; spacedLeft(ctx, "THIS CERTIFIES THAT", X, 372, 8);
    ctx.fillStyle = "#fff"; fitText(ctx, certificateName, 1320, 136, 800, SANS); ctx.textAlign = "left"; ctx.fillText(certificateName, X - 4, 530);
    ctx.fillStyle = AMBER; ctx.fillRect(X, 582, 220, 7);
    ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.font = `400 36px ${SANS}`; ctx.fillText("has successfully completed the self-paced course", X, 690);
    ctx.fillStyle = "#fff"; fitText(ctx, COURSE, 1320, 78, 700, SANS); ctx.textAlign = "left"; ctx.fillText(COURSE, X - 2, 792);
    const sub = [LEVEL_LABEL[cert.level], cert.tracks ? cert.tracks.map(t => TRACKS[t]).join(" + ") : TRACKS[cert.track]].filter(Boolean).join("  ·  ");
    ctx.fillStyle = AMBER; fitText(ctx, sub, 1320, 50, 500, SERIF); ctx.fillText(sub, X, 872);

    [[X, "DATE", cert.date], [X + 440, "CERTIFICATE ID", cert.id], [X + 940, "ISSUED BY", "Awwal Brands"]].forEach(([x, name, value]) => {
      ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(x, 1040, 360, 2);
      ctx.fillStyle = "#fff"; ctx.font = `600 32px ${SANS}`; ctx.textAlign = "left"; ctx.fillText(value, x, 1094);
      ctx.fillStyle = "rgba(255,255,255,.65)"; ctx.font = `500 20px ${MONO}`; spacedLeft(ctx, name, x, 1136, 5);
    });

    // postage-stamp seal, lower right
    ctx.save();
    ctx.translate(1770, 930); ctx.rotate(0.5);
    const SW = 250, SH = 310;
    ctx.shadowColor = "rgba(0,0,40,.45)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
    ctx.fillStyle = CREAM; ctx.fillRect(-SW / 2, -SH / 2, SW, SH);
    ctx.shadowColor = "transparent";
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i <= 9; i++) { const px = -SW / 2 + (SW / 9) * i; [-SH / 2, SH / 2].forEach((py) => { ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill(); }); }
    for (let i = 0; i <= 11; i++) { const py = -SH / 2 + (SH / 11) * i; [-SW / 2, SW / 2].forEach((px) => { ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill(); }); }
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = BLUE; ctx.fillRect(-SW / 2 - 12, -SH / 2 - 12, SW + 24, SH + 24);
    ctx.globalCompositeOperation = "source-over";
    if (mark) { const mh = 150, mw = mark.width * (mh / mark.height); ctx.drawImage(mark, -mw / 2, -mh / 2, mw, mh); }
    ctx.restore();

    // footer
    ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.fillRect(0, 1284, W, 2);
    ctx.fillStyle = "#fff"; ctx.font = `500 36px ${SANS}`;
    ctx.textAlign = "left"; ctx.fillText("hello@awwalbrands.com", 170, 1362);
    ctx.textAlign = "right"; ctx.fillText("awwalbrands.com", W - 150, 1362);

    output.hidden = false;
    $("#cert-download").href = canvas.toDataURL("image/png");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!certificateName || !earned) return;
    if (isVideo) {
      const button = $("button[type='submit']", form); button.disabled = true;
      certMessage.textContent = "Generating your certificate…";
      try {
        const { certificate } = await assessmentApi({ action: "certificate", level: certificateLevel || earned });
        certificateName = certificate.name;
        await draw(certificate);
        certMessage.textContent = "Your certificate is ready to download or save as PDF.";
        output.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (error) { certMessage.textContent = error.message; }
      finally { button.disabled = false; }
      return;
    }
    const now = new Date();
    const old = state.certs[earned];
    const same = old && old.track === state.track;
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const cert = {
      name: certificateName, level: earned, track: state.track,
      date: same ? old.date : now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      id: same ? old.id : `AWB-${CODE}${earned}-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    };
    state.certs[earned] = cert; save();
    try { await draw(cert); output.scrollIntoView({ behavior: "smooth", block: "center" }); }
    catch { certMessage.textContent = "Could not render your certificate. Please retry."; }
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

  render();
  if (isVideo) loadAssessments();
  if (account) { account.onChange(() => pullFromAccount()); pullFromAccount(); }
})();
