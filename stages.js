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
    var list = q("[data-list]"), count = q("[data-count]"), pulse = q("[data-pulse]"), key = q(".kc");
    var elx = q("[data-el]"), clock = q("[data-clock]"), side = q("[data-side]"), sub = q("[data-sub]");
    var costEl = q("[data-cost]"), tokEl = q("[data-tok]"), timeEl = q("[data-time]"), stop = q(".stop");
    var row = q("[data-agent-row]"), rowN = q("[data-agent-n]"), build = q("[data-build]");
    var pane = new ForgeMascot(q("[data-mascot]"), { mood: "ready" });
    var lumen = new ForgeMascot(q('[data-ws-mascot="lumen"]'), { mood: "ready" });
    var main = { set: function (m) { pane.set(m); lumen.set(m); } };
    var subN = q("[data-sub-n]");
    var others = {
      tidepool: [["Testing in the VM · 11 UI tests", "working", ""], ["Reading crash log", "reading", ""], ["Editing PhotoGrid.swift", "editing", ""], ["Build passed · ready to land", "celebrating", "ok"]],
      atlas: [["Fixing a flaky test", "editing", ""], ["forge-verify · 82 tests", "working", ""], ["Needs your OK to push", "waiting", "att"], ["Landed on main", "celebrating", "ok"]],
      orbit: [["Planning the onboarding", "thinking", ""], ["2 helpers working", "helpers", ""], ["Reviewing the diff", "reading", ""], ["Ready", "ready", ""]],
      nook: [["Idle · 3h", "sleepy", ""]],
      vista: [["Idle · 2d", "sleepy", ""]]
    };
    Object.keys(others).forEach(function (k, n) {
      var row = q('[data-ws="' + k + '"]'), seq = others[k], m = new ForgeMascot(row.querySelector("canvas"), { mood: seq[0][1] });
      var label = row.querySelector("small"), tm = row.querySelector(".tm"), j = 0;
      var t0 = Date.now() - (parseInt(tm.textContent, 10) * 60 + parseInt(tm.textContent.split(":")[1] || 0, 10)) * 1000;
      function show() { label.textContent = seq[j][0]; label.className = seq[j][2]; m.set(seq[j][1]); }
      show();
      if (seq.length < 2) return;
      tm.classList.add("live");
      if (!reduce) setInterval(function () { tm.textContent = fmt(Math.floor((Date.now() - t0) / 1000)); }, 1000);
      (function cycle() {
        setTimeout(function () { j = (j + 1) % seq.length; show(); cycle(); }, reduce ? 1e9 : 2600 + n * 700 + Math.random() * 1800);
      })();
    });
    var next = 0, auto = true, started = 0, cost = 0, tok = 0, launched = 0, ticking = null, settle = null;

    function fmt(s) { return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
    function tick() {
      var s = Math.floor((Date.now() - started) / 1000);
      elx.textContent = s + "s"; clock.textContent = fmt(s); timeEl.textContent = fmt(s);
    }
    function running() { return list.querySelectorAll(".fa-card:not(.done)").length; }
    function status() {
      var n = running();
      count.textContent = n + " running · " + list.querySelectorAll(".fa-card.done").length + " done";
      costEl.textContent = "≈$" + cost.toFixed(2);
      tokEl.textContent = tok >= 1000 ? (tok / 1000).toFixed(1) + "M" : tok.toFixed(1) + "k";
      rowN.textContent = launched + " launched"; subN.textContent = launched + " agent" + (launched === 1 ? "" : "s");
      if (n) {
        clearTimeout(settle);
        main.set("helpers"); pulse.textContent = n + " helper" + (n === 1 ? "" : "s") + " still working";
        side.textContent = "Running " + n + " agent" + (n === 1 ? "" : "s"); sub.textContent = "Waiting on subagents";
        stop.style.opacity = 1; row.querySelector("i").className = "spin";
        if (!ticking) { started = started || Date.now(); ticking = setInterval(tick, 500); }
      } else {
        clearInterval(ticking); ticking = null;
        main.set("celebrating"); pulse.textContent = "All " + launched + " subagents finished";
        side.textContent = "Done · " + launched + " agents"; sub.textContent = "Ready";
        stop.style.opacity = 0; row.querySelector("i").className = "ok"; row.querySelector("i").textContent = "✓";
        build.style.opacity = 0;
        settle = setTimeout(function () { main.set("ready"); pulse.textContent = "Ready"; }, reduce ? 0 : 3200);
      }
    }
    function spawn() {
      var done = list.querySelectorAll(".fa-card.done");
      if (list.children.length >= 3 && !done.length) return;
      if (list.children.length >= 3) list.removeChild(done[done.length - 1]);
      var a = agents[next % agents.length]; next++; launched++;
      var el = document.createElement("div");
      el.className = "fa-card";
      el.innerHTML = '<div class="fa-top"><canvas class="mascot"></canvas><div><div class="t">' + a.t + '</div>' +
        '<div class="chips"><span class="mc" style="--c:' + tierColor[a.tier] + '">' + a.m + '</span><span class="ty">' + a.ty + '</span></div></div>' +
        '<span class="st">running</span></div>' +
        '<div class="now"></div><div class="prog"><div class="bar"><i></i></div><span class="pct">0%</span></div><div class="meta"></div>';
      var firstDone = list.querySelector(".fa-card.done");
      list.insertBefore(el, firstDone);
      var crew = new ForgeMascot(el.querySelector("canvas"), { crew: { tier: a.tier, role: a.role }, mood: "delegating" });
      var now = el.querySelector(".now"), bar = el.querySelector(".bar i"), pct = el.querySelector(".pct"), meta = el.querySelector(".meta");
      var t0 = Date.now(), i = 0, ctx = 2 + Math.floor(Math.random() * 3);
      main.set("delegating"); pulse.textContent = "Delegating to " + a.t;
      status();
      (function step() {
        var s = a.steps[i], p = Math.round((i + 1) / a.steps.length * 100);
        now.textContent = s[0]; bar.style.width = p + "%"; pct.textContent = p + "%";
        var secs = Math.max(1, Math.round((Date.now() - t0) / 1000) * 7);
        meta.textContent = "ctx " + (ctx + i) + "% · " + (a.tok * (i + 1) / a.steps.length).toFixed(1) + "k ≈$" + (a.cost * (i + 1) / a.steps.length).toFixed(2) + " " + fmt(secs);
        cost += a.cost / a.steps.length; tok += a.tok / a.steps.length;
        crew.set(s[1]);
        if (i === a.steps.length - 1) {
          el.classList.add("done"); el.querySelector(".st").textContent = "done";
          list.appendChild(el);
          setTimeout(function () { crew.set("ready"); }, reduce ? 0 : 4000);
          status();
          return;
        }
        status();
        i++; setTimeout(step, reduce ? 0 : 1300 + Math.random() * 1100);
      })();
    }
    function press() {
      auto = false;
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
    onView(kb, async function () {
      var card = kb.querySelector('[data-auto]');
      var cols = kb.querySelectorAll(".kb-col");
      var who = card.querySelector(".who");
      var labels = ["", "Claude picked it up", "Claude · verifying", "Landed · build 551"];
      for (var i = 1; i < 4 && kauto; i++) {
        await wait(1300); if (!kauto) break;
        cols[i + 1].appendChild(card); who.textContent = labels[i]; card.classList.remove("flash"); void card.offsetWidth; card.classList.add("flash"); counts();
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
