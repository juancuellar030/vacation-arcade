/*
  THE ONLY FILE YOU NEED TO EDIT.

  status:
    "live"  -> card has a Play button
    "soon"  -> card shows "Se activa pronto" (no link yet)
    "spare" -> not shown anywhere; kept here as a replacement if a game dies

  To activate Petalspire or Cube Basher: change "soon" to "live", push, done.
  The QR codes never change because they point to the tier pages, not to the games.

  Tier order = order the cards appear.
*/
window.ARCADE = {
  games: {
    messenger: {
      name: "Messenger",
      icon: "✉️",
      art: "var(--sea)",
      status: "live",
      url: "https://messenger.abeto.co/",
      blurb: "Eres cartero en un planeta diminuto. Reparte cartas y explora con calma.",
      devices: "Celular, tablet o PC",
      tip: "Si te pide un nombre, usa un apodo."
    },
    pvz2: {
      name: "Plants vs Zombies 2",
      icon: "🌻",
      art: "var(--mint)",
      status: "live",
      url: "https://pvz.ee/plants-vs-zombies-2/",
      blurb: "Planta defensas y detén a los zombis antes de que lleguen a tu jardín.",
      devices: "Celular, tablet o PC",
      tip: "Gira el celular de lado y toca pantalla completa. Puede mostrar anuncios: ciérralos."
    },
    townscaper: {
      name: "Townscaper",
      icon: "🏘️",
      art: "var(--sun)",
      status: "live",
      url: "https://townscaper.org/",
      blurb: "Construye un pueblo junto al mar, bloque por bloque. Sin reglas y sin puntos.",
      devices: "",
      tip: ""
    },
    petalspire: {
      name: "Petalspire",
      icon: "🌸",
      art: "var(--pink)",
      status: "live",
      url: "https://schwarzespiele.itch.io/petalspire",
      blurb: "Un juego de plantar flores y verlas crecer.",
      devices: "Celular",
      tip: ""
    },
    cubebasher: {
      name: "Cube Basher",
      icon: "🔨",
      art: "var(--grape)",
      status: "soon",
      url: "https://juancuellar030.github.io/cube-basher/",
      blurb: "Sobrevive 30 minutos con tu martillo contra cubos malvados.",
      devices: "",
      tip: ""
    },
    gourdlets: {
      name: "Gourdlets",
      icon: "🎃",
      art: "var(--coral)",
      status: "spare",
      url: "https://aunty-games.itch.io/gourdlets",
      blurb: "Construye una ciudad de calabazas.",
      devices: "Solo computador",
      tip: ""
    }
  },

  tiers: {
    explorer: { name: "Explorador", color: "var(--mint)",  games: ["messenger", "pvz2"] },
    champion: { name: "Campeón",    color: "var(--sun)",   games: ["messenger", "pvz2", "townscaper"] },
    legend:   { name: "Leyenda",    color: "var(--grape)", games: ["messenger", "pvz2", "townscaper", "petalspire", "cubebasher"] }
  }
};
