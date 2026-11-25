# Project Mandates - Dassah's Prism Engine

## 1. Request Analysis & Model Advice
For every multi-step request or complex modification, the agent MUST:
- Provide an account of the request.
- Estimate the token usage (e.g., Low, Medium, High).
- Advise on the best model for the task.
- This analysis must be presented before substantial implementation begins.
- **Deployment Rule:** Never push to GitHub/Vercel live production without explicit user confirmation first.

## 2. Aesthetic & Brand Standards
- **Style:** Apple Liquid Glass (Advanced Glassmorphism) with spacious, calm, uncluttered single-column focus (never squash multiple side-by-side panels together).
- **Themes:** High contrast between dark obsidian and soft paper light modes.
- **Navigation & Header Hygiene:**
  - **Prism Focus (`/`)**: Top hero pill badge `Dassah's Prism Engine · Powered by The Prism Engine`. Footer keeps `About the Prism`, `Neural Guide`, and `Browser Extension` only (no `Prism Play` or `Prism Engine` buttons in the footer).
  - **Prism Play (`/canvas`) & Prism Forge (`/forge`)**: Top bar stays uncluttered (no `Prism Focus` or `Prism Engine` links in the top header bar). Instead, place the clickable pill badge `Dassah's Prism Engine · Powered by The Prism Engine` (linking to `/engine`) centered right above the main `Prism Play` / `Prism Forge` title, matching `Prism Focus`.
- **Identity & Footer Signature:**
  - Keep the `Dastastic` brand naming convention.
  - Always use the authentic `LivingIchthysFooter` (`JG <Ichthys Fish> | Rooted in Christ | Dedicated to Dchan.`) and `Founded by JGitu · Powered by Grace <Ichthys Fish>` wording. Never write "Built with Christian founder purpose" in UI footers, and never use `"sovereign"` or `"divine"` as software/UI feature labels.

## 3. Architecture & Ecosystem Mandates (The Prism Engine ∞)
- **Pillar I: Best-First Infinite Intelligence Cascade (`src/lib/server/prism-ai-cascade.ts` & `src/lib/server/prism-router.ts`):**
  - **Refractions & Structured Generation (Prism Focus, Prism Play, Prism Word, Prism Forge):**
    1. **Mistral AI Open/Free Pool** (task-ranked from 1st best to last: `mistral-small-latest`, `mistral-large-latest`, `ministral-14b-2512`, `ministral-8b-2512` — picks 1st best for the task, falls back to 2nd, 3rd, etc.).
    2. **Google Gemini** (`gemini-3.5-flash-lite` via `@google/genai` Interactions SDK).
    3. **OpenRouter Open Free Model Pool** (task-ranked from 1st best to last across verified `:free` models: `nvidia/nemotron-3-ultra-550b-a55b:free`, `baidu/ernie-5.5-flash-preview:free`, `nvidia/nemotron-3.5-super-vl:free`, `google/gemma-4-31b-it:free`, `nvidia/nemotron-3-super-120b-a12b:free`, `nvidia/nemotron-3.5-lightning:free` + live runtime `:free` catalog discovery).
    4. **Groq LPU Pool** (`openai/gpt-oss-120b` / `openai/gpt-oss-20b`).
    5. **Local Structural Refraction** (guaranteed 0-token offline fallback with automatic credit refund).
  - **Ask DJ Conversational Helper (`/api/chat`, `/api/scripture/ask-dj`, `/api/forge`):**
    1. **Primary:** **Google Gemini Interactions SDK** (`client.interactions.create` via `@google/genai` with `previous_interaction_id` stateful memory to remember conversation turns server-side and save tokens).
    2. **Fallbacks:** Mistral AI Ranked Pool → OpenRouter Free Model Pool → Groq Pool → Local Offline Guide.
- **Pillar II: Cognitive Gamification:** Ascension Ranks (`Novice Observer` to `Focus Architect`), Guided Quests, and browser-private Vault of Artifacts.
- **Pillar III: Reactive Visual Artistry:** 'Living' UI elements, Refractive Neural Core, Snake Lights, morphing Ichthys iconography, and dynamic Liquid Glassmorphism.
- **Integrity:** Zero Secret Leaks (all keys in `.env.local` / Vercel env vars). Pre-flight (`evaluateSafetyBoundary`) and post-flight (`evaluateOutputSafety`) guards active on all endpoints.
