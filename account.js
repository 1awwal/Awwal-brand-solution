// Awwal Courses — learner accounts: Google sign-in, progress on any device, My courses and the owner's admin view.
// Data lives in a Supabase project used only for courses. The key below is a publishable key: it is meant to be
// public, and every table is protected by row-level security (learners can read and write only their own rows).
(() => {
  const SUPABASE_URL = "https://sfaejrunzvsgmovqkrnm.supabase.co";
  const SUPABASE_KEY = "sb_publishable_Jpo-7sKpJ2OUtYmJk3GhGQ_AXVzvB00";
  const SDK = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, attrs = {}, text) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => { if (v !== null && v !== undefined) node.setAttribute(k, v); });
    if (text !== undefined) node.textContent = text;
    return node;
  };

  let client = null, user = null, profile = null;
  const listeners = [];
  const destinationKey = "awwal-course-return";
  let courseDestination = null;
  const signupKey = "awwal-course-signup";
  let pendingRegistration = null;
  try { pendingRegistration = JSON.parse(sessionStorage.getItem(signupKey) || "null"); } catch {}
  let signupMode = location.pathname === "/signup" || new URLSearchParams(location.search).get("mode") === "signup" || !!pendingRegistration;
  const notify = () => listeners.forEach((fn) => { try { fn(user, profile); } catch (_) {} });

  async function loadProfile() {
    profile = null;
    if (!client || !user) return;
    const { data } = await client.from("profiles").select("full_name,email,reminders_opt_in,is_admin").eq("id", user.id).maybeSingle();
    profile = data || null;
    client.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", user.id).then(() => {});
  }

  const ready = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = SDK; script.async = true;
    script.onerror = () => resolve();
    script.onload = async () => {
      try {
        client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
        const { data } = await client.auth.getSession();
        user = data.session ? data.session.user : null;
        await loadProfile();
        client.auth.onAuthStateChange((_event, session) => {
          const next = session ? session.user : null;
          if ((next && next.id) === (user && user.id)) return;
          user = next;
          // Defer: Supabase asks that no other client calls run inside this callback.
          setTimeout(async () => { await loadProfile(); notify(); }, 0);
        });
      } catch (_) { client = null; }
      resolve();
      notify();
    };
    document.head.appendChild(script);
  });

  async function clearCourseSession() {
    const response = await fetch("/api/course-session", { method: "DELETE" });
    if (!response.ok) throw new Error("Could not clear the course session");
  }

  const api = {
    ready,
    async refreshCourseSession() {
      await ready;
      if (!client || !user) return false;
      const { data } = await client.auth.getSession();
      if (!data.session) return false;
      const response = await fetch('/api/course-session', {
        method: 'POST', headers: { Authorization: 'Bearer ' + data.session.access_token },
      });
      return response.ok;
    },
    get user() { return user; },
    get profile() { return profile; },
    onChange(fn) { listeners.push(fn); },
    async signIn() {
      await ready;
      if (!client) { alert("Sign-in is unavailable right now. Please try again in a moment."); return; }
      if (courseDestination) sessionStorage.setItem(destinationKey, courseDestination);
      sessionStorage.setItem("awwal-after-login", "/profile");
      const { error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + (location.pathname === "/signup" ? "/my-courses" : location.pathname) } });
      if (error) alert("Google sign-in is not available yet. Your progress is still saved on this device.");
    },
    async signOut() {
      if (!client) return;
      await clearCourseSession();
      sessionStorage.removeItem(signupKey);
      pendingRegistration = null;
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) {
        localStorage.removeItem("sb-sfaejrunzvsgmovqkrnm-auth-token");
        localStorage.removeItem("sb-sfaejrunzvsgmovqkrnm-auth-token-code-verifier");
      }
      user = null;
      profile = null;
      notify();
    },
    async loadProgress(courseKey) {
      if (!client || !user) return null;
      const { data } = await client.from("course_progress").select("track,done,certs,updated_at").eq("user_id", user.id).eq("course_key", courseKey).maybeSingle();
      return data || null;
    },
    async saveProgress(courseKey, row) {
      if (!client || !user) return false;
      const { error } = await client.from("course_progress").upsert({ user_id: user.id, course_key: courseKey, ...row }, { onConflict: "user_id,course_key" });
      return !error;
    },
    async allProgress() {
      if (!client || !user) return [];
      const { data } = await client.from("course_progress").select("course_key,track,done_count,total_count,level_earned,updated_at").eq("user_id", user.id);
      const rows = data || [];
      // Video completion is graded on the server; old manual ticks are not assessment passes.
      try {
        const response = await fetch('/api/course-assessments?summary=1', { cache: 'no-store' });
        if (response.ok) {
          const assessed = await response.json();
          const choices = ['fcp', 'premiere', 'resolve'].map(track => {
            const required = assessed.assessments.filter(a => a.track === 'general' || a.track === track).flatMap(a => a.lessons);
            return { total: required.length, done: required.filter(id => assessed.done[id]).length };
          }).sort((a, b) => b.done / b.total - a.done / a.total);
          const best = choices[0];
          const row = { course_key: 'video-editing', done_count: best.done, total_count: best.total,
            level_earned: assessed.eligible.at(-1)?.level || 0 };
          return [...rows.filter(r => r.course_key !== 'video-editing'), row];
        }
        // Failed assessment reads must not display old manually-earned video certificates.
        return rows.filter(r => r.course_key !== 'video-editing');
      } catch { return rows.filter(r => r.course_key !== 'video-editing'); }
    },
    async setReminders(on) {
      if (!client || !user) return false;
      const { error } = await client.from("profiles").update({ reminders_opt_in: !!on }).eq("id", user.id);
      if (!error && profile) profile.reminders_opt_in = !!on;
      return !error;
    },
    async deleteAccount() {
      if (!client || !user) return false;
      const { data } = await client.auth.getSession();
      if (!data.session) return false;
      const response = await fetch("/api/course-account/delete", {
        method: "POST", headers: { Authorization: "Bearer " + data.session.access_token },
      });
      if (!response.ok) return false;
      await client.auth.signOut({ scope: "local" });
      return true;
    },
    async adminData() {
      if (!client || !user || !profile || !profile.is_admin) return null;
      const [people, progress] = await Promise.all([
        client.from("profiles").select("id,full_name,email,reminders_opt_in,created_at,last_seen_at").order("created_at", { ascending: false }).limit(2000),
        client.from("course_progress").select("user_id,course_key,done_count,total_count,level_earned,updated_at").limit(10000),
      ]);
      return { people: people.data || [], progress: progress.data || [] };
    },
  };
  window.AwwalAccount = api;

  const firstName = () => {
    const name = (profile && profile.full_name) || (user && user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) || "";
    return name.trim().split(/\s+/)[0] || "Account";
  };

  // ---------- nav chip (every page that loads this script) ----------
  const actions = $(".nav-actions");
  let chip = null;
  if (actions) {
    chip = el("a", { class: "account-chip", href: "/my-courses" }, "Sign in");
    actions.insertBefore(chip, actions.firstChild);
  }

  // ---------- strip on course pages ----------
  const strip = $("#account-strip");
  function renderStrip() {
    if (!strip) return;
    strip.replaceChildren();
    strip.hidden = false;
    if (!user) {
      strip.append(el("span", {}, "Sign in to keep your progress and certificates on every device."));
      const btn = el("button", { type: "button", class: "account-btn" }, "Sign in with Google");
      btn.addEventListener("click", () => api.signIn());
      strip.append(btn);
      return;
    }
    strip.append(el("span", {}, `Signed in as ${firstName()}. Progress is saved to your account.`));
    const label = el("label", { class: "account-check" });
    const box = el("input", { type: "checkbox" });
    box.checked = !!(profile && profile.reminders_opt_in);
    box.addEventListener("change", async () => { box.disabled = true; const ok = await api.setReminders(box.checked); if (!ok) box.checked = !box.checked; box.disabled = false; });
    label.append(box, el("span", {}, "Email me a reminder if I stop for a week"));
    const signOut = el("button", { type: "button", class: "account-btn" }, "Sign out");
    signOut.addEventListener("click", async () => {
      try { await api.signOut(); location.replace("/courses"); }
      catch { alert("We could not sign you out. Please try again."); }
    });
    strip.append(label, el("a", { href: "/my-courses", class: "account-link" }, "My courses"), signOut);
  }

  // ---------- My courses ----------
  const dash = $("#my-courses");
  let registration = null, registrationRequired = false;
  const LEVELS = ["Not started", "Beginner certificate", "Intermediate certificate", "Professional certificate"];
  async function renderDash() {
    if (!dash) return;
    const gate = $("#dash-gate"), body = $("#dash-body");
    if (new URLSearchParams(location.search).get("unsubscribed") && !document.getElementById("dash-notice")) {
      dash.prepend(el("p", { class: "dash-notice", id: "dash-notice", role: "status" }, "Course reminder emails are now off."));
    }
    const nameForm = $("#dash-name-form");
    const signIn = $("#dash-signin");
    if (!user) {
      registration = null;
      registrationRequired = false;
    }
    $("#dash-gate-signout").hidden = !user;
    const showRegistration = registrationRequired || (!user && signupMode);
    $("#dash-create-account").hidden = !!user || signupMode;
    $("#dash-back-signin").hidden = !!user || !signupMode;
    nameForm.hidden = !showRegistration;
    signIn.hidden = showRegistration;
    $("#dash-gate h2").textContent = showRegistration ? "Create your learner account"
      : user ? "Open your courses"
      : courseDestination ? "Sign in to access this course" : "Sign in to see your courses";
    signIn.firstChild.textContent = user ? "Continue " : "Sign in with Google ";
    $("#dash-save-name").firstChild.textContent = user ? "Register and continue " : "Continue with Google ";
    if (!user || !registration || courseDestination) { gate.hidden = false; body.hidden = true; return; }
    gate.hidden = true; body.hidden = false;
    $("#dash-name").textContent = registration.name.trim().split(/\s+/)[0];
    $("#dash-certificate-name").textContent = registration.name;
    if ($("#profile-name")) $("#profile-name").textContent = registration.name;
    if ($("#profile-phone")) $("#profile-phone").textContent = registration.phone || "";
    if ($("#profile-email")) $("#profile-email").textContent = user.email || "";
    $("#dash-email").textContent = (profile && profile.email) || user.email || "";
    const reminders = $("#dash-reminders");
    reminders.checked = !!(profile && profile.reminders_opt_in);
    const rows = await api.allProgress();
    const byKey = Object.fromEntries(rows.map((r) => [r.course_key, r]));
    let started = 0, certificates = 0;
    dash.querySelectorAll("[data-course]").forEach((card) => {
      const r = byKey[card.dataset.course];
      const pct = r && r.total_count ? Math.round((r.done_count / r.total_count) * 100) : 0;
      if (r && r.done_count) started += 1;
      if (r) certificates += r.level_earned;
      $(".dash-fill", card).style.width = pct + "%";
      $(".dash-pct", card).textContent = pct + "%";
      $(".dash-state", card).textContent = r && r.done_count
        ? `${r.done_count} of ${r.total_count} sessions · ${r.level_earned ? LEVELS[r.level_earned] + " earned" : "No certificate yet"}`
        : "Not started";
      $(".dash-go", card).textContent = !r || !r.done_count ? "Start" : pct === 100 ? "Review" : "Continue";
      card.classList.toggle("is-started", !!(r && r.done_count));
    });
    $("#dash-started").textContent = String(started);
    $("#dash-certs").textContent = String(certificates);
    $("#dash-admin").hidden = !(profile && profile.is_admin);
  }
  if (dash) {
    const signIn = $("#dash-signin");
    const next = new URLSearchParams(location.search).get("next");
    const returnPath = next ? next + location.hash : sessionStorage.getItem(destinationKey);
    if (/^\/[a-z-]+-course(?:\?[^#]*)?(?:#[^\r\n]*)?$/.test(returnPath || "")) courseDestination = returnPath;
    const accessMessage = $("#dash-access-message");
    const submit = $("#dash-save-name");
    let registrationBusy = false;

    async function openCourses(details) {
      if (!client || !user || registrationBusy) return;
      registrationBusy = true;
      signIn.disabled = submit.disabled = true;
      accessMessage.textContent = details ? "Saving your registration…" : "Checking your registration…";
      try {
        const { data } = await client.auth.getSession();
        if (!data.session) throw new Error("Please sign in again to continue.");
        const headers = { Authorization: "Bearer " + data.session.access_token };
        if (details) headers["Content-Type"] = "application/json";
        const response = await fetch("/api/course-session", {
          method: "POST", headers, body: details ? JSON.stringify(details) : undefined,
        });
        const result = await response.json().catch(() => ({}));
        if (response.status === 401) {
          await api.signOut();
          location.replace("/my-courses");
          return;
        }
        if (result.registrationRequired) {
          registrationRequired = true;
          accessMessage.textContent = "";
          renderDash();
          $("#dash-full-name").focus();
          return;
        }
        if (!response.ok || !result.name) {
          throw new Error((result.error || "We couldn’t verify your registration. Please try again.") + (result.code ? " (" + result.code + ")" : ""));
        }
        registration = result;
        registrationRequired = false;
        pendingRegistration = null;
        sessionStorage.removeItem(signupKey);
        accessMessage.textContent = "";
        if (courseDestination) {
          sessionStorage.removeItem(destinationKey);
          location.replace(courseDestination);
        } else if (sessionStorage.getItem("awwal-after-login") === "/profile" && location.pathname !== "/profile") {
          sessionStorage.removeItem("awwal-after-login");
          location.replace("/profile");
        } else {
          sessionStorage.removeItem("awwal-after-login");
          renderDash();
        }
      } catch (error) {
        accessMessage.textContent = error.message;
      } finally {
        registrationBusy = false;
        signIn.disabled = submit.disabled = false;
      }
    }

    signIn.addEventListener("click", async () => {
      await ready;
      if (user) return openCourses();
      return api.signIn();
    });
    $("#dash-name-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = $("#dash-full-name").value.trim();
      const phone = $("#dash-phone").value.trim().replace(/[\s().-]/g, "");
      if (!name || name.length > 100 || /[\u0000-\u001f\u007f]/.test(name)) {
        accessMessage.textContent = "Enter your full name exactly as it should appear on certificates.";
        return;
      }
      if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
        accessMessage.textContent = "Enter your phone number with its country code, such as +966.";
        return;
      }
      await ready;
      const details = { name, phone };
      if (user) return openCourses(details);
      pendingRegistration = details;
      sessionStorage.setItem(signupKey, JSON.stringify(details));
      return api.signIn();
    });
    ready.then(() => { if (user) openCourses(pendingRegistration); });
    const signOut = async () => {
      try { await api.signOut(); location.replace("/courses"); }
      catch { alert("We could not sign you out. Please try again."); }
    };
    $("#dash-signout").addEventListener("click", signOut);
    $("#dash-gate-signout").addEventListener("click", signOut);
    $("#dash-reminders").addEventListener("change", async (e) => {
      const box = e.target; box.disabled = true;
      const ok = await api.setReminders(box.checked); if (!ok) box.checked = !box.checked; box.disabled = false;
    });
    $("#dash-delete").addEventListener("click", async () => {
      if (!confirm("Delete your account and all saved course progress? This cannot be undone.")) return;
      const ok = await api.deleteAccount().catch(() => false);
      alert(ok ? "Your account and progress have been deleted." : "We could not delete the account just now. Please email hello@awwalbrands.com and we will remove it.");
    });
  }

  // ---------- owner's admin view ----------
  const admin = $("#courses-admin");
  async function renderAdmin() {
    if (!admin) return;
    const gate = $("#admin-gate"), body = $("#admin-body"), msg = $("#admin-message");
    if (!user) { gate.hidden = false; body.hidden = true; msg.textContent = "Sign in with the owner account to see learners."; $("#admin-signin").hidden = false; return; }
    $("#admin-signin").hidden = true;
    if (!profile || !profile.is_admin) { gate.hidden = false; body.hidden = true; msg.textContent = "This page is only available to the site owner."; return; }
    const data = await api.adminData();
    if (!data) return;
    gate.hidden = true; body.hidden = false;
    const courses = JSON.parse(admin.dataset.courses);
    const byUser = {};
    data.progress.forEach((p) => { (byUser[p.user_id] = byUser[p.user_id] || {})[p.course_key] = p; });
    const day = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    $("#admin-total").textContent = String(data.people.length);
    $("#admin-active").textContent = String(data.people.filter((p) => Date.now() - Date.parse(p.last_seen_at) < 7 * 864e5).length);
    $("#admin-certs").textContent = String(data.progress.reduce((n, p) => n + p.level_earned, 0));
    $("#admin-optin").textContent = String(data.people.filter((p) => p.reminders_opt_in).length);
    const head = $("#admin-table thead tr"), tbody = $("#admin-table tbody");
    head.replaceChildren(...["Learner", "Email", "Joined", "Last seen", "Reminders"].map((t) => el("th", { scope: "col" }, t)), ...courses.map((c) => el("th", { scope: "col", title: c.title }, c.short)));
    tbody.replaceChildren(...data.people.map((p) => {
      const tr = el("tr");
      tr.append(el("td", {}, p.full_name || "—"), el("td", {}, p.email), el("td", {}, day(p.created_at)), el("td", {}, day(p.last_seen_at)), el("td", {}, p.reminders_opt_in ? "Yes" : "No"));
      courses.forEach((c) => {
        const r = (byUser[p.id] || {})[c.key];
        const pct = r && r.total_count ? Math.round((r.done_count / r.total_count) * 100) : null;
        tr.append(el("td", { class: pct === null ? "is-empty" : "" }, pct === null ? "—" : `${pct}%${r.level_earned ? " · L" + r.level_earned : ""}`));
      });
      return tr;
    }));
    $("#admin-empty").hidden = data.people.length > 0;
  }
  if (admin) $("#admin-signin").addEventListener("click", () => api.signIn());

  function renderAll() {
    if (chip) { chip.href = user ? "/profile" : "/my-courses"; chip.textContent = user ? firstName() : "Sign in"; chip.classList.toggle("is-in", !!user); chip.setAttribute("title", user ? "My courses" : "Sign in with Google"); }
    renderStrip(); renderDash(); renderAdmin();
  }
  api.onChange(renderAll);
  ready.then(renderAll);
})();
