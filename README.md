# Arcade de vacaciones

Static site: three lobby pages (one per prize tier), no build step, no student data.

## Tier pages (these are what the QR codes point to)

| Tier | Who | Path |
|---|---|---|
| Explorador | everyone | `/play/56d9bwve/` |
| Campeón | 2nd and 3rd place | `/play/00vri4m1/` |
| Leyenda | 1st place | `/play/ag6x60he/` |

The paths are unguessable on purpose. They are not a password: anyone with the link can open it.
The pages use `no-referrer`, so the link is not passed on to the game sites when kids click "Jugar".
The root `index.html` does not list the tier paths. Don't link them anywhere public.

## Change games

Edit only `assets/games.js`:

- `status: "live"` shows a Play button
- `status: "soon"` shows "Se activa pronto"
- `status: "spare"` hides the game (a replacement if one dies)
- tier lists are in `tiers` at the bottom of the file

Push, and every tier updates. The QR codes never change.

## Publish on GitHub Pages

1. Create a repo (for example `vacation-arcade`) and upload the contents of this folder.
2. Settings > Pages > Deploy from branch > `main` / root.
3. Your URL will be `https://juancuellar030.github.io/vacation-arcade/play/<tier-path>/`.

Put the QR codes on that URL, and open each one on a phone before printing.

## Before each ranking

Open every live game on a phone. Third-party sites can add ads or break without warning.
