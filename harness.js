(function () {
  var root = document.getElementById("hx-demo");
  if (!root || !window.ForgeMascot) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]static\b/.test(location.search);
  var log = root.querySelector(".hx-log"), state = root.querySelector("[data-hx-state]");
  var backN = root.querySelector("[data-hx-back]"), okN = root.querySelector("[data-hx-ok]");
  var buttons = root.querySelectorAll("[data-hx]");
  var back = 0, ok = 0, busy = false, run = 0;
  var crew = {
    explorer: { tier: "light", role: "scout", name: "forge-explorer", model: "Haiku 5.5", c: "#5CD985" },
    worker: { tier: "medium", role: "builder", name: "forge-worker", model: "Sonnet 5.5", c: "#4D9BFF" },
    reviewer: { tier: "careful", role: "reviewer", name: "forge-reviewer", model: "Opus 5.5", c: "#FFB33D" },
    tester: { tier: "medium", role: "none", name: "forge-tester", model: "Sonnet 5.5", c: "#4D9BFF" }
  };
  var shield = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/></svg>';
  var landIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="5" r="2.2"/><circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="9" r="2.2"/><path d="M6 7.2v9.6M18 11.2c0 4-6 3-11 6"/></svg>';

  function wait(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); }
  function trim() { while (log.children.length > 7) log.removeChild(log.firstChild); }
  var last = null;
  function actor(who, text, detail, mood) {
    var c = crew[who], el = document.createElement("div");
    el.className = "hx-row";
    el.innerHTML = '<canvas class="mascot"></canvas><div class="tx"><div class="h"><b>' + c.name + '</b><span class="mc" style="--c:' + c.c + '">' + c.model + '</span></div><div class="t"></div>' + (detail ? '<code></code>' : "") + "</div>";
    el.querySelector(".t").textContent = text;
    if (detail) el.querySelector("code").textContent = detail;
    log.appendChild(el); trim();
    if (last) last.set("ready");
    last = new ForgeMascot(el.querySelector("canvas"), { crew: { tier: c.tier, role: c.role }, mood: mood || "working" });
    return { el: el, m: last };
  }
  function hook(pass, title, why) {
    var el = document.createElement("div");
    el.className = "hx-row hook " + (pass ? "pass" : "fail");
    el.innerHTML = '<span class="hx-ico">' + shield + '</span><div class="tx"><div class="h"><b>Hand-back hook</b><span class="verdict">' + (pass ? "✓ Accepted" : "✕ Turned back") + '</span></div><div class="t"></div><code></code></div>';
    el.querySelector(".t").textContent = title;
    el.querySelector("code").textContent = why;
    log.appendChild(el); trim();
    if (pass) okN.textContent = ++ok; else backN.textContent = ++back;
    if (last) last.set(pass ? "celebrating" : "waiting");
  }
  function handback(lines) {
    var el = document.createElement("div");
    el.className = "hx-row hb";
    el.innerHTML = '<span class="hx-ico hb-ico">↩</span><div class="tx"><div class="h"><b>Hand-back</b></div><pre></pre></div>';
    el.querySelector("pre").textContent = lines;
    log.appendChild(el); trim();
  }
  function landed(text) {
    var el = document.createElement("div");
    el.className = "hx-row land";
    el.innerHTML = '<span class="hx-ico">' + landIcon + '</span><div class="tx"><div class="h"><b>Land</b><span class="verdict">main</span></div><div class="t"></div></div>';
    el.querySelector(".t").textContent = text;
    log.appendChild(el); trim();
    if (last) last.set("ready");
  }
  function set(t) { state.textContent = t; }
  function tree() { return Math.random().toString(16).slice(2, 8); }

  async function play(kind) {
    if (busy) return;
    busy = true; var me = ++run;
    buttons.forEach(function (b) { b.disabled = true; b.classList.toggle("on", b.dataset.hx === kind); });
    log.innerHTML = ""; last = null;
    set("Exploring");
    actor("explorer", "Found the rounding in 2 files", "cart/summary.ts · cart/lineItem.ts", "reading");
    await wait(1100); if (me !== run) return;
    set("Building in its own worktree");
    var w = actor("worker", "Rounding once, at the end", "Edit cart/summary.ts  +4 −2", "editing");
    await wait(1300);
    var t1 = tree();
    if (kind === "cheat") {
      handback("STATUS: done\nTESTS:  looks good to me");
      await wait(900);
      set("Turned back");
      hook(false, "No proof in the worker's transcript", "no FORGE-VERIFY ok for worktree-agent-3f2a");
      await wait(1500);
      set("Running the tests");
      w = actor("worker", "Running forge-verify", "FORGE-VERIFY ok tree=" + t1 + " · 214 passed", "working");
      await wait(1300);
    } else if (kind === "edit") {
      w = actor("worker", "Running forge-verify", "FORGE-VERIFY ok tree=" + t1 + " · 214 passed", "working");
      await wait(1100);
      var t2 = tree();
      actor("worker", "One more tweak after the run", "Edit cart/summary.ts  +1 −1", "editing");
      await wait(1000);
      handback("STATUS: done\nTESTS:  forge-verify ok (" + t1 + ")");
      await wait(900);
      set("Turned back");
      hook(false, "The code changed after the green run", "tested " + t1 + ", handing back " + t2 + ". Run it again.");
      await wait(1500);
      set("Running the tests again");
      t1 = t2;
      actor("worker", "Running forge-verify", "FORGE-VERIFY ok tree=" + t1 + " · 214 passed", "working");
      await wait(1300);
    } else {
      actor("worker", "Running forge-verify", "FORGE-VERIFY ok tree=" + t1 + " · 214 passed", "working");
      await wait(1200);
    }
    handback("STATUS: done\nTESTS:  forge-verify ok (" + t1 + ")");
    await wait(900);
    set("Accepted");
    hook(true, "Green run on the exact commit handed back", "tree " + t1 + " = HEAD of worktree-agent-3f2a");
    await wait(1300);
    set("Reviewing");
    actor("reviewer", "Read the diff, ran the suite, probed refunds", "approve · 1 note", "reading");
    await wait(1300);
    set("Testing in the VM");
    actor("tester", "Checked the cart in the test VM", "4 screenshots · totals match", "working");
    await wait(1300);
    set("Landed");
    landed("Rebased, gate green, fast-forwarded. Build 552 installs when you're idle.");
    buttons.forEach(function (b) { b.disabled = false; });
    busy = false;
  }

  buttons.forEach(function (b) { b.addEventListener("click", function () { play(b.dataset.hx); }); });
  if (reduce || !("IntersectionObserver" in window)) { play("cheat"); return; }
  var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); play("cheat"); } }, { threshold: 0.4 });
  io.observe(root);
})();
