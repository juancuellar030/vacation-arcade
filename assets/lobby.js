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

  var games = tier.games
    .map(function (id) { return data.games[id]; })
    .filter(function (g) { return g && g.status !== "spare"; });

  document.title = "Arcade de vacaciones";
  document.getElementById("tier-name").textContent = tier.name;
  document.getElementById("tier-count").textContent =
    "Tus " + games.length + " juegos";
  document.getElementById("stamp").style.setProperty("--tier-color", tier.color);

  var list = document.getElementById("games");
  games.forEach(function (g) {
    var soon = g.status === "soon";
    var card = el("li", "sticker" + (soon ? " is-soon" : ""));

    var art = el("div", "art", g.icon);
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
})();
