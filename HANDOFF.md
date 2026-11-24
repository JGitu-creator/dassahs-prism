# Prism Word and DPEngine Developer Handoff (`HANDOFF.md`)

> Updated: 2026-11-23 (Production Readiness Audit)

## 1. Architecture and Boundaries
- **Unified Portal (`/engine`):** Hosts **Prism Focus** (`/`), **Prism Play** (`/canvas`), and **Prism Word** (`/scripture`) cleanly in a three-card portal layout.
- **Prism Focus Footer (`src/app/page.tsx`):** Kept uncluttered (no `/scripture` link inside Prism Focus footer).
- **Compliance, Privacy, and Access Control (`accessControl.ts`, `serverAuth.ts`, `complianceGuard.ts`, `localVault.ts`):**
  - **Strict Allowlist:** Prism Word (`/scripture` and all `/api/scripture/*` endpoints) is hidden from search indexing (`robots.ts` + `noindex`) and restricted strictly to **`phidotaxis@gmail.com`** and **`chanhadassah@gmail.com`** (via Supabase JWT on Vercel or signed `HttpOnly` local cookie when running offline/local without Supabase env vars).
  - **Private Non Shareable Local Vault:** Notes, Obedience Commitments, Sunday Reflections, and Ask DJ Insights save privately into dedicated subfolders under `D:\downloads\Google Antigravity\DJ's Notes\` (`Passage Notes/`, `Obedience Commitments/`, `Sunday Reflections/`, `Ask DJ Insights/`). No public share or export buttons exist inside Prism Word.
  - Displays licensed Scripture 100% verbatim with publisher copyright notices intact.
  - Never sends licensed Scripture body text (`verbatimText`, `passages`, `verses`, `content`, etc., checked case-insensitively) to any AI endpoint (`study`, `ask-dj`, `song`); offending payloads are rejected with HTTP `400`.
  - Never uses `"sovereign"` or `"divine"` as software or UI labels (`GEMINI.md`).

---

## 2. Resilience, Diagnostics, and Typography
- **Bible Translation Priority (`src/features/scripture/providers/bibleProvider.ts`):**
  1. Crossway ESV API (`ESV_API_KEY`)
  2. YouVersion Platform API (`YVP_APP_KEY` — live verified for NIV and Amplified + 35 extra versions)
  3. API.Bible (`API_BIBLE_KEY` — live verified for NLT, The Message, and KJV)
  4. Guaranteed Public Domain KJV fallback (`bible-api.com` + embedded offline KJV reserve)
- **AI Execution Cascade (`src/features/scripture/studyEngine.ts`):**
  - **Study and Song Studio:** Mistral Pool (`mistral-small-latest`, `mistral-large-latest`, `ministral-14b-2512`) → Gemini Interactions (`gemini-3.5-flash-lite`) → OpenRouter Free Pool → Groq → Built in Offline Study Library.
  - **Ask DJ:** Defaults to **Gemini Interactions SDK** (`previousInteractionId` stateful memory) before cascading Mistral → OpenRouter → Groq → Local guide.
- **Error Recovery and Upkeep (`src/app/api/scripture/health/route.ts`, `PrismWordErrorBoundary.tsx`, `SystemHealthModal.tsx`):**
  - Live `GET /api/scripture/health?probe=1` checks Bible providers, active AI cascade models, and surfaces waiting or upkeep notices with plain next steps.
  - React Error Boundary catches unexpected runtime failures and provides safe reload or cache reset options.
- **Worship Deck and Song Studio (`WorshipStudio.tsx`, `worshipSynth.ts`, `chordUtils.ts`):**
  - Stacked interactive card deck (`Prev`, `Next`, wheel scroll, touch swipe, scrollable strip) with 6+ slides per study, 30 second previews, Apple Music embed, Spotify link or embed, YouTube link or embed, and Lyrics.
  - `normalizeChordProgression` flattens nested AI chord arrays or objects before rendering or Web Audio playback across Amapiano, Afro Gospel, Hymns, Lo Fi, and R&B.
- **Purposeful Strategy Games (`StudyPlayModal.tsx`, `studyGamesData.ts`):**
  - **Covenant Connections (Levels 1 to 4):** 16 tile quartet puzzles with crossover traps.
  - **Exodus Dispatch (Levels 1 to 3):** Spatial blocking lanes plus limited waiting dock capacity (4 slots on Levels 1 and 2, 3 slots on Level 3).
  - **Master Scripture Sudoku:** 6x6 Tactical, 6x6 Expert, and Full 9x9 Grandmaster with Pencil Notes mode.
- **Typography and Contrast:** Lexend reading font (`--font-reading`), dark native dropdown styling (`[color-scheme:dark]` and explicit dark `<option>` contrast), plain British English without decorative middots, slashes, or unnecessary hyphens.

---

## 3. Verification Commands (Windows `.cmd` Shims)
```powershell
node --experimental-strip-types --test scripts/test-prism-word.mjs
npx.cmd tsc --noEmit
npx.cmd eslint src/features/scripture src/app/scripture src/app/api/scripture src/app/engine/page.tsx
npx.cmd next build --webpack
npx.cmd next dev --webpack -p 3000
```

## 4. Upkeep Notes and Going Live
- **Crossway ESV Approval:** Application awaits Crossway review (HTTP `403` currently); ESV automatically falls back to Public Domain KJV while NIV, NLT, Amplified, The Message, and KJV serve live.
- **Framework Upkeep:** Next.js `16.4.5` notes React 18 support will retire in Next.js 17; plan a React 19 upgrade before adopting Next.js 17.
- **Deployment Note:** Set `ESV_API_KEY`, `YVP_APP_KEY`, `API_BIBLE_KEY`, `MISTRAL_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, and `GROQ_API_KEY` inside Vercel project environment variables, then deploy via GitHub push or `npx.cmd vercel --prod`.
