(function () {
  var data = window.ARCADE;
  var key = document.body.getAttribute("data-tier");
  var tier = data && data.tiers[key];
  if (!tier) return;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  /* ---------- one-time welcome note (remembered per tier, on this device) ---------- */
  var seenKey = "arcade-welcome-2026-" + key;
  function seen() { try { return localStorage.getItem(seenKey) === "1"; } catch (e) { return false; } }
  function markSeen() { try { localStorage.setItem(seenKey, "1"); } catch (e) {} }

  var root = document.documentElement;
  var showWelcome = !seen();
  if (showWelcome) root.classList.add("welcome-open");   // page animations wait until the note is closed

  function openWelcome() {
    var overlay = el("div", "welcome");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "welcome-title");

    var colors = ["#ffc93c", "#ff7a5c", "#5ed3a8", "#b7a1ff", "#6ec8ff", "#ff8fc7"];
    for (var i = 0; i < 18; i++) {
      var bit = el("span", "bit");
      bit.style.setProperty("--x", Math.round(Math.random() * 100) + "%");
      bit.style.setProperty("--d", (Math.random() * 3).toFixed(2) + "s");
      bit.style.setProperty("--t", (3 + Math.random() * 3).toFixed(2) + "s");
      bit.style.setProperty("--c", colors[i % colors.length]);
      overlay.appendChild(bit);
    }

    var card = el("div", "welcome-card");
    var art = el("img", "welcome-art");
    art.alt = "";
    art.setAttribute("aria-hidden", "true");
    var css = document.querySelector('link[rel="stylesheet"][href*="lobby.css"]');
    art.src = new URL("mojo-kate.png", css.href).href;
    card.appendChild(art);
    var copy = el("div", "welcome-copy");
    var h = el("h2", "welcome-title", "¡Gracias por este 2026!");
    h.id = "welcome-title";
    copy.appendChild(h);
    copy.appendChild(el("p", "welcome-text",
      "Gracias por tu trabajo y por el tiempo que compartimos en la clase de Technology durante este año maravilloso. " +
      "Fue un gusto aprender contigo. Este arcade es mi regalo para ti."));
    var sign = el("p", "welcome-sign");
    sign.appendChild(el("span", "name-line", "Juan Diego Cuéllar"));
    sign.appendChild(el("span", "role-line", "Tu profe de Technology"));
    copy.appendChild(sign);
    var btn = el("button", "btn3d welcome-btn", "¡A jugar!");
    btn.type = "button";
    copy.appendChild(btn);
    card.appendChild(copy);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    card.tabIndex = -1;
    card.focus({ preventScroll: true });   // no focus ring on the button for touch users; Tab still reaches it

    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      markSeen();
      overlay.classList.add("is-closing");
      root.classList.remove("welcome-open");
      setTimeout(function () { overlay.remove(); }, 300);
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    btn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.addEventListener("keydown", onKey);
  }

  var games = tier.games
    .map(function (id) { return data.games[id]; })
    .filter(function (g) { return g && g.status !== "spare"; });

  document.title = "Arcade de vacaciones";
  document.getElementById("tier-name").textContent = tier.name;
  document.getElementById("tier-count").textContent =
    "Tus " + games.length + " juegos";
  document.getElementById("stamp").style.setProperty("--tier-color", tier.color);

  var list = document.getElementById("games");
  games.forEach(function (g, index) {
    var soon = g.status === "soon";
    var card = el("li", "sticker" + (soon ? " is-soon" : ""));
    card.style.setProperty("--i", index);

    var art = el("div", "art");
    art.appendChild(el("span", "emoji", g.icon));
    art.setAttribute("aria-hidden", "true");
    art.style.setProperty("--art", g.art);
    card.appendChild(art);

    var body = el("div", "body");
    body.appendChild(el("h2", "name", g.name));
    body.appendChild(el("p", "blurb", g.blurb));
    if (g.devices && !soon) body.appendChild(el("p", "tag", g.devices));
    if (g.tip && !soon) body.appendChild(el("p", "tip", g.tip));
    card.appendChild(body);

    if (soon) {
      var pill = el("p", "soon-pill", "Se activa pronto");
      card.appendChild(pill);
    } else {
      var a = el("a", "play", "Jugar");
      a.href = g.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", "Jugar " + g.name + " (se abre en otra pestaña)");
      card.appendChild(a);
    }
    list.appendChild(card);
  });

  if (showWelcome) openWelcome();
})();
