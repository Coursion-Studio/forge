(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]static\b/.test(location.search);

  function onView(el, fn) {
    if (!el) return;
    if (reduce || !("IntersectionObserver" in window)) { fn(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fn(); } });
    }, { threshold: 0.35 });
    io.observe(el);
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); }

  var agents = [
    { t: "Search index migration", m: "Sonnet 5.5", tier: "medium", role: "builder", ty: "forge-worker", sub: "trigram search, own worktree", tok: 251.6, cost: 0.15,
      steps: [["Reading src/search/index.ts", "reading"], ["Editing trigram.ts", "editing"], ["forge-verify · 214 tests", "working"], ["Rebased and green, ready to land", "celebrating"]] },
    { t: "Review: signed cookies", m: "Opus 5.5", tier: "careful", role: "reviewer", ty: "forge-reviewer", sub: "adversarial review", tok: 137.4, cost: 0.31,
      steps: [["Reading the diff · 6 files", "reading"], ["Running the suite", "working"], ["Probing expiry edge cases", "thinking"], ["Approved with 2 notes", "celebrating"]] },
    { t: "Find every price helper", m: "Haiku 5.5", tier: "light", role: "scout", ty: "forge-explorer", sub: "read-only search", tok: 48.2, cost: 0.02,
      steps: [["Searching 1,204 files", "reading"], ["Reading 14 matches", "reading"], ["Summarising", "thinking"], ["Found 9 helpers in 4 files", "celebrating"]] },
    { t: "Upload progress bar", m: "Sonnet 5.5", tier: "medium", role: "builder", ty: "forge-worker", sub: "UI change, own worktree", tok: 172.9, cost: 0.11,
      steps: [["Waiting for a build slot", "thinking"], ["Editing UploadView.swift", "editing"], ["Testing in the VM", "working"], ["Green in the VM, ready to land", "celebrating"]] },
    { t: "Plan the billing split", m: "Fable 5.1", tier: "heavy", role: "planner", ty: "Plan", sub: "design, no edits", tok: 312.0, cost: 0.58,
      steps: [["Reading billing/ and the docs", "reading"], ["Weighing two designs", "thinking"], ["Writing the plan", "editing"], ["Plan ready · 3 steps", "celebrating"]] }
  ];
  var tierColor = { light: "#5CD985", medium: "#4D9BFF", careful: "#FFB33D", heavy: "#FF5189" };

  var ws = document.getElementById("ws-demo");
  if (ws && window.ForgeMascot) {
    var q = function (s) { return ws.querySelector(s); };
    var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var tpl = q(".fw-pane").cloneNode(true);
    var lumenPane = q(".fw-pane");
    var list = q("[data-list]"), count = q("[data-count]"), pulse = q("[data-pulse]"), key = q(".kc");
    var elx = q("[data-el]"), clock = q("[data-clock]"), side = q("[data-side]"), sub = q("[data-sub]");
    var costEl = q("[data-cost]"), tokEl = q("[data-tok]"), timeEl = q("[data-time]"), stop = q(".stop");
    var row = q("[data-agent-row]"), rowN = q("[data-agent-n]"), build = q("[data-build]"), tx = q(".fw-tx");
    var pane = new ForgeMascot(q("[data-mascot]"), { mood: "ready" });
    var lumenApp = q(".fw-pin .app"), agentsN = q("[data-agents-n]");
    var main = { set: function (m) { pane.set(m); } };
    var subN = q("[data-sub-n]");
    var current = "lumen", panes = { lumen: lumenPane };
    var models = [["Opus 5.5", "careful"], ["Sonnet 5.5", "medium"], ["Haiku 5.5", "light"], ["Fable 5.1", "heavy"]];
    var efforts = ["Extra High", "High", "Medium", "Low"];
    var model = 0, effort = 0;

    function fmt(s) { return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }

    var others = {
      tidepool: [["Testing in the VM · 11 UI tests", "working", ""], ["Reading crash log", "reading", ""], ["Editing PhotoGrid.swift", "editing", ""], ["Build passed · ready to land", "celebrating", "ok"]],
      atlas: [["Fixing a flaky test", "editing", ""], ["forge-verify · 82 tests", "working", ""], ["Needs your OK to push", "waiting", "att"], ["Landed on main", "celebrating", "ok"]],
      orbit: [["Planning the onboarding", "thinking", ""], ["2 helpers working", "helpers", ""], ["Reviewing the diff", "reading", ""], ["Ready", "ready", ""]],
      nook: [["Idle · 3h", "sleepy", ""]],
      vista: [["Idle · 2d", "sleepy", ""]]
    };
    Object.keys(others).forEach(function (k, n) {
      var r = q('[data-ws="' + k + '"]'), seq = others[k], app = r.querySelector(".app");
      var label = r.querySelector("small"), tm = r.querySelector(".tm"), j = 0;
      var t0 = Date.now() - (parseInt(tm.textContent, 10) * 60 + parseInt(tm.textContent.split(":")[1] || 0, 10)) * 1000;
      function show() {
        label.textContent = seq[j][0]; label.className = seq[j][2];
        app.className = "app " + (seq[j][2] || (seq[j][1] === "sleepy" || seq[j][1] === "ready" ? "" : "busy"));
      }
      show();
      if (seq.length < 2) return;
      tm.classList.add("live");
      if (!reduce) setInterval(function () { tm.textContent = fmt(Math.floor((Date.now() - t0) / 1000)); }, 1000);
      (function cycle() {
        setTimeout(function () { j = (j + 1) % seq.length; show(); cycle(); }, reduce ? 1e9 : 2600 + n * 700 + Math.random() * 1800);
      })();
    });

    var views = {
      lumen: { name: "Lumen", path: "~/Code/lumen", ico: "#C75CEB", letter: "L" },
      tidepool: { name: "Tidepool", path: "~/Code/tidepool-ios", ico: "#389EFF", letter: "T", pane: "1 · Photo grid crash", sub: "Testing in the VM", mood: "working", pulse: "2 helpers working",
        you: "The photo grid crashes when you rotate the phone. Fix it and prove it in the VM.",
        rows: [["Read", "Crashes/PhotoGrid-2026-11-13.ips", "88 lines"], ["Grep", "visibleIndexPaths", "6 files"]],
        claude: "A stale index after rotation. One worker fixes it in its own worktree, a tester runs it in the VM.",
        cards: [["Fix rotation crash", "Sonnet 5.5", "medium", "builder", "forge-worker", "Editing PhotoGrid.swift", 60], ["Prove it in the VM", "Sonnet 5.5", "medium", "none", "forge-tester", "Rotating on iPhone 17 · 4 screenshots", 35]],
        stats: ["≈$0.21", "301.4k", "4:12"] },
      atlas: { name: "Atlas API", path: "~/Code/atlas-api", ico: "#3DDC97", letter: "A", pane: "1 · Flaky checkout test", sub: "Waiting on you", mood: "waiting", pulse: "Waiting for your OK",
        you: "The checkout test fails one run in ten. Make it reliable, then push.",
        rows: [["Edit", "test/checkout.spec.ts", "+12 −4"], ["Bash", "forge-verify", "82 of 82 passed"]],
        claude: "It raced the payment mock. Fixed and proven green. Pushing is outward, so I need your OK.",
        ask: "git push origin main",
        cards: [["Fix the checkout race", "Sonnet 5.5", "medium", "builder", "forge-worker", "Rebased and green, ready to land", 100]],
        stats: ["≈$0.09", "142.0k", "1:37"] },
      orbit: { name: "Orbit", path: "~/Code/orbit-web", ico: "#FFB547", letter: "O", pane: "1 · New onboarding", sub: "Waiting on subagents", mood: "helpers", pulse: "2 helpers working",
        you: "Plan a shorter onboarding. Three screens at most.",
        rows: [["Read", "app/onboarding/*.tsx", "5 files"]],
        claude: "A planner drafts it while a scout collects every place the old flow is linked from.",
        cards: [["Plan the onboarding", "Fable 5.1", "heavy", "planner", "Plan", "Weighing two flows", 50], ["Find every entry point", "Haiku 5.5", "light", "scout", "forge-explorer", "Reading 9 matches", 70]],
        stats: ["≈$0.44", "388.2k", "0:48"] },
      nook: { name: "Nook", path: "~/Code/nook-browser", ico: "#FF5189", letter: "N", pane: "1 · Tab groups", sub: "Idle", mood: "sleepy", pulse: "Idle for 3 hours",
        you: "Ship the tab groups change.", rows: [["Bash", "forge-verify", "passed"]],
        claude: "Landed on main as build 212 and queued the install for when you are idle.", cards: [], stats: ["≈$0.12", "96.3k", "6:02"] },
      vista: { name: "Vista", path: "~/Code/vista", ico: "#2FD3C9", letter: "V", pane: "1 · Weekly report", sub: "Idle", mood: "sleepy", pulse: "Idle for 2 days",
        you: "Write up this week's crash report.", rows: [["Read", "Reports/weekly/2026-11-09.md", "64 lines"]],
        claude: "Done. Two new crashes, both filed as board cards with the Sentry link.", cards: [], stats: ["≈$0.05", "41.8k", "2:15"] }
    };

    function tierOf(m) { for (var i = 0; i < models.length; i++) if (models[i][0] === m) return models[i][1]; return "medium"; }
    function cardHTML(t, m, tier, ty, st) {
      return '<div class="fa-top"><canvas class="mascot"></canvas><div><div class="t">' + esc(t) + '</div>' +
        '<div class="chips"><span class="mc" style="--c:' + tierColor[tier] + '">' + m + '</span><span class="ty">' + ty + '</span></div></div>' +
        '<span class="st">' + st + '</span></div>' +
        '<div class="now"></div><div class="prog"><div class="bar"><i></i></div><span class="pct">0%</span></div><div class="meta"></div><div class="log"></div>';
    }
    function trow(ok, tool, code, right) {
      var d = document.createElement("div"); d.className = "trow";
      d.innerHTML = '<i class="' + (ok ? "ok" : "spin") + '">' + (ok ? "✓" : "") + '</i><b>' + tool + '</b><code>' + esc(code) + '</code><span>' + esc(right) + '</span>';
      return d;
    }
    function bubble(kind, text) {
      var d = document.createElement("div");
      if (kind === "you") { d.className = "you"; d.innerHTML = '<span class="lbl">You</span><div class="bub">' + esc(text) + '</div>'; }
      else { d.className = "cl-msg"; d.innerHTML = '<span class="who"><i class="cl"></i>Claude</span><div class="bub">' + esc(text) + '</div>'; }
      return d;
    }

    function buildPane(k) {
      var v = views[k], p = tpl.cloneNode(true);
      p.querySelector(".fw-ph .ttl b").innerHTML = '<i class="d' + (v.mood === "sleepy" ? "" : " live") + '"></i>' + v.pane;
      p.querySelector("[data-sub]").textContent = v.sub;
      var t = p.querySelector(".fw-tx"); t.innerHTML = "";
      t.appendChild(bubble("you", v.you));
      v.rows.forEach(function (r) { t.appendChild(trow(true, r[0], r[1], r[2])); });
      t.appendChild(bubble("claude", v.claude));
      if (v.ask) {
        var a = document.createElement("div"); a.className = "perm";
        a.innerHTML = '<div class="ph2"><b>Allow Bash?</b><code>' + v.ask + '</code></div><div class="acts"><button type="button" data-allow>Allow</button><button type="button" data-deny>Deny</button></div>';
        t.appendChild(a);
      } else if (v.cards.length && v.mood !== "sleepy") {
        t.appendChild(trow(false, "Agent", v.cards.length + " subagents", "running"));
      }
      p.querySelector("[data-pulse]").textContent = v.pulse;
      p.querySelector("[data-el]").textContent = "";
      var stp = p.querySelector(".stop"); stp.style.opacity = v.mood === "sleepy" ? 0 : 1;
      if (v.mood === "waiting") stp.style.opacity = 0;
      v.m = new ForgeMascot(p.querySelector("[data-mascot]"), { mood: v.mood });
      var s = p.querySelectorAll(".fa-stats b"); s[0].textContent = v.stats[0]; s[1].textContent = v.stats[1]; s[2].textContent = v.stats[2];
      var running = v.cards.filter(function (c) { return c[6] < 100; }).length;
      p.querySelector("[data-count]").textContent = running + " running · " + (v.cards.length - running) + " done";
      var l = p.querySelector("[data-list]");
      v.cards.forEach(function (c) {
        var done = c[6] >= 100, el = document.createElement("div");
        el.className = "fa-card" + (done ? " done" : "");
        el.innerHTML = cardHTML(c[0], c[1], c[2], c[4], done ? "done" : "running");
        el.querySelector(".now").textContent = c[5];
        el.querySelector(".bar i").style.width = c[6] + "%"; el.querySelector(".pct").textContent = c[6] + "%";
        el.querySelector(".meta").textContent = "ctx 4% · 120.3k ≈$0.08 " + v.stats[2];
        el.querySelector(".log").innerHTML = "<div>› " + esc(c[5]) + "</div>";
        l.appendChild(el);
        new ForgeMascot(el.querySelector("canvas"), { crew: { tier: c[2], role: c[3] }, mood: done ? "ready" : (c[3] === "scout" ? "reading" : c[3] === "planner" ? "thinking" : "working") });
      });
      if (!v.cards.length) l.innerHTML = '<div class="fa-empty">No subagents running. Ask for something below.</div>';
      return p;
    }

    function open(k) {
      if (k === current) return;
      var p = panes[k] || (panes[k] = buildPane(k));
      q(".fw-pane").replaceWith(p);
      current = k;
      var v = views[k], top = q(".fw-top");
      top.querySelector(".ttl b").textContent = v.name;
      top.querySelector(".ttl small").innerHTML = v.path + ' · <em>Capabilities</em>';
      var src = (k === "lumen" ? q(".fw-pin .app") : q('[data-ws="' + k + '"] .app')).cloneNode(true);
      src.className = "app app-top"; top.querySelector(".app-top").replaceWith(src);
      ws.querySelectorAll(".fw-ws").forEach(function (r) { r.classList.remove("sel"); });
      q(".fw-pin").classList.toggle("on", k === "lumen");
      (k === "lumen" ? q(".fw-pin .fw-ws") : q('[data-ws="' + k + '"]')).classList.add("sel");
      p.querySelectorAll(".pk")[1].textContent = "▣ " + models[model][0] + " ▾";
      p.querySelectorAll(".pk")[2].textContent = "◔ " + efforts[effort] + " ▾";
    }

    var next = 0, auto = true, started = 0, cost = 0, tok = 0, launched = 0, ticking = null, settle = null, live = [];
    function tick() {
      var s = Math.floor((Date.now() - started) / 1000);
      elx.textContent = s + "s"; clock.textContent = fmt(s); timeEl.textContent = fmt(s);
    }
    function running() { return list.querySelectorAll(".fa-card:not(.done)").length; }
    function status(stopped) {
      var n = running();
      count.textContent = n + " running · " + list.querySelectorAll(".fa-card.done").length + " done";
      costEl.textContent = "≈$" + cost.toFixed(2);
      tokEl.textContent = tok >= 1000 ? (tok / 1000).toFixed(1) + "M" : tok.toFixed(1) + "k";
      agentsN.textContent = n; agentsN.classList.toggle("zero", !n);
      lumenApp.className = "app " + (n ? "busy" : launched ? "ok" : "");
      rowN.textContent = launched + " launched"; subN.textContent = launched + " agent" + (launched === 1 ? "" : "s");
      if (n) {
        clearTimeout(settle);
        main.set("helpers"); pulse.textContent = n + " helper" + (n === 1 ? "" : "s") + " still working";
        side.textContent = "Running " + n + " agent" + (n === 1 ? "" : "s"); sub.textContent = "Waiting on subagents";
        stop.style.opacity = 1; stop.disabled = false; row.querySelector("i").className = "spin"; row.querySelector("i").textContent = "";
        build.style.opacity = 1;
        if (!ticking) { started = started || Date.now(); ticking = setInterval(tick, 500); }
      } else {
        clearInterval(ticking); ticking = null;
        stop.style.opacity = 0; stop.disabled = true; row.querySelector("i").className = "ok"; row.querySelector("i").textContent = "✓";
        build.style.opacity = 0;
        if (stopped) {
          main.set("ready"); pulse.textContent = "Stopped. Your work is safe in the worktrees";
          side.textContent = "Stopped"; sub.textContent = "Ready";
          return;
        }
        main.set("celebrating"); pulse.textContent = "All " + launched + " subagents finished";
        side.textContent = "Done · " + launched + " agents"; sub.textContent = "Ready";
        settle = setTimeout(function () { main.set("ready"); pulse.textContent = "Ready"; }, reduce ? 0 : 3200);
      }
    }
    function spawn(a) {
      var done = list.querySelectorAll(".fa-card.done");
      if (list.children.length >= 3 && !done.length) return false;
      if (list.children.length >= 3) list.removeChild(done[done.length - 1]);
      a = a || agents[next++ % agents.length]; launched++;
      var el = document.createElement("div");
      el.className = "fa-card";
      el.innerHTML = cardHTML(a.t, a.m, a.tier, a.ty, "running");
      list.insertBefore(el, list.querySelector(".fa-card.done"));
      var crew = new ForgeMascot(el.querySelector("canvas"), { crew: { tier: a.tier, role: a.role }, mood: "delegating" });
      var now = el.querySelector(".now"), bar = el.querySelector(".bar i"), pct = el.querySelector(".pct"), meta = el.querySelector(".meta"), log = el.querySelector(".log");
      var t0 = Date.now(), i = 0, ctx = 2 + Math.floor(Math.random() * 3), halted = false, timer = null;
      var ctl = { halt: function () {
        if (halted || el.classList.contains("done")) return;
        halted = true; clearTimeout(timer);
        el.classList.add("done", "stopped"); el.querySelector(".st").textContent = "stopped";
        now.textContent = "Stopped by you"; crew.set("sleepy");
        list.appendChild(el);
      } };
      live.push(ctl);
      main.set("delegating"); pulse.textContent = "Delegating to " + a.t;
      status();
      (function step() {
        if (halted) return;
        var s = a.steps[i], p = Math.round((i + 1) / a.steps.length * 100);
        now.textContent = s[0]; bar.style.width = p + "%"; pct.textContent = p + "%";
        var ln = document.createElement("div"); ln.textContent = "› " + s[0]; log.appendChild(ln);
        var secs = Math.max(1, Math.round((Date.now() - t0) / 1000) * 7);
        meta.textContent = "ctx " + (ctx + i) + "% · " + (a.tok * (i + 1) / a.steps.length).toFixed(1) + "k ≈$" + (a.cost * (i + 1) / a.steps.length).toFixed(2) + " " + fmt(secs);
        cost += a.cost / a.steps.length; tok += a.tok / a.steps.length;
        crew.set(s[1]);
        if (i === a.steps.length - 1) {
          el.classList.add("done"); el.querySelector(".st").textContent = "done";
          list.appendChild(el);
          setTimeout(function () { if (crew.mood === "celebrating") crew.set("ready"); }, reduce ? 0 : 4000);
          status();
          return;
        }
        status();
        i++; timer = setTimeout(step, reduce ? 0 : 1300 + Math.random() * 1100);
      })();
      return true;
    }
    function custom(text) {
      var m = models[model], tier = m[1];
      var t = text.length > 34 ? text.slice(0, 33).trim() + "…" : text;
      return { t: t.charAt(0).toUpperCase() + t.slice(1), m: m[0], tier: tier, role: "builder", ty: "forge-worker", tok: 120 + Math.random() * 160, cost: tier === "light" ? 0.03 : tier === "careful" ? 0.3 : tier === "heavy" ? 0.55 : 0.12,
        steps: [["Reading the code", "reading"], ["Editing 3 files", "editing"], ["forge-verify · tests", "working"], ["Green, ready to land", "celebrating"]] };
    }
    function ask(text) {
      text = text.trim(); if (!text) return;
      if (current !== "lumen") {
        var t = panes[current].querySelector(".fw-tx");
        t.appendChild(bubble("you", text));
        setTimeout(function () { t.appendChild(bubble("claude", "Noted. I'll pick it up after this job. Switch to Lumen to watch subagents work live.")); }, reduce ? 0 : 600);
        return;
      }
      auto = false;
      tx.appendChild(bubble("you", text));
      main.set("thinking"); pulse.textContent = "Thinking…";
      setTimeout(function () {
        var a = custom(text);
        var ok = list.querySelectorAll(".fa-card:not(.done)").length < 3;
        tx.appendChild(bubble("claude", ok ? "One subagent for this: " + a.m + ", in its own worktree." : "Three helpers are busy. I'll start this one as soon as a slot frees up."));
        if (ok) { tx.appendChild(trow(true, "Agent", "[" + a.m.split(" ")[0].toLowerCase() + ": your request] " + a.t, "launched")); spawn(a); }
        else status();
      }, reduce ? 0 : 700);
    }

    function press() {
      auto = false;
      open("lumen");
      key.classList.add("lit"); setTimeout(function () { key.classList.remove("lit"); }, 140);
      spawn();
    }
    q("[data-spawn]").addEventListener("click", press);
    document.addEventListener("keydown", function (e) {
      if (e.key !== "s" && e.key !== "S") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/input|textarea|select/i.test((e.target && e.target.tagName) || "")) return;
      var r = ws.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      press();
    });

    ws.addEventListener("click", function (e) {
      var t = e.target;
      var w = t.closest(".fw-ws");
      if (w) { open(w.dataset.ws || "lumen"); return; }
      if (t.closest(".stop")) {
        if (current === "lumen") { live.forEach(function (c) { c.halt(); }); status(true); }
        else { var v = views[current]; v.m.set("ready"); t.closest(".fw-pulse").querySelector("[data-pulse]").textContent = "Stopped"; t.closest(".stop").style.opacity = 0; }
        return;
      }
      if (t.closest(".send")) { var inp = t.closest(".fw-comp").querySelector("input"); ask(inp.value); inp.value = ""; inp.focus(); return; }
      var pk = t.closest(".pk");
      if (pk) {
        var all = Array.prototype.indexOf.call(pk.parentNode.querySelectorAll(".pk"), pk);
        if (all === 1) { model = (model + 1) % models.length; pk.textContent = "▣ " + models[model][0] + " ▾"; }
        if (all === 2) { effort = (effort + 1) % efforts.length; pk.textContent = "◔ " + efforts[effort] + " ▾"; }
        if (all === 0) { pk.textContent = pk.textContent.indexOf("Auto") >= 0 ? "✦ Plan ▾" : "✦ Auto ▾"; }
        pk.classList.remove("bump"); void pk.offsetWidth; pk.classList.add("bump");
        return;
      }
      var perm = t.closest(".perm");
      if (perm && (t.closest("[data-allow]") || t.closest("[data-deny]"))) {
        var allow = !!t.closest("[data-allow]"), v2 = views[current];
        perm.replaceWith(trow(allow, "Bash", v2.ask, allow ? "pushed · build 318" : "denied"));
        v2.m.set(allow ? "celebrating" : "ready");
        panes[current].querySelector("[data-pulse]").textContent = allow ? "Pushed. Landed on main" : "Kept local. Nothing pushed";
        panes[current].querySelector("[data-sub]").textContent = "Ready";
        setTimeout(function () { v2.m.set("ready"); }, reduce ? 0 : 3000);
        return;
      }
      var card = t.closest(".fa-card");
      if (card) card.classList.toggle("open");
    });
    ws.addEventListener("keydown", function (e) {
      if (e.target.matches(".fw-comp input") && e.key === "Enter") { ask(e.target.value); e.target.value = ""; e.preventDefault(); }
      if ((e.key === "Enter" || e.key === " ") && e.target.closest(".fw-ws")) { e.preventDefault(); open(e.target.closest(".fw-ws").dataset.ws || "lumen"); }
    });
    ws.addEventListener("mouseover", function (e) {
      var c = e.target.closest("canvas.mascot"); if (!c || !c._m) return;
      var m = c._m; if (m.mood === "greeting") return;
      if (m.mood === "ready" || m.mood === "sleepy" || m.mood === "waiting") { m._back = m.mood; m.set("greeting"); }
    });
    ws.addEventListener("mouseout", function (e) {
      var c = e.target.closest("canvas.mascot"); if (!c || !c._m) return;
      var m = c._m; if (m.mood === "greeting" && m._back) { m.set(m._back); m._back = null; }
    });

    onView(ws, async function () {
      main.set("thinking"); pulse.textContent = "Thinking…";
      await wait(700);
      for (var k = 0; k < 3 && auto; k++) { spawn(); await wait(800); }
    });
  }

  var vm = document.getElementById("vm-demo");
  if (vm) {
    var steps = vm.querySelectorAll(".vm-step");
    var log = vm.querySelector(".vm-log");
    var el = vm.querySelector(".el");
    var res = vm.querySelector(".vm-res");
    var btn = vm.querySelector("[data-run]");
    var lines = [
      ["queue", "waiting for a VM slot · slot 2 free"],
      ["clone", "cloning base image · instant (copy on write)"],
      ["boot", "booting headless macOS · 14 s"],
      ["sync", "copying lumen-web · 6 s"],
      ["run", "xcodebuild test · 11 UI tests"],
      ["copy back", "results, log and 4 screenshots"],
      ["done", '<span class="ok">PASS · 11 of 11 · wall 2m 51s</span>']
    ];
    var busy = false, timer = null;
    async function run() {
      if (busy) return; busy = true; btn.disabled = true;
      steps.forEach(function (s) { s.classList.remove("now", "done"); });
      log.innerHTML = ""; res.innerHTML = "";
      var t0 = Date.now();
      clearInterval(timer);
      timer = setInterval(function () { var s = Math.floor((Date.now() - t0) / 1000); el.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }, 250);
      for (var i = 0; i < steps.length; i++) {
        if (i > 0) { steps[i - 1].classList.remove("now"); steps[i - 1].classList.add("done"); }
        steps[i].classList.add("now");
        var d = document.createElement("div"); d.innerHTML = "› " + lines[i][1]; log.appendChild(d);
        while (log.children.length > 4) log.removeChild(log.firstChild);
        await wait(i === 4 ? 1500 : 800);
      }
      steps[steps.length - 1].classList.remove("now"); steps[steps.length - 1].classList.add("done");
      clearInterval(timer);
      res.innerHTML = '<span class="pill">✓ Passed</span><span class="shots"><i></i><i style="animation-delay:.06s"></i><i style="animation-delay:.12s"></i><i style="animation-delay:.18s"></i></span>';
      busy = false; btn.disabled = false;
    }
    btn.addEventListener("click", run);
    onView(vm, run);
  }

  var kb = document.getElementById("kb-demo");
  if (kb) {
    var dragged = null, kauto = true;
    kb.addEventListener("dragstart", function (e) { var c = e.target.closest(".kb-card"); if (!c) return; kauto = false; dragged = c; c.classList.add("drag"); e.dataTransfer.effectAllowed = "move"; });
    kb.addEventListener("dragend", function () { if (dragged) dragged.classList.remove("drag"); dragged = null; kb.querySelectorAll(".kb-col").forEach(function (c) { c.classList.remove("over"); }); });
    kb.querySelectorAll(".kb-col").forEach(function (col) {
      col.addEventListener("dragover", function (e) { e.preventDefault(); col.classList.add("over"); });
      col.addEventListener("dragleave", function () { col.classList.remove("over"); });
      col.addEventListener("drop", function (e) { e.preventDefault(); col.classList.remove("over"); if (dragged) { col.appendChild(dragged); dragged.classList.add("flash"); counts(); } });
    });
    kb.addEventListener("keydown", function (e) {
      var c = e.target.closest(".kb-card"); if (!c) return;
      var cols = Array.prototype.slice.call(kb.querySelectorAll(".kb-col"));
      var i = cols.indexOf(c.parentNode);
      if (e.key === "ArrowRight" && i < cols.length - 1) { kauto = false; cols[i + 1].appendChild(c); c.focus(); counts(); }
      if (e.key === "ArrowLeft" && i > 0) { kauto = false; cols[i - 1].appendChild(c); c.focus(); counts(); }
    });
    function counts() { kb.querySelectorAll(".kb-col").forEach(function (c) { c.querySelector("h4 span").textContent = c.querySelectorAll(".kb-card").length; }); }
    function follow(col) { if (kb.scrollWidth > kb.clientWidth + 1) kb.scrollTo({ left: col.offsetLeft - 14, behavior: reduce ? "auto" : "smooth" }); }
    var coarse = window.matchMedia("(pointer: coarse)");
    kb.addEventListener("click", function (e) {
      if (!coarse.matches) return;
      var c = e.target.closest(".kb-card"); if (!c) return;
      var cols = Array.prototype.slice.call(kb.querySelectorAll(".kb-col"));
      var next = cols[cols.indexOf(c.parentNode) + 1]; if (!next) return;
      kauto = false; next.appendChild(c); c.classList.remove("flash"); void c.offsetWidth; c.classList.add("flash"); counts(); follow(next);
    });
    onView(kb, async function () {
      var card = kb.querySelector('[data-auto]');
      var cols = kb.querySelectorAll(".kb-col");
      var who = card.querySelector(".who");
      var labels = ["", "Claude picked it up", "Claude · verifying", "Landed · build 551"];
      for (var i = 1; i < 4 && kauto; i++) {
        await wait(1300); if (!kauto) break;
        cols[i + 1].appendChild(card); who.textContent = labels[i]; card.classList.remove("flash"); void card.offsetWidth; card.classList.add("flash"); counts(); follow(cols[i + 1]);
      }
    });
    counts();
  }

  var hm = document.getElementById("hm-demo");
  if (hm) {
    var tiles = hm.querySelectorAll(".hm-tile");
    function countUp(t) {
      var n = t.querySelector(".n"), to = +n.dataset.to, s = performance.now();
      if (reduce) { n.textContent = to; return; }
      (function f(now) { var p = Math.min(1, (now - s) / 700); n.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(s);
    }
    tiles.forEach(function (t) {
      t.addEventListener("click", function () { tiles.forEach(function (o) { o.classList.remove("lit"); }); t.classList.add("lit"); countUp(t); });
    });
    onView(hm, async function () {
      for (var i = 0; i < tiles.length; i++) { tiles[i].classList.add("lit"); countUp(tiles[i]); await wait(160); }
      await wait(900);
      tiles.forEach(function (t, i) { if (i) t.classList.remove("lit"); });
    });
  }
})();
