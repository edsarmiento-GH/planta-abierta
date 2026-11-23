/* Página 3: laboratorio de distribución en planta */
(function () {
  "use strict";
  var P = window.Planta, $ = P.$, fmt = P.fmt, svg = P.svg;

  /* ---------- Distribución en planta ---------- */
  var AREAS = { R: "Recepción", B: "Bodega de grano", T: "Tostión", M: "Molienda", E: "Empaque", D: "Despacho" };
  var FLUJOS = { RB: 20, BT: 18, TM: 15, ME: 15, ED: 12, RE: 5, TE: 4, BD: 2 };
  var INICIAL = ["R", "T", "E", "D", "M", "B"];
  var orden = INICIAL.slice(), sel = -1, movs = 0;
  var rej = $("#rejilla-layout"), sL = $("#svg-layout");
  function costo(a) {
    var pos = {}; a.forEach(function (d, i) { pos[d] = [Math.floor(i / 3), i % 3]; });
    var c = 0; for (var k in FLUJOS) { var p = pos[k[0]], q = pos[k[1]]; c += FLUJOS[k] * 20 * (Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1])); }
    return c;
  }
  var MEJOR = (function () {
    var mejor = Infinity;
    (function armar(hecho, resto) {
      if (!resto.length) { mejor = Math.min(mejor, costo(hecho)); return; }
      resto.forEach(function (x, k) { armar(hecho.concat([x]), resto.slice(0, k).concat(resto.slice(k + 1))); });
    })([], INICIAL.slice());
    return mejor;
  })();
  $("#r-mejor").textContent = fmt(MEJOR, 0) + " m";
  /* Orden del café en la planta: el número de cada área y las flechas siguen este camino */
  var PASO = { R: 1, B: 2, T: 3, M: 4, E: 5, D: 6 };
  var ETIQUETA = { R: "entra el café", D: "sale el café" };
  var CAMINO = ["RB", "BT", "TM", "ME", "ED"];

  /* Dibuja una flecha de un área a otra por los pasillos, sin pasar por encima de las áreas */
  function flechas() {
    var caja = sL.parentNode.getBoundingClientRect();
    var W = caja.width, H = caja.height;
    if (!W) return;
    sL.setAttribute("viewBox", "0 0 " + W + " " + H);
    sL.innerHTML = "";
    var defs = svg("defs", {}, sL);
    var marca = svg("marker", { id: "punta-flujo", viewBox: "0 0 10 10", refX: 7, refY: 5, markerWidth: 2.6, markerHeight: 2.6, orient: "auto", markerUnits: "strokeWidth" }, defs);
    svg("path", { d: "M0 0L10 5L0 10z", fill: "#d9481c" }, marca);
    var r = {};
    Array.prototype.forEach.call(rej.children, function (b) {
      var q = b.getBoundingClientRect(), i = +b.getAttribute("data-i");
      r[orden[i]] = { x0: q.left - caja.left, y0: q.top - caja.top, x1: q.right - caja.left, y1: q.bottom - caja.top, fila: Math.floor(i / 3), col: i % 3 };
    });
    var filaArriba = Object.keys(r).filter(function (k) { return r[k].fila === 0; })[0];
    var filaAbajo = Object.keys(r).filter(function (k) { return r[k].fila === 1; })[0];
    var yPasillo = (r[filaArriba].y1 + r[filaAbajo].y0) / 2;
    var hueco = r[filaAbajo].y0 - r[filaArriba].y1;
    CAMINO.forEach(function (k, n) {
      var a = r[k[0]], b = r[k[1]], carril = n - 2;
      var ax = (a.x0 + a.x1) / 2 + carril * (a.x1 - a.x0) * 0.13, bx = (b.x0 + b.x1) / 2 + carril * (b.x1 - b.x0) * 0.13;
      var ay = (a.y0 + a.y1) / 2 + carril * (a.y1 - a.y0) * 0.12, by = (b.y0 + b.y1) / 2 + carril * (b.y1 - b.y0) * 0.12;
      var sw = Math.max(2.5, Math.min(6, W / 85)) * FLUJOS[k] / 20, corto = sw * 1.2 + 2, d;
      if (a.fila === b.fila && Math.abs(a.col - b.col) === 1) {
        var der = b.col > a.col, xa = der ? a.x1 : a.x0, xb = der ? b.x0 : b.x1;
        d = "M" + xa + " " + ay + "L" + (xb + (der ? -corto : corto)) + " " + ay;
      } else if (a.col === b.col) {
        var baja = b.fila > a.fila, ya = baja ? a.y1 : a.y0, yb = baja ? b.y0 : b.y1;
        d = "M" + ax + " " + ya + "L" + ax + " " + (yb + (baja ? -corto : corto));
      } else {
        var yc = yPasillo + carril * hueco * 0.17;
        var ya2 = a.fila === 0 ? a.y1 : a.y0, yb2 = b.fila === 0 ? b.y1 : b.y0;
        var haciaB = b.fila === 0 ? corto : -corto;
        d = "M" + ax + " " + ya2 + "L" + ax + " " + yc + "L" + bx + " " + yc + "L" + bx + " " + (yb2 + haciaB);
      }
      /* borde claro debajo de cada flecha para distinguirlas cuando se cruzan */
      svg("path", { d: d, fill: "none", stroke: "#f8f9ff", "stroke-width": sw + 4, "stroke-linejoin": "round" }, sL);
      svg("path", { d: d, fill: "none", stroke: "#d9481c", "stroke-width": sw, "stroke-linejoin": "round", "marker-end": "url(#punta-flujo)" }, sL);
    });
  }

  function pintarLayout() {
    rej.innerHTML = orden.map(function (d, i) {
      var nombre = "Paso " + PASO[d] + ", " + AREAS[d] + (ETIQUETA[d] ? ", " + ETIQUETA[d] : "");
      return '<button type="button" data-i="' + i + '" class="' + (i === sel ? "sel" : "") + '" aria-pressed="' + (i === sel) + '" aria-label="' + nombre + '">' +
        "<span>" + PASO[d] + "</span>" + AREAS[d] + (ETIQUETA[d] ? "<em>" + ETIQUETA[d] + "</em>" : "") + "</button>";
    }).join("");
    flechas();
    var c = costo(orden);
    $("#r-recorrido").textContent = fmt(c, 0) + " m"; $("#r-movs").textContent = movs;
    var m = $("#msg-layout");
    if (c === MEJOR) { m.className = "retro bien"; m.innerHTML = "<strong>¡Distribución óptima!</strong> Las áreas quedaron en orden, del 1 al 6, y el camino forma una U: el café entra por la recepción y sale por el despacho, en el mismo costado." + (movs ? " Lo lograste en " + movs + " intercambio" + (movs > 1 ? "s" : "") + "." : ""); }
    else { m.className = "retro info"; m.innerHTML = "Los montacargas recorren " + fmt(c, 0) + " m al día, " + Math.round((c / MEJOR - 1) * 100) + " % más que en la mejor distribución. Pista: pon cada área al lado de la que sigue, del 1 al 6."; }
  }
  window.addEventListener("resize", flechas);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(flechas);
  rej.addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b) return;
    var i = +b.getAttribute("data-i");
    if (sel === -1) sel = i;
    else if (sel === i) sel = -1;
    else { var t = orden[sel]; orden[sel] = orden[i]; orden[i] = t; sel = -1; movs++; }
    pintarLayout();
    var nuevo = rej.querySelector('[data-i="' + i + '"]'); if (nuevo) nuevo.focus();
  });
  $("#reiniciar-layout").addEventListener("click", function () { orden = INICIAL.slice(); sel = -1; movs = 0; pintarLayout(); });
  pintarLayout();
})();
