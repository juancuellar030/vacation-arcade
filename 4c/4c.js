/*
  Private 4C page.
  The QR link carries a secret key after "#k=". The browser never sends that part to the server.
  The key unlocks this student's bundle (name, avatar, tier, message, optional video) in d/<id>.bin.
  Nothing readable about any student is stored on the website: every file in d/ is AES-GCM encrypted.
*/
(function () {
  "use strict";

  var KEY_STORE = "arcade-4c-key";
  var app = document.getElementById("app");
  var lockView = document.getElementById("lock");
  var loading = document.getElementById("loading");

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function lock(msg) {
    loading.hidden = true;
    app.hidden = true;
    if (msg) document.getElementById("lock-msg").textContent = msg;
    lockView.hidden = false;
  }

  /* ---------- crypto helpers ---------- */
  function fromB64url(s) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function toHex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) {
      return ("0" + b.toString(16)).slice(-2);
    }).join("");
  }
  function fileIdFor(keyBytes) {
    var prefix = new TextEncoder().encode("4c-id:");
    var msg = new Uint8Array(prefix.length + keyBytes.length);
    msg.set(prefix); msg.set(keyBytes, prefix.length);
    return crypto.subtle.digest("SHA-256", msg).then(function (h) { return toHex(h).slice(0, 24); });
  }
  function fail(kind) { var e = new Error(kind); e.kind = kind; return e; }

  // Downloads d/<id>.bin and decrypts it. Errors: kind "net" (offline), "missing" (404), "bad" (wrong key).
  function fetchDecrypt(id, keyBytes) {
    return fetch("d/" + id + ".bin", { cache: "no-cache" })
      .catch(function () { throw fail("net"); })
      .then(function (r) {
        if (r.status === 404) throw fail("missing");
        if (!r.ok) throw fail("net");
        return r.arrayBuffer();
      })
      .then(function (buf) {
        return crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["decrypt"]).then(function (k) {
          return crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(buf, 0, 12) }, k, new Uint8Array(buf, 12));
        }).catch(function (e) { if (e && e.kind) throw e; throw fail("bad"); });
      });
  }

  /* ---------- key from the QR link, then remembered on this device ---------- */
  function readKey() {
    var m = location.hash.match(/(?:^#|&)k=([A-Za-z0-9_-]{16,64})/);
    if (m) {
      try { localStorage.setItem(KEY_STORE, m[1]); } catch (e) {}
      // drop the key from the address bar, so a copied or shared URL carries nothing
      history.replaceState(null, "", location.pathname + location.search);
      return m[1];
    }
    try { return localStorage.getItem(KEY_STORE); } catch (e) { return null; }
  }
  function forgetKey() { try { localStorage.removeItem(KEY_STORE); } catch (e) {} }

  /* ---------- welcome note: once per student, per device ---------- */
  function openWelcome(b, seenKey, onClose) {
    var root = document.documentElement;
    root.classList.add("welcome-open");
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
    if (b.avatar) {
      var art = el("img", "welcome-art is-avatar");
      art.alt = "";
      art.setAttribute("aria-hidden", "true");
      art.src = b.avatar;
      card.appendChild(art);
    }
    var copy = el("div", "welcome-copy");
    var h = el("h2", "welcome-title", "¡Gracias, " + b.first + "!");
    h.id = "welcome-title";
    copy.appendChild(h);
    copy.appendChild(el("p", "welcome-text", b.message));
    var sign = el("p", "welcome-sign");
    sign.appendChild(el("span", "name-line", b.signName || "Juan Diego Cuéllar"));
    sign.appendChild(el("span", "role-line", b.signRole || "Tu director de grupo"));
    copy.appendChild(sign);
    var btn = el("button", "btn3d welcome-btn", "¡Vamos!");
    btn.type = "button";
    copy.appendChild(btn);
    card.appendChild(copy);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    card.tabIndex = -1;
    card.focus({ preventScroll: true });

    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      try { localStorage.setItem(seenKey, "1"); } catch (e) {}
      overlay.classList.add("is-closing");
      root.classList.remove("welcome-open");
      setTimeout(function () { overlay.remove(); }, 300);
      document.removeEventListener("keydown", onKey);
      if (onClose) onClose();
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    btn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.addEventListener("keydown", onKey);
  }

  /* ---------- games (same data and look as the tier pages) ---------- */
  function renderGames(tierKey) {
    var data = window.ARCADE, tier = data && data.tiers[tierKey];
    if (!tier) return;
    document.body.setAttribute("data-tier", tierKey);
    var games = tier.games.map(function (id) { return data.games[id]; })
      .filter(function (g) { return g && g.status !== "spare"; });
    document.getElementById("tier-name").textContent = tier.name;
    document.getElementById("tier-count").textContent = "Tus " + games.length + " juegos";
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
        card.appendChild(el("p", "soon-pill", "Se activa pronto"));
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
  }

  /* ---------- parents' clips: each one only downloaded when the student taps it ---------- */
  function setupVideos(list) {
    var section = document.getElementById("message");
    var holder = document.getElementById("clips");
    if (list.length > 1) document.getElementById("message-title").textContent = "Mensajes especiales para ti";
    section.hidden = false;
    list.forEach(function (v, i) {
      var box = el("div", "video-box");
      var btn = el("button", "btn3d", list.length > 1 ? "▶ Ver el mensaje " + (i + 1) : "▶ Ver el mensaje");
      btn.type = "button";
      var video = el("video");
      video.controls = true;
      video.setAttribute("playsinline", "");
      video.hidden = true;
      var status = el("p", "status");
      status.setAttribute("role", "status");
      box.appendChild(btn); box.appendChild(video); box.appendChild(status);
      holder.appendChild(box);
      btn.addEventListener("click", function () {
        btn.disabled = true;
        status.textContent = "Cargando tu mensaje…";
        fetchDecrypt(v.id, fromB64url(v.key)).then(function (plain) {
          video.src = URL.createObjectURL(new Blob([plain], { type: v.type || "video/mp4" }));
          video.hidden = false;
          btn.hidden = true;
          status.textContent = "";
          holder.querySelectorAll("video").forEach(function (o) { if (o !== video) o.pause(); });
          var p = video.play();
          if (p && p.catch) p.catch(function () {});
        }).catch(function (e) {
          btn.disabled = false;
          status.textContent = e.kind === "net"
            ? "No se pudo cargar. Revisa tu conexión e inténtalo de nuevo."
            : "Este mensaje no está disponible. Avísale a tu profe.";
        });
      });
    });
  }

  /* ---------- class photos: decrypted one at a time, the next one preloaded ---------- */
  function setupGallery(g) {
    var groupKey = fromB64url(g.key);
    fetchDecrypt(g.id, groupKey).then(function (plain) {
      var photos = JSON.parse(new TextDecoder().decode(plain)).photos || [];
      if (!photos.length) return;
      var section = document.getElementById("gallery");
      var img = document.getElementById("photo");
      var counter = document.getElementById("counter");
      var auto = document.getElementById("autoplay");
      var cache = {}, idx = 0, timer = null, playing = true;
      section.hidden = false;

      function load(i) {
        if (!cache[i]) {
          cache[i] = fetchDecrypt(photos[i].id, groupKey).then(function (buf) {
            return URL.createObjectURL(new Blob([buf], { type: "image/jpeg" }));
          });
        }
        return cache[i];
      }
      function show(i) {
        idx = (i + photos.length) % photos.length;
        var want = idx;
        img.classList.add("is-loading");
        counter.textContent = (idx + 1) + " / " + photos.length;
        load(idx).then(function (url) {
          if (want !== idx) return;
          img.src = url;
          img.classList.remove("is-loading");
        }).catch(function () { delete cache[want]; });
        if (photos.length > 1) load((idx + 1) % photos.length).catch(function () {});
      }
      function schedule() {
        clearInterval(timer);
        if (playing && photos.length > 1) timer = setInterval(function () { show(idx + 1); }, 5000);
      }
      function setPlaying(on) {
        playing = on;
        auto.textContent = on ? "⏸ Pausar" : "▶ Reproducir";
        schedule();
      }
      document.getElementById("prev").addEventListener("click", function () { show(idx - 1); setPlaying(false); });
      document.getElementById("next").addEventListener("click", function () { show(idx + 1); setPlaying(false); });
      auto.addEventListener("click", function () { setPlaying(!playing); });

      // swipe
      var frame = document.getElementById("frame"), x0 = null;
      frame.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
      frame.addEventListener("pointerup", function (e) {
        if (x0 === null) return;
        var dx = e.clientX - x0; x0 = null;
        if (Math.abs(dx) > 40) { show(idx + (dx < 0 ? 1 : -1)); setPlaying(false); }
      });
      document.addEventListener("keydown", function (e) {
        if (document.querySelector(".welcome")) return;
        if (e.key === "ArrowRight") { show(idx + 1); setPlaying(false); }
        if (e.key === "ArrowLeft") { show(idx - 1); setPlaying(false); }
      });

      show(0);
      schedule();
    }).catch(function () { /* gallery stays hidden if it can't be opened */ });
  }

  /* ---------- page ---------- */
  function render(b, id) {
    loading.hidden = true;
    app.hidden = false;
    document.title = "Arcade 4C · " + b.first;

    var hello = document.getElementById("hello");
    hello.textContent = "";
    if (b.avatar) {
      var me = el("img", "me");
      me.alt = "";
      me.src = b.avatar;
      hello.appendChild(me);
    }
    hello.appendChild(document.createTextNode("¡Hola, " + b.first + "!"));

    renderGames(b.tier);
    var clips = b.videos || (b.video ? [b.video] : []);
    if (clips.length) setupVideos(clips);
    if (b.gallery) setupGallery(b.gallery);

    document.getElementById("forget").addEventListener("click", function () {
      if (!confirm("¿Olvidar tu tarjeta en este dispositivo? Para volver a entrar tendrás que escanearla otra vez.")) return;
      forgetKey();
      try { localStorage.removeItem("arcade-4c-welcome-" + id); } catch (e) {}
      location.reload();
    });

    var seenKey = "arcade-4c-welcome-" + id, seen = false;
    try { seen = localStorage.getItem(seenKey) === "1"; } catch (e) {}
    if (!seen) openWelcome(b, seenKey);
  }

  function main() {
    if (!window.crypto || !crypto.subtle || !window.TextEncoder || !window.fetch) {
      return lock("Este navegador es muy antiguo para abrir tu arcade. Prueba con Chrome o Safari actualizados.");
    }
    var key = readKey();
    if (!key) return lock();
    var keyBytes;
    try { keyBytes = fromB64url(key); } catch (e) { forgetKey(); return lock(); }
    if (keyBytes.length !== 16) { forgetKey(); return lock(); }

    fileIdFor(keyBytes).then(function (id) {
      return fetchDecrypt(id, keyBytes).then(function (plain) {
        render(JSON.parse(new TextDecoder().decode(plain)), id);
      });
    }).catch(function (e) {
      if (e && e.kind === "net") {
        return lock("No hay conexión a internet. Conéctate y vuelve a abrir la página.");
      }
      forgetKey();   // wrong or replaced card: don't keep a dead key on the device
      lock("Esta tarjeta ya no funciona. Pídele una nueva a tu profe.");
    });
  }

  main();
})();
