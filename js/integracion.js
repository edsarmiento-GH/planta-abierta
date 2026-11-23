/* Página 5: repaso de nueve preguntas, créditos de las fotos y dirección para citar */
(function () {
  "use strict";
  var P = window.Planta;

  // p: página donde está el tema
  var PREGUNTAS = [
    { p: 1, q: "Según la lectura del módulo, la función del científico es saber. ¿Y la del ingeniero?", o: ["Hacer: aplicar el conocimiento para resolver problemas prácticos.", "Descubrir leyes nuevas de la naturaleza.", "Administrar empresas."], c: 0, x: "El ingeniero aplica la ciencia a problemas concretos, con recursos limitados y exigencias que chocan entre sí." },
    { p: 1, q: "¿Qué campus de la Sede Manizales fue la estación del cable aéreo que llevaba el café hacia el río Magdalena?", o: ["Palogrande", "La Nubia", "El Cable"], c: 2, x: "La estación del cable Manizales–Mariquita pasó a la Universidad en 1977 y hoy es la Escuela de Arquitectura y Urbanismo." },
    { p: 2, q: "En la producción de café soluble, ¿cuál etapa es química?", o: ["La extracción", "La tostión", "La liofilización"], c: 1, x: "En la tostión el grano cambia de identidad química. Extraer, concentrar, liofilizar y envasar son operaciones físicas." },
    { p: 2, q: "Entran 1.000 kg de extracto con 30 % de sólidos y el café sale con 3 % de humedad. ¿Cuánto café sale?", o: ["300,0 kg", "309,3 kg", "700,0 kg"], c: 1, x: "Los 300 kg de sólidos son el 97 % del producto: 300 ÷ 0,97 = 309,3 kg. Los 700 kg son casi toda el agua que se quita." },
    { p: 3, q: "¿Cuál es el orden de las etapas del enfoque ingenieril?", o: ["Identificar, analizar, proponer, evaluar, implementar, verificar.", "Proponer, identificar, implementar, analizar, evaluar, verificar.", "Implementar, verificar, analizar, proponer, identificar, evaluar."], c: 0, x: "Primero se entiende el problema, después se generan y comparan soluciones, y al final se aplica la escogida y se mide." },
    { p: 3, q: "Una máquina tiene 90 % de disponibilidad, 80 % de rendimiento y 95 % de calidad. ¿Cuál es su OEE?", o: ["88,3 %", "80,0 %", "68,4 %"], c: 2, x: "0,90 × 0,80 × 0,95 = 0,684. Los tres factores se multiplican, no se promedian." },
    { p: 4, q: "En un problema de programación lineal con dos variables, ¿dónde está la solución óptima?", o: ["En el centro de la región factible.", "En una esquina de la región factible.", "Fuera de la región factible."], c: 1, x: "La línea de igual utilidad se empuja hasta el último punto que toca la región, y ese punto es un vértice." },
    { p: 4, q: "Para el riesgo de lesiones por cargar sacos de 70 kg, ¿cuál control es el más eficaz?", o: ["Recibir el café a granel y moverlo con equipos, sin cargar sacos.", "Capacitar en técnicas de levantamiento.", "Entregar fajas lumbares."], c: 0, x: "Elimina el peligro, que es el primer escalón de la jerarquía. La capacitación y la protección personal dependen de que todos lo hagan bien todos los días." },
    { p: 4, q: "¿Qué va primero en la jerarquía de gestión de residuos?", o: ["Reciclar.", "Tratar y disponer en un relleno.", "Prevenir que el residuo se forme."], c: 2, x: "El residuo que no se forma no hay que tratarlo, y casi siempre es materia prima que sí se vendió." }
  ];

  var quiz = document.getElementById("quiz");
  var i = 0, aciertos = 0, falladas = [], primera = true;

  function pintarPregunta() {
    var p = PREGUNTAS[i], pag = P.PAGINAS[p.p - 1];
    quiz.innerHTML =
      '<div class="quiz-cab"><span>Pregunta ' + (i + 1) + ' de ' + PREGUNTAS.length + '</span><span>Tema de la <a href="' + pag.archivo + '">página ' + p.p + '</a></span></div>' +
      '<div class="progreso-quiz"><div style="width:' + (100 * i / PREGUNTAS.length) + '%"></div></div>' +
      '<div class="pregunta" data-correcta="' + "abcd"[p.c] + '"><p class="enunciado">' + p.q + '</p><div class="opciones">' +
      p.o.map(function (o, k) { return '<button data-op="' + "abcd"[k] + '">' + o + '</button>'; }).join("") +
      '</div><div class="explicacion retro">' + p.x + '</div></div>' +
      '<div class="botones" id="quiz-sig" hidden><button class="boton" type="button">' + (i === PREGUNTAS.length - 1 ? "Ver mi resultado" : "Siguiente pregunta") + '</button></div>';
    P.iniciarPreguntas(quiz);
    var enun = P.$(".enunciado", quiz);
    enun.setAttribute("tabindex", "-1");
    if (!primera) enun.focus();
    primera = false;
    P.$(".pregunta", quiz).addEventListener("respondida", function (ev) {
      if (ev.detail.correcta) aciertos++; else falladas.push(i);
      var sig = document.getElementById("quiz-sig");
      sig.hidden = false;
      var b = P.$("button", sig);
      b.addEventListener("click", function () { i++; if (i < PREGUNTAS.length) pintarPregunta(); else pintarResultado(); });
      b.focus();
    });
  }

  function pintarResultado() {
    var n = PREGUNTAS.length;
    var mejor = Math.max(P.store.get("mejorPuntaje", 0), aciertos);
    P.store.set("mejorPuntaje", mejor);
    var msg = aciertos === n ? "Perfecto. Recorriste la planta completa." :
      aciertos >= 7 ? "Muy bien. Te faltan detalles, no ideas." :
      aciertos >= 5 ? "Vas bien. Repasa las páginas de abajo y vuelve a intentarlo." :
      "Vale la pena repasar. Las páginas de abajo te esperan.";
    var paginas = [];
    falladas.forEach(function (k) { var pp = PREGUNTAS[k].p; if (paginas.indexOf(pp) === -1) paginas.push(pp); });
    paginas.sort(function (a, b) { return a - b; });
    quiz.innerHTML = '<div class="resultado"><div class="progreso-quiz"><div style="width:100%"></div></div>' +
      '<p class="puntaje">' + aciertos + ' de ' + n + '</p><p>' + msg + '</p>' +
      (paginas.length ? '<p><strong>Para repasar:</strong></p><ul class="repasar">' + paginas.map(function (pp) {
        var pag = P.PAGINAS[pp - 1];
        return '<li><a href="' + pag.archivo + '">Página ' + pp + ': ' + pag.titulo + '</a></li>';
      }).join("") + '</ul>' : "") +
      '<div class="botones"><button class="boton" type="button" id="quiz-otra">Intentar de nuevo</button><a class="boton sec" href="#conclusiones">Leer las conclusiones</a></div></div>';
    var punt = P.$(".puntaje", quiz); punt.setAttribute("tabindex", "-1"); punt.focus();
    document.getElementById("quiz-otra").addEventListener("click", function () { i = 0; aciertos = 0; falladas = []; pintarPregunta(); });
  }
  pintarPregunta();

  /* ---------- Créditos de las fotos ---------- */
  var ul = document.getElementById("creditos");
  ul.innerHTML = Object.keys(P.IMAGENES).map(function (k) {
    var d = P.IMAGENES[k];
    return "<li>" + d.alt + " " + d.credito + (d.pagina ? ' <a href="' + d.pagina + '">Ver la página del archivo</a>' : "") + "</li>";
  }).join("");

  /* ---------- Dirección para citar ---------- */
  if (/^https?:/.test(location.protocol)) document.getElementById("url-actual").textContent = location.origin + location.pathname.replace(/integracion\.html$/, "");
})();
