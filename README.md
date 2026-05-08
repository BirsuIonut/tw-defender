# tw-defender

Tribal Wars defense coordinator — v1 (local-only, no backend).

Each player pastes their incomings as BB-code from the in-game forum export
and the app dedupes/tracks them. An admin mode (UI toggle) reveals a
"duplicates" report that flags source villages hitting more than one defender —
the classic fake-finder, since one nuke can only land in one place.

## Stack

- React 19 + Vite + TypeScript
- React Router
- Tailwind CSS
- Vitest + @testing-library/react
- Storage: `localStorage` (data layer is behind a repo interface so v2 can swap
  in Firestore without touching call sites)

## Scripts

```bash
npm install
npm run dev        # dev server
npm test           # run unit tests
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

## Try it

1. `npm run dev`, open the app.
2. Top-right: add a player ("Acting as → +"), e.g. `Alice`.
3. Paste BB-code into "Import incomings" → Preview → Save.
   A sample fixture lives at `src/parsing/__fixtures__/sample-bb.txt`.
4. Add a second player (`Bob`), paste a list that shares a source village with
   Alice's.
5. Toggle "Admin" in the header → open "Duplicates". The shared source
   village appears as a group — click "Real" on the one you believe is the
   actual nuke; the rest are marked `ignored`.

## Where data lives

- `twd:players`         → `Player[]`
- `twd:attacks`         → `Attack[]`
- `twd:currentPlayer`   → string
- `twd:role`            → `'player' | 'admin'`
- `twd:schemaVersion`   → number

Inspect in DevTools → Application → Local Storage.

## Deploying to GitHub Pages

The repo ships a workflow at `.github/workflows/deploy.yml` that builds and
publishes `dist/` to GitHub Pages on every push to `main` or
`claude/tribal-wars-coordinator-NC25L` (and on manual dispatch).

To enable it once on GitHub:

1. **Settings → Pages → Build and deployment → Source: "GitHub Actions"**.
2. **Settings → Actions → General → Workflow permissions: "Read and write
   permissions"** (the workflow needs `pages: write` and `id-token: write`,
   already declared in the workflow).
3. Push (or hit *Run workflow* from the Actions tab) — the deploy job's
   summary will show the live URL, normally
   `https://birsuionut.github.io/tw-defender/`.

Implementation notes baked into the build:

- `vite.config.ts` sets `base: '/tw-defender/'` (override with the `VITE_BASE`
  env var if you point a custom domain at the repo).
- `src/router.tsx` reads `import.meta.env.BASE_URL` so client-side routes work
  under the sub-path.
- A `postbuild` step copies `dist/index.html` to `dist/404.html` — that's the
  standard GitHub Pages SPA fallback so a refresh on `/admin/duplicates`
  re-loads the app instead of 404'ing.

## Roadmap (v2)

Replace `src/data/localStorageRepo.ts` with a Firestore-backed implementation
of the same `AttacksRepo` / `PlayersRepo` interfaces, add Firebase Auth (Google
sign-in) and a real `admin` custom claim. Subcollection layout
`players/{uid}/attacks/{attackId}` to dodge the 1 MiB doc limit and avoid
last-write-wins clobbering between admin and player edits.
