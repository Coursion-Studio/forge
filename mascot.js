(function () {
  var base = [
    "................",
    "................",
    "hhhhhhhhhhhhHH..",
    "BBBBBBBBBBBBHHHH",
    "..BBBBBBBBBH....",
    "....BWEBBWEB....",
    "....BEEBBEEB....",
    "....BCBBBBCB....",
    "...BBBBBBBBBB...",
    "..DDDDDDDDDDDD..",
    "..DDDD.GG.DDDD..",
    "....gg.gg.gg...."
  ];
  var eyeRows = {
    shut: ["....BBBBBBBB....", "....BEEBBEEB...."],
    up: ["....BEEBBEEB....", "....BBBBBBBB...."],
    left: ["....WEBBWEBB....", "....EEBBEEBB...."],
    right: ["....BBWEBBWE....", "....BBEEBBEE...."],
    wide: ["....WEEBBWEE....", "....EEEBBEEE...."],
    happy: ["....BEBBBBEB....", "....EBEBBEBE...."]
  };

  function anvil(edits, eyes, glow) {
    glow = glow || "G";
    var g = base.map(function (r) { return r.split(""); });
    if (eyes && eyeRows[eyes]) { g[5] = eyeRows[eyes][0].split(""); g[6] = eyeRows[eyes][1].split(""); }
    var dim = glow === "G" ? "g" : ".";
    g[10] = g[10].map(function (c) { return c === "G" ? glow : c; });
    g[11] = g[11].map(function (c) { return c === "g" ? dim : c; });
    (edits || []).forEach(function (e) { g[e[0]][e[1]] = e[2]; });
    return g;
  }

  var moods = {
    ready: { fps: 4, hop: 0, frames: function () {
      var f = [], i;
      for (i = 0; i < 8; i++) f.push(anvil());
      f.push(anvil(null, "shut"));
      for (i = 0; i < 4; i++) f.push(anvil());
      for (i = 0; i < 3; i++) f.push(anvil(null, "left"));
      for (i = 0; i < 3; i++) f.push(anvil(null, "right"));
      return f;
    } },
    thinking: { fps: 4, hop: 0, frames: function () {
      return [anvil([[1, 13, "S"]], "up"), anvil([[0, 14, "S"]], "up"), anvil([[1, 15, "S"]], "up"), anvil(null, "up")];
    } },
    reading: { fps: 4, hop: 0, frames: function () {
      return [anvil(null, "left"), anvil(null, "left"), anvil(), anvil(null, "right"), anvil(null, "right"), anvil()];
    } },
    delegating: { fps: 6, hop: 0, frames: function () {
      return [anvil([[1, 6, "S"], [1, 9, "S"]]), anvil([[0, 4, "S"], [0, 11, "S"]]), anvil([[1, 1, "S"], [1, 14, "S"]]), anvil([[0, 0, "S"], [0, 15, "S"]])];
    } },
    working: { fps: 7, hop: 1, frames: function () {
      return [anvil(), anvil([[1, 3, "S"], [1, 7, "S"], [1, 10, "S"]], "shut"), anvil([[0, 1, "S"], [1, 5, "S"], [0, 8, "S"], [1, 12, "S"]]), anvil()];
    } },
    helpers: { fps: 5, hop: 0, frames: function () {
      return [anvil([[1, 1, "S"]], "left"), anvil([[0, 5, "S"]]), anvil([[0, 10, "S"]]), anvil([[1, 14, "S"]], "right")];
    } },
    editing: { fps: 6, hop: 0, frames: function () {
      return [anvil(), anvil([[1, 13, "S"], [0, 14, "S"]], "shut"), anvil([[0, 12, "S"], [1, 15, "S"]]), anvil()];
    } },
    celebrating: { fps: 5, hop: 3, frames: function () {
      return [anvil([[0, 1, "S"], [1, 4, "H"], [0, 7, "C"], [1, 10, "S"], [0, 14, "H"]], "happy"),
              anvil([[1, 2, "C"], [0, 5, "S"], [1, 8, "H"], [0, 11, "C"], [1, 15, "S"]], "happy")];
    } },
    waiting: { fps: 3, hop: 2, frames: function () {
      var alert = anvil([[0, 7, "T"], [0, 8, "T"]], "wide");
      return [alert, alert, anvil(null, "wide")];
    } },
    sleepy: { fps: 1, hop: 0, frames: function () {
      return [anvil([[1, 13, "Z"]], "shut", "g"), anvil([[0, 14, "Z"]], "shut", "g"), anvil([[1, 12, "Z"], [0, 15, "Z"]], "shut", "g")];
    } },
    greeting: { fps: 3, hop: 1, frames: function () {
      return [anvil([[0, 13, "W"]], "happy"), anvil([[1, 14, "W"]], "happy")];
    } }
  };

  function px(rows, top, left) {
    var out = [];
    rows.forEach(function (row, dy) { row.split("").forEach(function (ch, dx) { if (ch !== ".") out.push([top + dy, left + dx, ch]); }); });
    return out;
  }
  var hats = {
    light: px(["....KWKKK.", "kkkKKKKKKK"], 1, 0),
    medium: px(["...W...", ".KKKKK.", "kKkKkKk"], 0, 3),
    careful: px(["...KKKK...", "..KWKKKK..", "kkkkkkkkkk"], 0, 1),
    heavy: px(["F..K..F", "FFFFFFF", "FKFFFKF"], 0, 2)
  };
  function accessory(role, strike) {
    if (role === "scout") return px([".MMM", ".MLM", ".MMM", "n...", "n..."], 6, 0);
    if (role === "builder") return strike ? px(["S...", ".MMM", ".MMM", "..n.", "..n.", "..n."], 5, 12) : px([".MMM", ".MMM", "..n.", "..n.", "..n."], 5, 12);
    if (role === "reviewer") return px([".FF..FF.", "F..FF..F", "F..FF..F", ".FF..FF."], 5, 4);
    if (role === "planner") return px([".n.", "PPP", "PqP", "PPP"], 6, 0);
    return [];
  }
  var tierColor = { light: [92, 217, 133], medium: [56, 158, 255], careful: [255, 179, 61], heavy: [255, 81, 137] };

  function rgb(a) { return "rgb(" + a.map(Math.round).join(",") + ")"; }
  function mix(a, b, t) { return a.map(function (v, i) { return v + (b[i] - v) * t; }); }
  function color(ch, row, tint) {
    switch (ch) {
      case "E": return "rgb(10,15,31)";
      case "B": var t = Math.min(1, Math.max(0, (row - 3) / 6)); return rgb([(0.42 - 0.20 * t) * 255, (0.62 - 0.30 * t) * 255, (0.86 - 0.30 * t) * 255]);
      case "h": return "rgb(179,224,255)";
      case "H": return row <= 2 ? "rgb(255,81,137)" : "rgb(199,92,235)";
      case "D": return "rgb(33,48,84)";
      case "W": return "#fff";
      case "C": return "rgba(255,81,137,0.75)";
      case "G": return "rgb(255,77,41)";
      case "g": return "rgb(158,43,31)";
      case "S": return "rgb(255,214,74)";
      case "Z": return "rgb(140,145,168)";
      case "T": return "rgb(255,149,0)";
      case "K": return rgb(tint || [199, 92, 235]);
      case "k": return rgb(mix(tint || [199, 92, 235], [0, 0, 0], 0.35));
      case "M": return "rgb(204,212,230)";
      case "L": return "rgb(140,224,255)";
      case "n": return "rgb(168,110,61)";
      case "F": return "rgb(255,214,74)";
      case "P": return "rgb(237,240,247)";
      case "q": return "rgb(115,128,158)";
    }
    return null;
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]static\b/.test(location.search);

  function Mascot(canvas, opts) {
    opts = opts || {};
    this.c = canvas; canvas._m = this; this.x = canvas.getContext("2d");
    this.crew = opts.crew || null;
    this.rows = this.crew ? 13 : 12; this.cols = 16;
    this.pad = 3;
    canvas.width = this.cols; canvas.height = this.rows + this.pad;
    this.i = 0; this.timer = null;
    this.set(opts.mood || "ready");
  }
  Mascot.prototype.set = function (mood) {
    if (this.mood === mood) return;
    this.mood = mood; var m = moods[mood] || moods.ready;
    this.anim = { fps: m.fps, hop: m.hop, frames: m.frames() };
    if (this.crew) {
      var c = this.crew, swings = c.role === "builder" && (mood === "editing" || mood === "working");
      this.anim.frames = this.anim.frames.map(function (f, i) {
        var g = [new Array(16).fill(".")].concat(f.map(function (r) { return r.slice(); }));
        hats[c.tier].concat(accessory(c.role, swings && i % 2 === 1)).forEach(function (e) { g[e[0]][e[1]] = e[2]; });
        return g;
      });
    }
    var n = this.anim.frames.length;
    this.i = Math.floor(Math.random() * n);
    clearInterval(this.timer); clearTimeout(this.lag); this.timer = null;
    this.draw();
    if (!reduce && n > 1) {
      var self = this, ms = 1000 / Math.min(this.anim.fps, 8) * (0.85 + Math.random() * 0.3);
      this.lag = setTimeout(function () {
        self.timer = setInterval(function () { self.i = (self.i + 1) % n; self.draw(); }, ms);
      }, Math.random() * ms);
    }
  };
  Mascot.prototype.draw = function () {
    var a = this.anim, f = a.frames[this.i], x = this.x, tint = this.crew ? tierColor[this.crew.tier] : null;
    var hop = a.hop > 0 && a.frames.length > 1 ? Math.round(a.hop * Math.abs(Math.sin(this.i / a.frames.length * Math.PI))) : 0;
    x.clearRect(0, 0, this.c.width, this.c.height);
    for (var r = 0; r < f.length; r++) for (var col = 0; col < f[r].length; col++) {
      var fill = color(f[r][col], this.crew ? r - 1 : r, tint);
      if (fill) { x.fillStyle = fill; x.fillRect(col, r + this.pad - hop, 1, 1); }
    }
  };
  Mascot.prototype.stop = function () { clearInterval(this.timer); clearTimeout(this.lag); };

  window.ForgeMascot = Mascot;
})();
