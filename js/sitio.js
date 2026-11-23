/* =========================================================
   Humanidades: funciones compartidas por las cinco páginas
   - PAGINAS: el recorrido (para cambiar títulos, editar aquí)
   - GRUPO: nombres del grupo
   - Cabecera con las cinco páginas, encabezado, cierre y pie
   - Componentes: preguntas, clasificador y fotos
   ========================================================= */
(function () {
  "use strict";

  var BLOQUES = {
    g: "Inicio",
    q: "Ingeniería Química",
    i: "Ingeniería Industrial",
    t: "Optimización, seguridad y ambiente",
    x: "Integración"
  };

  var PAGINAS = [
    { b: "g", archivo: "index.html", titulo: "La Universidad y el trabajo", corto: "Inicio" },
    { b: "q", archivo: "ingenieria-quimica.html", titulo: "Ingeniería Química", corto: "Química" },
    { b: "i", archivo: "ingenieria-industrial.html", titulo: "Ingeniería Industrial", corto: "Industrial" },
    { b: "t", archivo: "optimizacion-seguridad-ambiente.html", titulo: "Optimización, seguridad y medio ambiente", corto: "Optimización, seguridad y ambiente" },
    { b: "x", archivo: "integracion.html", titulo: "Las dos juntas y el cierre", corto: "Cierre" }
  ];
  PAGINAS.forEach(function (p, i) { p.n = i + 1; });

  var GRUPO = ["Salomé Alzate Cortes", "Isabel Aguirre Ocampo", "Ximena Díaz Lizarralde", "Kelly Maritza Martínez", "Edwin Fernando Sarmiento"];

  var IMAGENES = window.PLANTA_IMAGENES || {};

  /* ---------- Utilidades ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function fmt(n, dec) {
    if (dec === undefined) dec = 1;
    if (!isFinite(n)) return "—";
    return Number(n).toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  var NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs, padre, texto) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (texto !== undefined) e.textContent = texto;
    if (padre) padre.appendChild(e);
    return e;
  }

  /* ---------- Memoria del navegador (puede no estar disponible) ---------- */
  var CLAVE = "plantaAbierta.v3";
  var memoria = { visitadas: [], datos: {} };
  try {
    var guardado = JSON.parse(window.localStorage.getItem(CLAVE) || "null");
    if (guardado && typeof guardado === "object") {
      memoria.visitadas = guardado.visitadas || [];
      memoria.datos = guardado.datos || {};
    }
  } catch (e) { }
  function guardar() { try { window.localStorage.setItem(CLAVE, JSON.stringify(memoria)); } catch (e) { } }
  var store = {
    get: function (k, porDefecto) { return Object.prototype.hasOwnProperty.call(memoria.datos, k) ? memoria.datos[k] : porDefecto; },
    set: function (k, v) { memoria.datos[k] = v; guardar(); }
  };

  /* ---------- Página actual ---------- */
  var archivoActual = (location.pathname.split("/").pop() || "index.html");
  var actual = null;
  PAGINAS.forEach(function (p) { if (p.archivo === archivoActual) actual = p; });
  if (!actual && archivoActual === "") actual = PAGINAS[0];
  var numActual = actual ? actual.n : 0;
  if (actual) {
    if (memoria.visitadas.indexOf(numActual) === -1) memoria.visitadas.push(numActual);
    guardar();
    if (!document.body.getAttribute("data-bloque")) document.body.setAttribute("data-bloque", actual.b);
  }

  /* ---------- Cabecera ---------- */
  var MARCA_SVG =
    '<svg viewBox="0 0 32 32" aria-hidden="true">' +
    '<rect x="2" y="2" width="28" height="28" rx="6" fill="none" stroke="#ffcc00" stroke-width="2" stroke-dasharray="4 3"/>' +
    '<rect x="7" y="11" width="7" height="10" rx="1.5" fill="#fff"/>' +
    '<rect x="19" y="9" width="6" height="14" rx="3" fill="#fff"/>' +
    '<path d="M14 16h4.2" stroke="#fff" stroke-width="2"/></svg>';

  function construirCabecera() {
    var cab = document.getElementById("cabecera");
    if (!cab) return;
    cab.className = "cabecera";
    cab.innerHTML =
      '<div class="contenedor">' +
      '<a class="marca" href="index.html">' + MARCA_SVG + '<span>Humanidades</span></a>' +
      '<nav aria-label="Las cinco páginas"><ol class="nav-paginas">' +
      PAGINAS.map(function (p) {
        var cls = (p.n === numActual ? "actual " : "") + (memoria.visitadas.indexOf(p.n) > -1 ? "vista" : "");
        return '<li class="' + cls + '"><a href="' + p.archivo + '"' + (p.n === numActual ? ' aria-current="page"' : "") + ' title="' + p.titulo + '">' +
          '<span class="n">' + p.n + '</span><span class="t">' + p.corto + '</span></a></li>';
      }).join("") +
      '</ol></nav></div>';
  }

  /* ---------- Encabezado de cada página ---------- */
  function rellenarEncabezado() {
    if (!actual) return;
    var c = $(".encabezado-estacion .circulo");
    if (c && !c.textContent.trim()) c.textContent = actual.n;
    var b = $(".encabezado-estacion .bloque-nombre");
    if (b && !b.textContent.trim()) b.textContent = BLOQUES[actual.b];
    var m = $(".meta-estacion");
    if (m && !m.textContent.trim()) m.textContent = "Página " + actual.n + " de " + PAGINAS.length + ".";
  }

  /* ---------- Cierre de página ---------- */
  function construirCierre() {
    var lugar = document.getElementById("cierre");
    if (!lugar || !actual) return;
    var ant = PAGINAS[numActual - 2], sig = PAGINAS[numActual];
    lugar.className = "cierre-estacion contenedor";
    lugar.innerHTML =
      '<nav class="navegacion-estaciones" aria-label="Páginas vecinas">' +
      (ant ? '<a href="' + ant.archivo + '"><span class="dir">Página anterior</span><span class="nom">' + ant.n + '. ' + ant.titulo + '</span></a>' : '<span></span>') +
      (sig ? '<a class="sig" href="' + sig.archivo + '"><span class="dir">Página siguiente</span><span class="nom">' + sig.n + '. ' + sig.titulo + '</span></a>' : '<a class="sig" href="index.html"><span class="dir">Fin del recorrido</span><span class="nom">Volver al inicio</span></a>') +
      '</nav>';
  }

  /* ---------- Pie ---------- */
  function construirPie() {
    var pie = document.getElementById("pie");
    if (!pie) return;
    pie.className = "pie";
    pie.innerHTML = '<div class="franja" aria-hidden="true"></div><div class="contenedor">' +
      '<div><p>Trabajo grupal de la segunda parte de Humanidades para Ingeniería, sobre el módulo «Conceptos básicos de Ingeniería Química e Industrial».</p>' +
      '<p>Grupo 2: ' + GRUPO.join(", ") + '.</p>' +
      '<p>Universidad Nacional de Colombia, Sede Manizales. Facultad de Ingeniería y Arquitectura.</p></div>' +
      '<div><p><strong>Las cinco páginas</strong></p><ul>' + PAGINAS.map(function (p) { return '<li><a href="' + p.archivo + '">' + p.n + '. ' + p.titulo + '</a></li>'; }).join("") + '</ul></div>' +
      '<div><p><strong>Fuentes</strong></p><p>Cada página cita sus fuentes al final. La bibliografía completa y los créditos de las fotos están en la <a href="integracion.html#fuentes">página 5</a>.</p></div>' +
      '</div>';
  }

  /* ---------- Preguntas de opción múltiple ---------- */
  function iniciarPreguntas(ctx) {
    $$(".pregunta[data-correcta]", ctx).forEach(function (p) {
      if (p.dataset.listo) return;
      p.dataset.listo = "1";
      var correcta = p.getAttribute("data-correcta");
      var botones = $$(".opciones button", p);
      botones.forEach(function (b, i) {
        if (!b.querySelector(".letra")) b.insertAdjacentHTML("afterbegin", '<span class="letra">' + "abcdefgh"[i] + ')</span>');
        b.type = "button";
        b.addEventListener("click", function () {
          var ok = b.getAttribute("data-op") === correcta;
          botones.forEach(function (o) {
            o.disabled = true;
            if (o.getAttribute("data-op") === correcta) o.classList.add("correcta");
          });
          if (!ok) b.classList.add("incorrecta");
          p.classList.add("respondida");
          var exp = $(".explicacion", p);
          if (exp) {
            exp.classList.add(ok ? "bien" : "mal");
            if (!exp.dataset.prefijo) { exp.insertAdjacentHTML("afterbegin", "<strong>" + (ok ? "Correcto. " : "No es esa. ") + "</strong>"); exp.dataset.prefijo = "1"; }
          }
          p.dispatchEvent(new CustomEvent("respondida", { bubbles: true, detail: { correcta: ok } }));
        });
      });
    });
  }

  /* ---------- Clasificador ----------
     clasificador(ul, casos, opciones, marcador)
     casos: [{ t: "texto", r: "clave correcta", por: "explicación" }]
     opciones: { clave: "Nombre visible", ... } */
  function clasificador(ul, casos, opciones, marcador) {
    if (!ul) return;
    ul.classList.add("clasificador");
    var claves = Object.keys(opciones), ok = 0;
    function pintarMarcador() { if (marcador) marcador.textContent = "Aciertos: " + ok + " de " + casos.length; }
    casos.forEach(function (c, i) {
      var li = document.createElement("li");
      li.innerHTML = "<span>" + c.t + "</span><span class='segmentado' role='group' aria-label='Respuesta para el caso " + (i + 1) + "'>" +
        claves.map(function (k) { return "<button type='button' data-r='" + k + "' aria-pressed='false'>" + opciones[k] + "</button>"; }).join("") +
        "</span><p class='razon' hidden></p>";
      $$("button", li).forEach(function (b) {
        b.addEventListener("click", function () {
          if (li.dataset.hecho) return;
          li.dataset.hecho = "1";
          var acierto = b.getAttribute("data-r") === c.r;
          $$("button", li).forEach(function (o) { o.disabled = true; });
          b.setAttribute("aria-pressed", "true");
          li.classList.add(acierto ? "ok" : "no");
          var r = $(".razon", li); r.hidden = false;
          r.innerHTML = "<strong>" + (acierto ? "Bien. " : "Era «" + opciones[c.r] + "». ") + "</strong>" + (c.por || "");
          if (acierto) ok++;
          pintarMarcador();
        });
      });
      ul.appendChild(li);
    });
    pintarMarcador();
  }

  /* ---------- Fotos ----------
     <figure class="foto" data-foto="clave" data-leyenda="..."> toma la imagen de js/imagenes.js.
     Si la foto no carga (sin internet o enlace roto), la figura se oculta. */
  function iniciarFotos() {
    $$("figure.foto[data-foto]").forEach(function (fig) {
      var d = IMAGENES[fig.getAttribute("data-foto")];
      if (!d) { fig.hidden = true; return; }
      var src = d.archivo ? "img/" + d.archivo : d.src;
      var leyenda = fig.getAttribute("data-leyenda") || d.leyenda || "";
      fig.innerHTML = '<img src="' + src + '" alt="' + (d.alt || "").replace(/"/g, "&quot;") + '" loading="lazy" decoding="async" referrerpolicy="no-referrer">' +
        '<figcaption>' + leyenda + '<span class="credito">' + d.credito + (d.pagina ? ' <a href="' + d.pagina + '">Fuente</a>' : "") + '</span></figcaption>';
      var img = $("img", fig);
      if (d.posicion) img.style.objectPosition = d.posicion;
      function ocultar() { fig.hidden = true; }
      img.addEventListener("error", ocultar);
      if (img.complete && !img.naturalWidth && img.src) ocultar();
    });
    /* Imagen suelta dentro de otro elemento (por ejemplo, una tarjeta que es enlace): <img data-foto="clave" alt=""> */
    $$("img[data-foto]").forEach(function (img) {
      var d = IMAGENES[img.getAttribute("data-foto")];
      if (!d) { img.remove(); return; }
      img.alt = d.alt || ""; img.loading = "lazy"; img.decoding = "async"; img.referrerPolicy = "no-referrer";
      if (d.posicion) img.style.objectPosition = d.posicion;
      img.addEventListener("error", function () { img.remove(); });
      img.src = d.archivo ? "img/" + d.archivo : d.src;
    });
    /* Crédito suelto: <span data-credito="clave"></span> */
    $$("[data-credito]").forEach(function (el) {
      var d = IMAGENES[el.getAttribute("data-credito")];
      if (d) el.innerHTML = d.credito.replace(/^Foto:\s*/, "").replace(/,?\s*(vía )?Wikimedia Commons\.?$/, "").replace(/\.$/, "") + (d.pagina ? ' (<a href="' + d.pagina + '">fuente</a>)' : "");
    });
  }

  /* ---------- Videos ----------
     <figure class="video" data-youtube="ID" data-titulo="..." data-canal="..." data-leyenda="...">
     Muestra la miniatura con un botón; el video de YouTube solo se carga al tocarlo
     (así la página abre rápido y YouTube no se carga si nadie lo ve). */
  function iniciarVideos() {
    $$("figure.video[data-youtube]").forEach(function (fig) {
      var id = fig.getAttribute("data-youtube"), titulo = fig.getAttribute("data-titulo") || "Video";
      var canal = fig.getAttribute("data-canal") || "", leyenda = fig.getAttribute("data-leyenda") || "";
      var enlace = "https://www.youtube.com/watch?v=" + id;
      fig.innerHTML = '<button type="button" class="video-portada" aria-label="Ver el video: ' + titulo.replace(/"/g, "&quot;") + '">' +
        '<img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">' +
        '<span class="video-boton" aria-hidden="true"></span><span class="video-titulo">' + titulo + '</span></button>' +
        '<figcaption>' + leyenda + '<span class="credito">Video: ' + canal + ', en YouTube. <a href="' + enlace + '">Verlo en YouTube</a></span></figcaption>';
      var img = $("img", fig);
      img.addEventListener("error", function () { img.remove(); });
      $(".video-portada", fig).addEventListener("click", function () {
        var marco = document.createElement("div");
        marco.className = "video-marco";
        marco.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="' + titulo.replace(/"/g, "&quot;") + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
        this.replaceWith(marco);
        $("iframe", marco).focus();
      });
    });
  }

  /* ---------- Arranque ---------- */
  construirCabecera();
  rellenarEncabezado();
  construirCierre();
  construirPie();
  iniciarFotos();
  iniciarVideos();
  iniciarPreguntas(document);

  window.Planta = {
    PAGINAS: PAGINAS, GRUPO: GRUPO, IMAGENES: IMAGENES,
    $: $, $$: $$, fmt: fmt, svg: svg, store: store,
    iniciarPreguntas: iniciarPreguntas, clasificador: clasificador
  };
})();
