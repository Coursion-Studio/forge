(function () {
  var root = document.getElementById("ld-demo");
  if (!root || !window.ForgeMascot) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]static\b/.test(location.search);
  var NS = "http://www.w3.org/2000/svg";
  var svg = root.querySelector("[data-ld-svg]"), queueEl = root.querySelector("[data-ld-queue]");
  var stepsEl = root.querySelector("[data-ld-steps]"), term = root.querySelector("[data-ld-term]");
  var buildEl = root.querySelector("[data-ld-build]"), idle = root.querySelector("[data-ld-idle]");
  var W = 1000, H = 150, MY = 126, X0 = 40, DX = 62, BX = 34;
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  var build = 551;
  var main = [{}, {}, {}, {}, {}];
  var branches = [
    { name: "forge/search-index", short: "search-index", who: "forge-worker", model: "Sonnet 5.5", tier: "medium", role: "builder", c: "#4D9BFF", lane: 30, fork: 2, commits: 3, tree: "9f3c2e1", fail: false },
    { name: "agent-7c1e/upload-retry", short: "upload-retry", who: "forge-worker", model: "Haiku 5.5", tier: "light", role: "builder", c: "#5CD985", lane: 62, fork: 3, commits: 2, tree: "7c1e0b4", fail: true },
    { name: "agent-b02d/dark-mode", short: "dark-mode", who: "forge-worker", model: "Opus 5.5", tier: "careful", role: "builder", c: "#FFB33D", lane: 94, fork: 4, commits: 4, tree: "b02d9aa", fail: false }
  ];
  branches.forEach(function (b) { b.state = "ready"; });

  function wait(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); }
  function mx(i) { return X0 + i * DX; }
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(e); return e;
  }

  function draw(fresh) {
    svg.innerHTML = "";
    var defs = el("defs", {});
    var g = el("filter", { id: "ldglow", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
    el("feGaussianBlur", { stdDeviation: "3.5" }, g);
    var headX = mx(main.length - 1);
    el("line", { x1: 10, y1: MY, x2: headX, y2: MY, class: "ld-main" });
    el("line", { x1: headX, y1: MY, x2: W - 20, y2: MY, class: "ld-main future" });
    branches.forEach(function (b) {
      if (b.gone) return;
      var fx = mx(b.fork), sx = fx + 34, tip = sx + (b.commits - 1) * BX;
      var cls = "ld-br " + b.state;
      var p = el("path", { d: "M" + fx + " " + MY + " C" + (fx + 18) + " " + MY + " " + (fx + 10) + " " + b.lane + " " + sx + " " + b.lane + " L" + tip + " " + b.lane, class: cls, stroke: b.state === "failed" ? "#FF6B6B" : b.c });
      if (fresh === b) p.classList.add("draw");
      for (var i = 0; i < b.commits; i++) el("circle", { cx: sx + i * BX, cy: b.lane, r: i === b.commits - 1 ? 6 : 4.5, class: "ld-dot " + b.state, fill: b.state === "failed" ? "#FF6B6B" : b.c });
      var t = el("text", { x: tip + 14, y: b.lane + 4, class: "ld-lbl " + b.state });
      t.textContent = b.short + (b.state === "failed" ? "  · gate failed" : b.state === "fixing" ? "  · fixing" : b.state === "landing" ? "  · landing" : "");
      if (b.merging) {
        var nx = mx(main.length);
        el("path", { d: "M" + tip + " " + b.lane + " C" + (tip + 30) + " " + b.lane + " " + (nx - 30) + " " + MY + " " + nx + " " + MY, class: "ld-br merge draw", stroke: b.c });
      }
    });
    main.forEach(function (m, i) {
      var x = mx(i);
      if (m.c) el("circle", { cx: x, cy: MY, r: 11, fill: m.c, opacity: 0.45, filter: "url(#ldglow)", class: m.isNew ? "ld-halo" : "" });
      el("circle", { cx: x, cy: MY, r: m.c ? 6.5 : 5, class: "ld-mdot", fill: m.c || "#8a86a8" });
      if (m.label) { var t = el("text", { x: x, y: MY + 22, class: "ld-mlbl", "text-anchor": "middle" }); t.textContent = m.label; }
    });
    var hl = el("text", { x: 12, y: MY - 12, class: "ld-name" }); hl.textContent = "main";
  }

  var stepDefs = [["rebase", "Rebase onto main"], ["gate", "Run the gate"], ["ff", "Fast-forward, bump build"], ["clean", "Remove worktree and branch"]];
  function steps(state) {
    stepsEl.innerHTML = stepDefs.map(function (s, i) {
      return '<div class="ld-step ' + (state[i] || "") + '"><i>' + (state[i] === "done" ? "✓" : state[i] === "fail" ? "✕" : i + 1) + "</i><span>" + s[1] + "</span></div>";
    }).join("");
  }
  function line(html, cls) {
    var d = document.createElement("div"); d.innerHTML = html; if (cls) d.className = cls;
    term.appendChild(d); while (term.children.length > 7) term.removeChild(term.firstChild);
  }

  var mascots = {};
  function card(b, i) {
    var c = document.createElement("div");
    c.className = "ld-card"; c.dataset.i = i; c.style.setProperty("--c", b.c);
    c.innerHTML = '<canvas class="mascot"></canvas><div class="tx"><b>' + b.name + '</b><div class="meta"><span class="mc">' + b.model + '</span><span>' + b.commits + ' commits</span></div><div class="proof"></div></div><button type="button" class="ld-go">Land</button>';
    queueEl.appendChild(c);
    mascots[i] = new ForgeMascot(c.querySelector("canvas"), { crew: { tier: b.tier, role: b.role }, mood: "ready" });
    paint(b, i);
  }
  function paint(b, i) {
    var c = queueEl.querySelector('[data-i="' + i + '"]'); if (!c) return;
    c.className = "ld-card " + b.state;
    var pr = c.querySelector(".proof"), btn = c.querySelector(".ld-go");
    btn.disabled = b.state !== "ready";
    btn.textContent = { ready: "Land", queued: "Queued", landing: "Landing…", failed: "Sent back", fixing: "Fixing…", landed: "Landed" }[b.state] || "Land";
    pr.innerHTML = {
      ready: '<span class="ok">✓</span> verified · tree ' + b.tree,
      queued: "waiting for the land lock",
      landing: "rebasing and running your gate",
      failed: '<span class="bad">✕</span> gate failed · sent to ' + b.who,
      fixing: b.who + " is fixing the failing test",
      landed: '<span class="ok">✓</span> on main · build ' + b.landedAs
    }[b.state] || "";
    var m = mascots[i];
    if (m) m.set({ ready: "ready", queued: "ready", landing: "working", failed: "waiting", fixing: "editing", landed: "celebrating" }[b.state] || "ready");
  }

  var busy = false, q = [], auto = true, installTarget = 0, waitingAgents = 0, idleTimer = null;
  function request(i) {
    var b = branches[i]; if (b.state !== "ready") return;
    if (busy) { b.state = "queued"; paint(b, i); q.push(i); return; }
    land(i);
  }
  async function land(i) {
    busy = true;
    var b = branches[i];
    b.state = "landing"; paint(b, i); draw();
    term.innerHTML = "";
    var st = ["now"]; steps(st);
    line('<span class="p">land</span> ' + b.name + ' <span class="dim">· lock taken</span>');
    await wait(700);
    b.fork = main.length - 1; draw(b);
    line("rebased " + b.commits + " commits onto main · no conflicts");
    st = ["done", "now"]; steps(st);
    await wait(600);
    line('<span class="p">$</span> pnpm test && pnpm build');
    await wait(700);
    if (b.fail) {
      line("✓ 211 passed", "dim");
      await wait(500);
      line("✕ upload.spec.ts › retries twice on 503", "bad");
      line("&nbsp;&nbsp;expected 2 attempts, got 3", "bad");
      steps(["done", "fail"]);
      b.state = "failed"; paint(b, i); draw();
      await wait(600);
      line('<span class="p">→</span> sent to ' + b.who + " with the failing lines · lock released", "warn");
      b.fail = false;
      busy = false; next();
      await wait(2200);
      b.state = "fixing"; paint(b, i); draw();
      await wait(2600);
      b.commits += 1; b.tree = "51d0aa7"; b.state = "ready"; paint(b, i); draw(b);
      if (auto) { await wait(900); if (auto && b.state === "ready") request(i); }
      return;
    }
    line("✓ 214 passed · build ok", "ok");
    st = ["done", "done", "now"]; steps(st);
    await wait(500);
    b.merging = true; draw();
    await wait(reduce ? 0 : 750);
    build += 1; b.landedAs = build; buildEl.textContent = build;
    main.forEach(function (m) { m.isNew = false; });
    main.push({ c: b.c, label: "build " + build, isNew: true });
    b.merging = false; b.gone = true;
    line("fast-forwarded main · bumped to build " + build, "ok");
    st = ["done", "done", "done", "now"]; steps(st);
    draw();
    await wait(500);
    line("removed worktree and branch " + b.name.split("/")[0], "dim");
    steps(["done", "done", "done", "done"]);
    b.state = "landed"; paint(b, i);
    var c = queueEl.querySelector('[data-i="' + i + '"]');
    setTimeout(function () { if (c) c.classList.add("leave"); }, reduce ? 0 : 1800);
    setTimeout(function () { if (c) c.remove(); if (!queueEl.children.length) queueEl.innerHTML = '<div class="ld-empty">All landed. Nothing waiting.</div>'; }, reduce ? 0 : 2300);
    installWhenIdle(build);
    busy = false; next();
  }
  function next() { if (q.length && !busy) { var i = q.shift(); branches[i].state = "ready"; land(i); } }

  function installWhenIdle(n) {
    installTarget = n; waitingAgents = Math.max(waitingAgents, 2);
    clearTimeout(idleTimer);
    (function tick() {
      var s = idle.querySelector("span");
      idle.className = "ld-idle wait";
      if (waitingAgents > 0) {
        s.textContent = "Install build " + installTarget + " when idle · waiting for " + waitingAgents + " agent" + (waitingAgents === 1 ? "" : "s");
        waitingAgents--; idleTimer = setTimeout(tick, reduce ? 0 : 2600); return;
      }
      if (busy || branches.some(function (b) { return b.state === "landing" || b.state === "fixing" || b.state === "failed" || b.state === "queued"; })) {
        s.textContent = "Install build " + installTarget + " when idle · an agent is still working";
        idleTimer = setTimeout(tick, reduce ? 0 : 1500); return;
      }
      s.textContent = "Installing build " + installTarget + "…";
      idleTimer = setTimeout(function () { idle.className = "ld-idle done"; s.textContent = "Installed build " + installTarget + " · every agent was idle"; }, reduce ? 0 : 1600);
    })();
  }

  branches.forEach(card);
  steps([]);
  draw();
  queueEl.addEventListener("click", function (e) {
    var b = e.target.closest(".ld-go"); if (!b) return;
    auto = false; request(+b.closest(".ld-card").dataset.i);
  });
  function go() {
    if (!auto) return;
    request(0);
    setTimeout(function () { if (auto) request(1); }, reduce ? 0 : 400);
  }
  if (reduce || !("IntersectionObserver" in window)) go();
  else { var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); setTimeout(go, 700); } }, { threshold: 0.45 }); io.observe(root); }
})();
