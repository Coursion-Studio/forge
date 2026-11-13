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
    { t: "Search index migration", m: "sonnet", c: "#389EFF", kind: "worker", steps: ["Reading src/search", "Editing trigram.ts", "Verifying · 214 tests", "Landed on main"] },
    { t: "Review: signed cookies", m: "opus", c: "#C75CEB", kind: "reviewer", steps: ["Reading the diff", "Running the suite", "Checking edge cases", "Approved, 2 notes"] },
    { t: "Find every price helper", m: "haiku", c: "#3DDC97", kind: "explorer", steps: ["Searching 1,204 files", "Reading 14 files", "Summarising", "Done · $0.02"] },
    { t: "Upload progress bar", m: "sonnet", c: "#FFB547", kind: "worker", steps: ["Queued for a build slot", "Editing Upload.swift", "Testing in the VM", "Landed on main"] },
    { t: "Docs for the new API", m: "haiku", c: "#2FD3C9", kind: "explorer", steps: ["Reading routes", "Writing docs/api.md", "Checking links", "Done · $0.01"] }
  ];

  var ws = document.getElementById("ws-demo");
  if (ws) {
    var list = ws.querySelector(".ws-agents .list");
    var count = ws.querySelector("[data-count]");
    var pulse = ws.querySelector("[data-pulse]");
    var key = ws.querySelector(".kc");
    var next = 0, running = 0, auto = true;

    function spawn() {
      if (list.children.length >= 4) list.removeChild(list.lastElementChild);
      var a = agents[next % agents.length]; next++;
      var el = document.createElement("div");
      el.className = "sa"; el.style.setProperty("--c", a.c);
      el.innerHTML = '<div class="h"><span class="dot live" style="--c:' + a.c + '"></span><span class="t">' + a.t + '</span></div>' +
        '<div class="chips"><span class="chip on" style="--c:' + a.c + '">' + a.m + '</span><span class="chip">' + a.kind + '</span></div>' +
        '<div class="now">' + a.steps[0] + '</div><div class="bar"><i></i></div>';
      list.insertBefore(el, list.firstChild);
      running = list.querySelectorAll(".sa:not(.done)").length; count.textContent = running + " running";
      pulse.textContent = "Working · " + running + " subagent" + (running === 1 ? "" : "s");
      var now = el.querySelector(".now"), bar = el.querySelector(".bar i"), i = 0;
      (function step() {
        bar.style.width = ((i + 1) / a.steps.length * 100) + "%";
        now.textContent = a.steps[i];
        if (i === a.steps.length - 1) {
          el.classList.add("done"); el.querySelector(".dot").classList.remove("live");
          running = list.querySelectorAll(".sa:not(.done)").length; count.textContent = running + " running";
          pulse.textContent = running ? "Working · " + running + " subagent" + (running === 1 ? "" : "s") : "Ready";
          return;
        }
        i++; setTimeout(step, reduce ? 0 : 1100 + Math.random() * 900);
      })();
    }
    function press() {
      auto = false;
      key.classList.add("lit"); setTimeout(function () { key.classList.remove("lit"); }, 140);
      spawn();
    }
    ws.querySelector("[data-spawn]").addEventListener("click", press);
    document.addEventListener("keydown", function (e) {
      if (e.key !== "s" && e.key !== "S") return;
      if (/input|textarea/i.test((e.target && e.target.tagName) || "")) return;
      var r = ws.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      press();
    });
    onView(ws, async function () {
      for (var k = 0; k < 3 && auto; k++) { spawn(); await wait(900); }
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
    function count(t) {
      var n = t.querySelector(".n"), to = +n.dataset.to, s = performance.now();
      if (reduce) { n.textContent = to; return; }
      (function f(now) { var p = Math.min(1, (now - s) / 700); n.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(s);
    }
    tiles.forEach(function (t) {
      t.addEventListener("click", function () { tiles.forEach(function (o) { o.classList.remove("lit"); }); t.classList.add("lit"); count(t); });
    });
    onView(hm, async function () {
      for (var i = 0; i < tiles.length; i++) { tiles[i].classList.add("lit"); count(tiles[i]); await wait(160); }
      await wait(900);
      tiles.forEach(function (t, i) { if (i) t.classList.remove("lit"); });
    });
  }
})();
