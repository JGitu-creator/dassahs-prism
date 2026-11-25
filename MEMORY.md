# Dassah's Prism Engine: Mission Record & Architecture Memory (`MEMORY.md`)

> Updated: 24 November 2026

## 1. Unified Ecosystem & Four Workspaces (`/engine`)
**Dassah's Prism Engine** (`/engine`) is the central portal gateway hosting four distinct, calm, single-focus workspaces:
1. **Prism Focus (`/`)**: Document, PDF, and article refraction into Executive TLDR, Vivid Metaphor, Prism Lens, and Ask DJ insights.
2. **Prism Play (`/canvas`)**: Coursework and Canvas module refraction into bite-sized playable quest cards, Soundscape Studio, Boss Fights, and shame-free XP streaks (*Turning Dread into Play*).
3. **Prism Word (`/scripture`)**: Private allowlisted family sanctuary (`phidotaxis@gmail.com`, `chanhadassah@gmail.com`) with 7 Bible translations, Hebrew/Greek exegesis, dynamic 0-14 Worship Deck & Song Studio, Strategy Puzzles, and private local disk vault.
4. **Prism Forge (`/forge`)**: Calm, step-by-step Visual LEGO Brick workbench that translates scary error messages/stack traces, confusing code blocks, and terminal commands into plain-English LEGO bricks, ready-to-copy fixes, Guided Debugging Quests, and Ask DJ pair-programming.

---

## 2. Navigation, Header & Footer Alignment Rules (Mandatory Across All Workspaces)
- **No Header Clutter:**
  - In **Prism Play (`/canvas`)** and **Prism Forge (`/forge`)**, the top navigation bar holds ONLY workspace status/XP pills and workspace utility drawers (`How It Works`, `Vault`, `Neural Command`, `Neural Identity`, `Theme Toggle`). Do **not** place `Prism Focus` or `Prism Engine` navigation buttons in the top header bar.
- **Centered Hero Pill Badge:**
  - Across **Prism Focus (`/`)**, **Prism Play (`/canvas`)**, and **Prism Forge (`/forge`)**, the link back to `/engine` sits centered directly above the main `<h1>` title as the glowing pill badge:
    `Dassah's Prism Engine · Powered by The Prism Engine`
- **Prism Focus Footer (`src/app/page.tsx`):**
  - Keep uncluttered: only `About the Prism`, `Neural Guide`, and `Browser Extension` buttons (no `Prism Play`, `Prism Word`, or `Prism Engine` links in the Prism Focus footer).
- **Authentic Grace & Ichthys Signature:**
  - Every workspace footer and About signature uses `LivingIchthysFooter` (`JG <MorphFish> | Rooted in Christ | Dedicated to Dchan.`) and `Founded by JGitu · Powered by Grace <Ichthys Fish>`.
  - Never write literal `"Built with Christian founder purpose"` as raw UI text, and never use `"sovereign"` or `"divine"` as software/UI labels.

---

## 3. Best-First Infinite AI Execution Cascade (`src/lib/server/prism-ai-cascade.ts` & `src/lib/server/prism-router.ts`)
The system no longer uses the old rigid Groq-first 4-tier hierarchy. All workspaces use the **Best-First Infinite Cascade**:

### A. Single-Prompt Refractions & Structured JSON (`callPrismCompletion` / `routeFourTier` / `studyEngine` / `forgeEngine`)
1. **Mistral AI Ranked Pool (`MISTRAL_API_KEY`):**
   - Automatically orders models from **1st best to last** according to the task profile (`coding_or_deep`, `fast`, `default`):
     `mistral-small-latest`, `mistral-large-latest`, `ministral-14b-2512`, `ministral-8b-2512`.
   - If the 1st best model fails or hits a rate limit, it immediately tries the 2nd best, then 3rd, etc.
2. **Google Gemini (`GEMINI_API_KEY`):**
   - `gemini-3.5-flash-lite` via the official `@google/genai` Interactions SDK (`client.interactions.create`).
3. **OpenRouter Free Multi-Model Pool (`OPENROUTER_API_KEY`):**
   - Automatically orders verified `:free` models from **1st best to last** according to the task (`coding_or_deep`, `vision`, `default`):
     `nvidia/nemotron-3-ultra-550b-a55b:free`, `baidu/ernie-5.5-flash-preview:free`, `nvidia/nemotron-3.5-super-vl:free`, `google/gemma-4-31b-it:free`, `nvidia/nemotron-3-super-120b-a12b:free`, `nvidia/nemotron-3.5-lightning:free`, plus live runtime catalog discovery.
4. **Groq LPU Pool (`GROQ_API_KEY`):**
   - Task-ranked across `openai/gpt-oss-120b` and `openai/gpt-oss-20b`.
5. **Local Structural Refraction (0-Token Guaranteed Offline Fallback):**
   - Deterministic local algorithm that always returns a helpful, structured breakdown and automatically refunds reserved credits.

### B. Ask DJ Conversational Helper (`callPrismChat` across Focus, Play, Word, and Forge)
1. **Primary — Google Gemini Interactions SDK (`@google/genai`):**
   - Always runs **first** on `auto` / `gemini` using `client.interactions.create` with `previous_interaction_id` so multi-turn conversation state is remembered server-side, giving sharper answers while saving tokens.
2. **Fallbacks:**
   - Cascades cleanly through **Mistral Ranked Pool** → **OpenRouter Free Model Pool** → **Groq Pool** → **Instant Local DJ Offline Guide**.
