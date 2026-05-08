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

## Roadmap (v2)

Replace `src/data/localStorageRepo.ts` with a Firestore-backed implementation
of the same `AttacksRepo` / `PlayersRepo` interfaces, add Firebase Auth (Google
sign-in) and a real `admin` custom claim. Subcollection layout
`players/{uid}/attacks/{attackId}` to dodge the 1 MiB doc limit and avoid
last-write-wins clobbering between admin and player edits.
