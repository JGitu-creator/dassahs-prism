# Prism Word and DPEngine Developer Handoff (`HANDOFF.md`)

> Updated: 2026-11-24 (Unified 4-Workspace & Best-First Infinite Cascade Alignment)

## 1. Architecture and Boundaries
- **Unified Portal (`/engine`):** Hosts **Prism Focus** (`/`), **Prism Play** (`/canvas`), **Prism Word** (`/scripture`), and **Prism Forge** (`/forge`) cleanly in a four-card portal layout.
- **Prism Focus Footer (`src/app/page.tsx`):** Kept uncluttered (only `About the Prism`, `Neural Guide`, and `Browser Extension` — no `/scripture`, `/canvas`, or `/engine` links inside the Prism Focus footer).
- **Consistent Hero Pill Badge & Clean Headers:** Across **Prism Focus** (`/`), **Prism Play** (`/canvas`), and **Prism Forge** (`/forge`), top headers contain only calm workspace controls (no cross-workspace `Prism Focus` / `Prism Engine` header clutter), while the `Dassah's Prism Engine · Powered by The Prism Engine` pill badge sits centered above the main workspace title and links back to `/engine`.
- **Footer Signature:** All workspaces use `LivingIchthysFooter` (`JG <Ichthys Fish> | Rooted in Christ | Dedicated to Dchan.`) and `Founded by JGitu · Powered by Grace <Ichthys Fish>`.
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
- **Unified Best-First AI Execution Cascade (`src/lib/server/prism-ai-cascade.ts`, `src/features/scripture/studyEngine.ts`, `src/features/forge/forgeEngine.ts`):**
  - **Refractions, Study, Song Studio, and Forge LEGOs:** Task-Ranked **Mistral Pool** (`mistral-small-latest`, `mistral-large-latest`, `ministral-14b-2512`, `ministral-8b-2512`) → **Gemini Interactions** (`gemini-3.5-flash-lite`) → Task-Ranked **OpenRouter Free Pool** (`nvidia/nemotron-3-ultra-550b-a55b:free`, `baidu/ernie-5.5-flash-preview:free`, `nvidia/nemotron-3.5-super-vl:free`, `google/gemma-4-31b-it:free`, `nvidia/nemotron-3-super-120b-a12b:free`, `nvidia/nemotron-3.5-lightning:free`) → **Groq Pool** (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`) → **Local Structural Refraction / Offline Library**.
  - **Ask DJ (All Workspaces):** Defaults to **Gemini Interactions SDK** (`@google/genai` `client.interactions.create` with `previousInteractionId` stateful server-side memory to save tokens) before cascading Mistral Pool → OpenRouter Free Pool → Groq Pool → Local guide.
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
