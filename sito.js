/* ===================================================================
   Timbra — comportamenti del sito. Niente librerie, niente build.
   Tutto parte da solo: se una parte non trova il suo pezzo di pagina,
   semplicemente non fa niente e il resto continua a funzionare.
   =================================================================== */
(function () {
  "use strict";

  var fermo = window.matchMedia &&
              window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------- menu del telefono */
  var tasto = document.getElementById("apri-menu");
  var menu  = document.getElementById("menu");

  if (tasto && menu) {
    function chiudi() {
      menu.classList.remove("aperto");
      tasto.setAttribute("aria-expanded", "false");
      tasto.setAttribute("aria-label", "Apri il menu");
    }
    tasto.addEventListener("click", function (e) {
      e.stopPropagation();
      var aperto = menu.classList.toggle("aperto");
      tasto.setAttribute("aria-expanded", aperto ? "true" : "false");
      tasto.setAttribute("aria-label", aperto ? "Chiudi il menu" : "Apri il menu");
    });
    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target) && !tasto.contains(e.target)) chiudi();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") chiudi();
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") chiudi();
    });
  }

  /* ------------------------------- la barra in alto si stacca dal bordo */
  var barra = document.querySelector(".barra");
  if (barra) {
    var ultimo = -1;
    function guarda() {
      var giu = window.scrollY > 8;
      if (giu !== ultimo) { barra.classList.toggle("giu", giu); ultimo = giu; }
    }
    guarda();
    window.addEventListener("scroll", guarda, { passive: true });
  }

  /* ------------------------------- le cose compaiono mentre scendi ---- */
  var daMostrare = document.querySelectorAll(".su, .avvisi, .numeroni");
  if (daMostrare.length) {
    if (fermo || !("IntersectionObserver" in window)) {
      for (var i = 0; i < daMostrare.length; i++) daMostrare[i].classList.add("visibile");
    } else {
      var occhio = new IntersectionObserver(function (voci) {
        voci.forEach(function (v) {
          if (v.isIntersecting) { v.target.classList.add("visibile"); occhio.unobserve(v.target); }
        });
      }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });
      for (var j = 0; j < daMostrare.length; j++) occhio.observe(daMostrare[j]);
    }
  }

  /* ------------------------------- la tessera che si riempie da sola -- */
  var tessera = document.querySelector("[data-tessera]");
  if (tessera) {
    var bolli   = tessera.querySelectorAll(".timbro");
    var premio  = tessera.querySelector(".premio");
    var conta   = tessera.querySelector(".conta-timbri");
    var totale  = bolli.length;
    var partita = false;

    function scrivi(n) {
      if (conta) conta.textContent = n + " di " + totale + " timbri";
    }

    function riempi() {
      if (partita) return;
      partita = true;

      if (fermo) {                       /* niente animazione: mostra il finale */
        for (var k = 0; k < totale; k++) bolli[k].classList.add("pieno");
        scrivi(totale);
        if (premio) premio.classList.add("visto");
        return;
      }

      var n = 0;
      (function passo() {
        if (n >= totale) {
          if (premio) setTimeout(function () { premio.classList.add("visto"); }, 260);
          return;
        }
        var b = bolli[n];
        b.classList.add("pieno", "batte");
        (function (el) { setTimeout(function () { el.classList.remove("batte"); }, 460); })(b);
        n++;
        scrivi(n);
        setTimeout(passo, n === totale ? 420 : 230);
      })();
    }

    if (!("IntersectionObserver" in window)) {
      riempi();
    } else {
      var o2 = new IntersectionObserver(function (voci) {
        voci.forEach(function (v) { if (v.isIntersecting) { riempi(); o2.disconnect(); } });
      }, { threshold: 0.4 });
      o2.observe(tessera);
    }
  }

  /* ------------------------------- i numeri che salgono --------------- */
  var numeri = document.querySelectorAll("[data-sale]");
  if (numeri.length) {
    function sali(el) {
      var meta = parseInt(el.getAttribute("data-sale"), 10) || 0;
      if (fermo) { el.textContent = meta; return; }
      var inizio = null, durata = 1100;
      function giro(ora) {
        if (inizio === null) inizio = ora;
        var p = Math.min((ora - inizio) / durata, 1);
        var morbido = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(meta * morbido);
        if (p < 1) requestAnimationFrame(giro);
      }
      requestAnimationFrame(giro);
    }
    if (!("IntersectionObserver" in window)) {
      for (var m = 0; m < numeri.length; m++) sali(numeri[m]);
    } else {
      var o3 = new IntersectionObserver(function (voci) {
        voci.forEach(function (v) {
          if (v.isIntersecting) { sali(v.target); o3.unobserve(v.target); }
        });
      }, { threshold: 0.6 });
      for (var n2 = 0; n2 < numeri.length; n2++) o3.observe(numeri[n2]);
    }
  }

  /* ------------------------------- anno nel piede --------------------- */
  var anno = document.querySelectorAll("[data-anno]");
  for (var a = 0; a < anno.length; a++) anno[a].textContent = new Date().getFullYear();
})();
