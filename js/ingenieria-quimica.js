/* Página 2: diagrama del café soluble y balance de materia del secador */
(function () {
  "use strict";
  var P = window.Planta, $ = P.$, fmt = P.fmt;

  /* ---------- Del café verde al frasco ---------- */
  var ETAPAS = [
    { nombre: "Tostión y molienda", tipo: "quimica", tipoTxt: "Aquí está la reacción química",
      texto: "El grano llega verde. En el tostador, a más de 200 °C, ocurren reacciones químicas (entre ellas la de Maillard) que forman el color, el aroma y el sabor. Es la única etapa en que las sustancias cambian de identidad. Moler ya es una operación física: aumenta el área para extraer." },
    { nombre: "Extracción", tipo: "fisica", tipoTxt: "Operación física",
      texto: "Agua caliente a presión atraviesa el café molido y arrastra los sólidos solubles. Sale un extracto, como un tinto muy cargado. El café ya usado que queda (la borra) no se bota: la planta lo quema en sus calderas para producir vapor." },
    { nombre: "Concentración", tipo: "fisica", tipoTxt: "Operación física",
      texto: "Se evapora parte del agua del extracto. Cada kilo que sale aquí es un kilo menos que congelar y sublimar en la etapa siguiente, que es más costosa." },
    { nombre: "Liofilización", tipo: "fisica", tipoTxt: "Operación física",
      texto: "El extracto se congela y se pone al vacío: el hielo pasa directo a vapor sin volverse líquido. Como el café casi no se calienta, conserva su aroma." },
    { nombre: "Envasado", tipo: "fisica", tipoTxt: "Operación física",
      texto: "Los gránulos se empacan en frascos que los protegen de la humedad del aire, porque el café liofilizado la absorbe con facilidad." }
  ];
  var leyenda = $("#leyenda-etapa"), unidades = P.$$(".unidad"), botones = P.$$(".etapas-cafe button");
  function elegir(i) {
    var e = ETAPAS[i];
    unidades.forEach(function (u) { u.classList.toggle("sel", +u.getAttribute("data-etapa") === i); });
    botones.forEach(function (b) { b.setAttribute("aria-pressed", +b.getAttribute("data-etapa") === i ? "true" : "false"); });
    leyenda.innerHTML = "<h3>" + (i + 1) + ". " + e.nombre + ' <span class="tag ' + e.tipo + '">' + e.tipoTxt + "</span></h3><p>" + e.texto + "</p>";
  }
  unidades.forEach(function (u) {
    var i = +u.getAttribute("data-etapa");
    u.addEventListener("click", function () { elegir(i); });
    u.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); elegir(i); } });
  });
  botones.forEach(function (b) { b.addEventListener("click", function () { elegir(+b.getAttribute("data-etapa")); }); });

  /* ---------- Balance del liofilizador ---------- */
  var F = 1000, iS = $("#b-solidos"), iH = $("#b-humedad");
  /* Ancho de cada franja; el rótulo se acorta o se quita si no cabe (en celular las franjas son angostas) */
  function ancho(el, kg, texto, corto) {
    el.style.width = (kg / F * 100) + "%";
    var px = kg / F * (el.parentNode.clientWidth || 300), cabe = function (t) { return t && t.length * 7.4 + 14 <= px; };
    el.textContent = cabe(texto) ? texto : (cabe(corto) ? corto : "");
  }
  function balance() {
    var xs = +iS.value / 100, h = +iH.value / 100;
    var S = F * xs, prod = S / (1 - h), agua = F - prod;
    $("#o-b-solidos").textContent = fmt(xs * 100, 0) + " %";
    $("#o-b-humedad").textContent = fmt(h * 100, h * 100 % 1 ? 1 : 0) + " %";
    $("#r-b-prod").textContent = fmt(prod, 1) + " kg";
    $("#r-b-agua").textContent = fmt(agua, 1) + " kg";
    ancho($("#bb-s1"), S, "sólidos " + fmt(S, 0), fmt(S, 0));
    ancho($("#bb-a1"), F - S, "agua " + fmt(F - S, 0), fmt(F - S, 0));
    ancho($("#bb-a2"), agua, fmt(agua, 0) + " kg", fmt(agua, 0));
    ancho($("#bb-s3"), S, fmt(S, 0));
    ancho($("#bb-h3"), prod - S, "");
    $("#msg-balance").innerHTML = "Los " + fmt(S, 0) + " kg de sólidos que entran salen completos en el café, que además lleva " + fmt(prod - S, 1) + " kg de agua. Por eso el producto pesa " + fmt(prod, 1) + " kg y no " + fmt(S, 0) + ". " +
      (xs < 0.3 ? "Con un extracto tan diluido casi todo es agua por quitar: conviene concentrarlo antes, porque evaporar es más barato que liofilizar." : "Mientras más concentrado llegue el extracto, menos agua hay que sacar en el liofilizador, que es la etapa más cara.");
  }
  [iS, iH].forEach(function (c) { c.addEventListener("input", balance); });
  balance();
})();
