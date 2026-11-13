(function () {
  var root = document.getElementById("pp-demo");
  if (!root) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]static\b/.test(location.search);
  var small = window.matchMedia("(max-width: 760px)");
  var dock = root.querySelector(".pp-dock"), grid = root.querySelector(".pp-grid"), nEl = root.querySelector("[data-pp-n]");
  function svg(b) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + b + "</svg>"; }

  var tools = [
    { id: "claude", n: "Claude Code", d: "native UI or TUI", a: "#F0A07A", b: "#C2502E", g: svg('<path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/>') },
    { id: "subagents", n: "Subagents", d: "cards and a live feed", a: "#8FB8FF", b: "#3A5BFF", g: svg('<rect x="3" y="4" width="8" height="7" rx="2"/><rect x="13" y="4" width="8" height="7" rx="2"/><rect x="3" y="13" width="8" height="7" rx="2"/><rect x="13" y="13" width="8" height="7" rx="2" fill="currentColor"/>') },
    { id: "terminal", n: "Terminal", d: "command blocks", a: "#5BE3A0", b: "#138A5E", g: svg('<path d="M5 7l5 5-5 5M12 18h7"/>') },
    { id: "board", n: "Board", d: "kanban in your repo", a: "#FFCF6B", b: "#E07B12", g: svg('<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/>') },
    { id: "schedules", n: "Schedules", d: "recurring tasks", a: "#6FE6DD", b: "#1690A0", g: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>') },
    { id: "builds", n: "Builds", d: "queue, VMs, installs", a: "#FF8FB1", b: "#D02A62", g: svg('<path d="M14.5 6.5l3 3M4 20l8.5-8.5"/><path d="M13 4l7 7-2.5 2.5-7-7z" fill="currentColor"/>') },
    { id: "land", n: "Land", d: "verified merges", a: "#C9A2FF", b: "#7B3FE4", g: svg('<circle cx="6" cy="5" r="2.2"/><circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="9" r="2.2"/><path d="M6 7.2v9.6M18 11.2c0 4-6 3-11 6"/>') },
    { id: "reports", n: "Reports", d: "Sentry and PostHog", a: "#8FD0FF", b: "#2F6FE0", g: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>') },
    { id: "endpoints", n: "Endpoints", d: "health checks", a: "#7EF0B0", b: "#16946A", g: svg('<path d="M3 12h4l2.5-6 5 12 2.5-6h4"/>') },
    { id: "markdown", n: "Markdown", d: "docs and plans", a: "#FFD08A", b: "#C7792A", g: svg('<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M6 15V9l2.5 3L11 9v6M16 9v6M13.8 12.8 16 15l2.2-2.2"/>') },
    { id: "logtail", n: "Log tail", d: "follow any file", a: "#9FE7FF", b: "#2A86B8", g: svg('<path d="M4 6h16M4 10h12M4 14h16M4 18h9"/>') },
    { id: "secrets", n: "Secrets", d: "Keychain, on request", a: "#FF9F9F", b: "#C93A4A", g: svg('<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><circle cx="12" cy="15.5" r="1.4" fill="currentColor"/>') }
  ];
  var byId = {}; tools.forEach(function (t) { byId[t.id] = t; });

  function bodyFor(id) {
    switch (id) {
      case "claude": return '<div class="pv-chat"><div class="u">Round the cart total once and add a test.</div><div class="r"><i class="ok">✓</i><b>Edit</b> cart/summary.ts <em>+4 −2</em></div><div class="r"><i class="ok">✓</i><b>Bash</b> pnpm test <em>214 passed</em></div><div class="a">Rounded once, at the end. Test added and green.<span class="caret"></span></div></div>';
      case "subagents": return '<div class="pv-subs">' + [["Search migration", "#4D9BFF", 72], ["Review cookies", "#FFB33D", 45], ["Price helpers", "#5CD985", 100]].map(function (s) {
        return '<div class="s"><span class="dot" style="--c:' + s[1] + '"></span><b>' + s[0] + '</b><span class="bar"><i style="--w:' + s[2] + '%;--c:' + s[1] + '"></i></span></div>'; }).join("") + "</div>";
      case "terminal": return '<div class="pv-term"><div class="blk pass"><span class="p">~/lumen ❯</span> pnpm test<div class="o">✓ 214 passed <em>1.8s</em></div></div><div class="blk"><span class="p">~/lumen ❯</span> git status -s<div class="o">M cart/summary.ts</div></div><div class="blk cur"><span class="p">~/lumen ❯</span> <span class="typed"></span><span class="caret"></span></div></div>';
      case "board": return '<div class="pv-board"><div><h6>To do</h6><p>Dark mode</p><p>Upload retry</p></div><div><h6>Doing</h6><p class="hot">Cart rounding</p></div><div><h6>Done</h6><p>Trigram search</p></div></div>';
      case "schedules": return '<div class="pv-list"><div><b>Triage new Sentry issues</b><span>weekdays 9:00</span><em>in 14h</em></div><div><b>Weekly crash report</b><span>Mondays 8:00</span><em>in 3d</em></div><div><b>Bump dependencies</b><span>1st of month</span><em>in 18d</em></div></div>';
      case "builds": return '<div class="pv-list"><div><b>lumen · gate</b><span class="bar"><i style="--w:68%;--c:#FF5189"></i></span><em>slot 1</em></div><div><b>tidepool · UI tests</b><span class="bar"><i style="--w:35%;--c:#2FD3C9"></i></span><em>VM 2</em></div><div><b>atlas · build</b><span>queued</span><em>next</em></div></div>';
      case "land": return '<div class="pv-land"><code>worktree-agent-3f2a</code><div class="steps"><span class="on">rebase</span><span class="on">gate</span><span class="on">fast-forward</span><span class="on">bump</span></div><div class="ok">Landed on main · build 551</div></div>';
      case "reports": return '<div class="pv-rep"><div class="bars">' + [40, 55, 48, 70, 62, 85, 78].map(function (h) { return '<i style="--h:' + h + '%"></i>'; }).join("") + '</div><div class="kpi"><b>99.6%</b><span>crash-free</span><b>1,284</b><span>weekly users</span></div></div>';
      case "endpoints": return '<div class="pv-list ep"><div><i class="g"></i><b>API (prod)</b><em>142 ms</em></div><div><i class="g"></i><b>Web</b><em>88 ms</em></div><div><i class="y"></i><b>Staging</b><em>slow · 1.4 s</em></div></div>';
      case "markdown": return '<div class="pv-md"><h5>Billing split</h5><p>Three steps, each behind a flag.</p><ul><li>Move plans to <code>billing/</code></li><li>Dual-write invoices</li><li>Cut over on Monday</li></ul></div>';
      case "logtail": return '<div class="pv-log"></div>';
      case "secrets": return '<div class="pv-sec"><div><b>STRIPE_KEY</b><span>••••••••</span></div><div><b>SENTRY_TOKEN</b><span>••••••••</span></div><div class="ask">Claude asks for <b>STRIPE_KEY</b><button type="button" data-sec>Allow once</button></div></div>';
    }
    return "";
  }

  var logLines = ["GET /api/cart 200 18ms", "POST /api/checkout 201 142ms", "worker: invoice 8812 sent", "GET /health 200 2ms", "cache: warmed 312 keys", "GET /api/search?q=lamp 200 31ms", "POST /api/upload 200 640ms"];
  var open = [], auto = true;

  tools.forEach(function (t) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "pp-tool"; b.dataset.id = t.id;
    b.setAttribute("aria-pressed", "false");
    b.innerHTML = '<span class="app" style="--a:' + t.a + ';--b:' + t.b + '">' + t.g + '</span><span class="nm">' + t.n + '</span><span class="tip">' + t.d + "</span>";
    dock.appendChild(b);
  });

  function cap() { return small.matches ? 2 : 4; }
  function layout() {
    grid.dataset.n = open.length;
    nEl.textContent = open.length + " pane" + (open.length === 1 ? "" : "s");
    dock.querySelectorAll(".pp-tool").forEach(function (b) {
      var on = open.indexOf(b.dataset.id) >= 0; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on);
    });
  }
  function add(id) {
    var t = byId[id], ex = grid.querySelector('[data-pane="' + id + '"]');
    if (ex) { close(id); return; }
    if (open.length >= cap()) close(open[0]);
    var p = document.createElement("div");
    p.className = "pp-pane"; p.dataset.pane = id;
    p.innerHTML = '<div class="pp-ph"><span class="app" style="--a:' + t.a + ';--b:' + t.b + '">' + t.g + '</span><b>' + t.n + '</b><span class="sp"></span><button type="button" class="x" aria-label="Close ' + t.n + '">×</button></div><div class="pp-body">' + bodyFor(id) + "</div>";
    grid.appendChild(p); open.push(id);
    if (id === "logtail") tail(p.querySelector(".pv-log"));
    if (id === "terminal") typeIn(p.querySelector(".typed"));
    layout();
  }
  function close(id) {
    var p = grid.querySelector('[data-pane="' + id + '"]'); if (!p) return;
    open.splice(open.indexOf(id), 1);
    p.classList.add("out");
    setTimeout(function () { p.remove(); }, reduce ? 0 : 220);
    layout();
  }
  function tail(el) {
    var i = 0;
    function push() {
      if (!document.contains(el)) return;
      var d = document.createElement("div"), t = new Date();
      d.innerHTML = "<em>" + String(t.getHours()).padStart(2, "0") + ":" + String(t.getMinutes()).padStart(2, "0") + ":" + String(t.getSeconds()).padStart(2, "0") + "</em> " + logLines[i++ % logLines.length];
      el.appendChild(d); while (el.children.length > 7) el.removeChild(el.firstChild);
      if (!reduce) setTimeout(push, 700 + Math.random() * 600);
    }
    for (var k = 0; k < 5; k++) push();
  }
  function typeIn(el) {
    var cmd = "forge-verify", i = 0;
    if (reduce) { el.textContent = cmd; return; }
    (function t() { if (!document.contains(el)) return; el.textContent = cmd.slice(0, ++i); if (i < cmd.length) setTimeout(t, 110); })();
  }

  dock.addEventListener("click", function (e) { var b = e.target.closest(".pp-tool"); if (!b) return; auto = false; add(b.dataset.id); });
  grid.addEventListener("click", function (e) {
    var x = e.target.closest(".x"); if (x) { auto = false; close(x.closest(".pp-pane").dataset.pane); return; }
    var s = e.target.closest("[data-sec]"); if (s) { s.parentNode.innerHTML = '<span class="okt">✓ Given to this pane only, once</span>'; }
  });

  add("claude"); add("terminal");
  function go() {
    if (reduce) { add("board"); add("subagents"); return; }
    var seq = ["board", "subagents"], k = 0;
    (function nx() { if (!auto || k >= seq.length) return; add(seq[k++]); setTimeout(nx, 1100); })();
  }
  if (reduce || !("IntersectionObserver" in window)) go();
  else { var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); setTimeout(go, 600); } }, { threshold: 0.4 }); io.observe(grid); }
})();
