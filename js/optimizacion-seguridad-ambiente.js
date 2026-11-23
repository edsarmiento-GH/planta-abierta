/* Página 4: programación lineal y capas de protección */
(function () {
  "use strict";
  var P = window.Planta, $ = P.$, fmt = P.fmt, svg = P.svg;

  /* ---------- Programación lineal ---------- */
  var REST = [
    { n: "Liofilizador", a: 1, b: 0, lim: 40, u: "t" },
    { n: "Secador", a: 0, b: 1, lim: 60, u: "t" },
    { n: "Extracto", a: 1, b: 1, lim: 80, u: "t" },
    { n: "Energía", a: 3, b: 1, lim: 150, u: "unidades" }
  ];
  var VERT = [[0, 0], [40, 0], [40, 30], [35, 45], [20, 60], [0, 60]], PA = 5;
  var ix = $("#pl-x"), iy = $("#pl-y"), PL = 9, sPL = $("#svg-pl");
  var X0 = 52, X1 = 420, Y0 = 18, Y1 = 315, XM = 50, YM = 70;
  function gx(v) { return X0 + (X1 - X0) * v / XM; }
  function gy(v) { return Y1 - (Y1 - Y0) * v / YM; }
  function optimo(pl) {
    var mejor = -Infinity, cual = [];
    VERT.forEach(function (v) {
      var u = pl * v[0] + PA * v[1];
      if (u > mejor + 1e-9) { mejor = u; cual = [v]; } else if (Math.abs(u - mejor) < 1e-9) cual.push(v);
    });
    return { u: mejor, v: cual };
  }
  function recortar(a, b, c) {
    // segmento de a·x + b·y = c dentro del rectángulo [0,XM]×[0,YM]
    var pts = [];
    if (b !== 0) { [0, XM].forEach(function (x) { var y = (c - a * x) / b; if (y >= 0 && y <= YM) pts.push([x, y]); }); }
    if (a !== 0) { [0, YM].forEach(function (y) { var x = (c - b * y) / a; if (x >= 0 && x <= XM) pts.push([x, y]); }); }
    var unicos = [];
    pts.forEach(function (q) { if (!unicos.some(function (w) { return Math.abs(w[0] - q[0]) < 1e-9 && Math.abs(w[1] - q[1]) < 1e-9; })) unicos.push(q); });
    return unicos.slice(0, 2);
  }
  function pl() {
    var x = +ix.value, y = +iy.value, p = PL, u = p * x + PA * y, op = optimo(p);
    $("#o-pl-x").textContent = x + " t"; $("#o-pl-y").textContent = y + " t";
    var rotas = [];
    $("#pl-rest").innerHTML = REST.map(function (r) {
      var uso = r.a * x + r.b * y, cls = uso > r.lim ? "rota" : uso === r.lim ? "justa" : "";
      if (uso > r.lim) rotas.push(r.n.toLowerCase());
      return "<li class='" + cls + "'><span>" + r.n + "</span><b>" + fmt(uso, 0) + " de " + r.lim + (r.u === "t" ? " t" : "") + (uso > r.lim ? " ✗" : uso === r.lim ? " (al límite)" : "") + "</b></li>";
    }).join("");
    var ok = rotas.length === 0;
    $("#r-pl-u").textContent = ok ? fmt(u, 0) + " M$" : "—";
    var m = $("#msg-pl");
    if (!ok) { m.className = "retro mal"; m.innerHTML = "<strong>La planta no da para eso.</strong> Se pasa en " + rotas.join(" y ") + ". Vuelve a la región amarilla."; }
    else if (u >= op.u - 1e-9) {
      m.className = "retro bien";
      m.innerHTML = "<strong>¡Óptimo!</strong> " + fmt(u, 0) + " millones por semana, en la esquina (" + x + ", " + y + ")" + (op.v.length > 1 ? ". Con esta utilidad hay empate entre dos esquinas: todo el borde que las une es óptimo." : ". Mira qué restricciones quedaron al límite: esas son las que mandan.");
    } else {
      m.className = "retro info";
      m.innerHTML = "Ganas " + fmt(u, 0) + " millones; la mejor mezcla da " + fmt(op.u, 0) + ". Imagina la línea punteada moviéndose paralela, alejándose del origen: el último punto amarillo que toque es el óptimo.";
    }
    // gráfica
    sPL.innerHTML = "";
    var g = svg("g", {}, sPL);
    for (var k = 10; k <= XM; k += 10) { svg("line", { x1: gx(k), x2: gx(k), y1: Y0, y2: Y1, stroke: "#eef0f6" }, g); svg("text", { x: gx(k), y: Y1 + 16, "text-anchor": "middle" }, g, k); }
    for (k = 10; k <= YM; k += 10) { svg("line", { x1: X0, x2: X1, y1: gy(k), y2: gy(k), stroke: "#eef0f6" }, g); svg("text", { x: X0 - 6, y: gy(k) + 4, "text-anchor": "end" }, g, k); }
    svg("text", { x: X0 - 6, y: Y1 + 16, "text-anchor": "end" }, g, "0");
    svg("text", { x: X1, y: Y1 + 34, "text-anchor": "end" }, g, "toneladas de liofilizado");
    svg("text", { x: 0, y: 0, transform: "translate(14 " + ((Y0 + Y1) / 2) + ") rotate(-90)", "text-anchor": "middle" }, g, "toneladas de aspersión");
    svg("path", { d: VERT.map(function (v, i) { return (i ? "L" : "M") + gx(v[0]) + " " + gy(v[1]); }).join("") + "Z", fill: "#fff5cc", stroke: "#e0b400", "stroke-width": 1.5 }, g);
    var etq = [[40, 67, 5, 0], [1, 60, 0, -5], [13, 68, 6, 0], [29.5, 64, 6, 0]];
    REST.forEach(function (r, i) {
      var s = recortar(r.a, r.b, r.lim);
      if (s.length < 2) return;
      var activa = Math.abs(r.a * x + r.b * y - r.lim) < 1e-9;
      svg("line", { x1: gx(s[0][0]), y1: gy(s[0][1]), x2: gx(s[1][0]), y2: gy(s[1][1]), stroke: "#0f1a3d", "stroke-width": activa ? 2.5 : 1.3, opacity: activa ? 1 : .55 }, g);
      var e = etq[i];
      svg("text", { x: gx(e[0]) + e[2], y: gy(e[1]) + e[3], "class": "rest", style: "fill:#0f1a3d;paint-order:stroke;stroke:#fff;stroke-width:4px" }, g, r.n);
    });
    svg("path", { d: "M" + X0 + " " + Y0 + "V" + Y1 + "H" + X1, fill: "none", stroke: "#a9b3d1" }, g);
    // línea de igual utilidad
    if (u > 0) {
      var s = recortar(p, PA, u);
      if (s.length === 2) svg("line", { x1: gx(s[0][0]), y1: gy(s[0][1]), x2: gx(s[1][0]), y2: gy(s[1][1]), stroke: "#d9481c", "stroke-width": 2, "stroke-dasharray": "6 5" }, g);
    }
    VERT.forEach(function (v) { svg("circle", { cx: gx(v[0]), cy: gy(v[1]), r: 3.5, fill: "#0f1a3d" }, g); });
    svg("circle", { cx: gx(x), cy: gy(y), r: 8, fill: ok ? "#ffcc00" : "#c42b27", stroke: "#0f1a3d", "stroke-width": 2 }, g);
  }
  [ix, iy].forEach(function (c) { c.addEventListener("input", pl); });
  sPL.addEventListener("click", function (ev) {
    var pt = sPL.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    var q = pt.matrixTransform(sPL.getScreenCTM().inverse());
    ix.value = Math.round(Math.max(0, Math.min(XM, (q.x - X0) / (X1 - X0) * XM)));
    iy.value = Math.round(Math.max(0, Math.min(YM, (Y1 - q.y) / (Y1 - Y0) * YM)));
    pl();
  });
  $("#pl-opt").addEventListener("click", function () { var o = optimo(PL).v[0]; ix.value = o[0]; iy.value = o[1]; pl(); });
  pl();

  /* ---------- Capas de protección (LOPA) ---------- */
  var F0 = 0.1, META = 1e-4, sC = $("#svg-capas");
  function lopa() {
    var al = $("#c-alarma").checked, si = $("#c-sis").checked, di = $("#c-dique").checked;
    var capas = [
      { on: al, pfd: 0.1, n: "alarma" },
      { on: si, pfd: 0.01, n: "interruptor" },
      { on: di, pfd: 0.01, n: "dique" }
    ];
    var f = F0;
    capas.forEach(function (c) { if (c.on) f *= c.pfd; });
    $("#r-cada").textContent = fmt(1 / f, 0) + " años";
    var m = $("#msg-capas");
    if (f <= META * 1.0001) { m.className = "retro bien"; m.innerHTML = "<strong>Riesgo tolerable.</strong> Una vez cada " + fmt(1 / f, 0) + " años, dentro de la meta de la empresa. Sirve mientras cada capa sea independiente de las demás y se pruebe con regularidad."; }
    else { m.className = "retro mal"; m.innerHTML = "<strong>No alcanza.</strong> Una vez cada " + fmt(1 / f, 0) + " años, y la meta es una vez cada 10.000. Faltan " + fmt(Math.log10(f / META), 0) + " órdenes de magnitud de protección."; }
    // dibujo: queso suizo
    sC.innerHTML = "";
    var g = svg("g", {}, sC), xs = [125, 245, 365], yc = 126;
    function ancho(ff) { return Math.max(3, 6 + 5 * (Math.log10(ff) + 6)); }
    var huecos = [[[-6, -48, 7], [5, -12, 9], [-4, 26, 6], [6, 52, 5]], [[4, -46, 5], [-5, -5, 6], [5, 38, 8]], [[-3, -52, 6], [6, -20, 5], [-6, 16, 7], [4, 48, 6]]];
    capas.forEach(function (c, i) {
      var x = xs[i];
      if (c.on) {
        svg("rect", { x: x - 16, y: 52, width: 32, height: 148, rx: 10, fill: c.muerta ? "#f2f4fa" : "#ffcc00", stroke: "#0f1a3d", "stroke-width": 2, "stroke-dasharray": c.muerta ? "5 4" : null }, g);
        huecos[i].forEach(function (h) { svg("circle", { cx: x + h[0], cy: yc + h[1], r: h[2], fill: "#fff", stroke: "#e0b400" }, g); });
      } else {
        svg("rect", { x: x - 16, y: 52, width: 32, height: 148, rx: 10, fill: "none", stroke: "#c9cfe0", "stroke-width": 1.5, "stroke-dasharray": "4 4" }, g);
      }
      svg("text", { x: x, y: 222, "text-anchor": "middle", style: c.on ? "fill:#0f1a3d;font-weight:700" : "" }, g, c.n);
      if (c.on) svg("text", { x: x, y: 240, "text-anchor": "middle" }, g, c.muerta ? "no funciona" : "falla 1 de " + fmt(1 / c.pfd, 0));
    });
    // flecha que adelgaza
    var tramos = [], ff = F0, x0 = 20;
    capas.forEach(function (c, i) { tramos.push([x0, xs[i], ff]); if (c.on) ff *= c.pfd; x0 = xs[i]; });
    tramos.push([x0, 392, ff]);
    tramos.forEach(function (t) { var w = ancho(t[2]); svg("rect", { x: t[0], y: yc - w / 2, width: t[1] - t[0], height: w, fill: "#d9481c", opacity: .85 }, g); });
    var wf = ancho(ff);
    svg("path", { d: "M392 " + (yc - wf / 2 - 6) + "L414 " + yc + "L392 " + (yc + wf / 2 + 6) + "Z", fill: "#d9481c" }, g);
    svg("text", { x: 20, y: 18, style: "fill:#0f1a3d;font-weight:700" }, g, "falla el control");
    svg("text", { x: 20, y: 36 }, g, "1 vez cada 10 años");
    svg("text", { x: 420, y: 18, "text-anchor": "end", style: "fill:" + (f <= META * 1.0001 ? "#0b7a55" : "#c42b27") + ";font-weight:700" }, g, "derrame");
    svg("text", { x: 420, y: 36, "text-anchor": "end" }, g, "1 vez cada " + fmt(1 / f, 0) + " años");
  }
  ["#c-alarma", "#c-sis", "#c-dique"].forEach(function (id) { $(id).addEventListener("change", lopa); });
  lopa();

})();
