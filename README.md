# Dassah's Prism

Dassah's Prism is an ADHD-friendly document-refraction workspace that turns dense material into a clearer summary, readable segments, optional metaphors, and a concrete next action. It is built with [Next.js](https://nextjs.org).

The product boundaries are deliberate:

- `/` — Prism Focus, the main document workspace.
- `/canvas` — Prism Play, a separate learning and momentum experience.
- `/engine` — the product-family gateway and capability overview.
- `/scripture` — Prism Word, a separate Scripture study and worship surface.
- Prism Lens and Ask DJ remain distinct helpers inside the main product; Lens assists with difficult words/images, while Ask DJ answers questions.

AI output is a guide, not guaranteed truth. Review important facts and keep secrets and highly sensitive personal data out of submitted material.

## Source and Android APK

The public source repository is:

<https://github.com/JGitu-creator/dassahs-prism>

For a simple Android install or Capacitor APK wrapper, see [the APK guide](docs/APK_BUILD.md). The recommended first release is **Add to Home screen** from Chrome because Prism's AI, authentication, and server routes remain safely on the server.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The application uses the App Router under `src/app`. Copy `.env.example` for the main application configuration. Prism Word's private family route additionally requires server-only `PRISM_WORD_ALLOWED_EMAILS` and `PRISM_WORD_SESSION_SECRET`; never expose either through a `NEXT_PUBLIC_` variable.

Safe defaults keep `PRISM_FOUR_TIER_ENABLED=false` and `PRISM_SHADOW_MODE=false`. The existing OpenRouter/Gemini baseline, quota accounting, fallback behavior, and local structural fallback should be treated as the release baseline until a separately reviewed promotion is approved.

Install and validate locally:

```bash
npm ci
npm run test:release-trust
npm run lint
npm run build
npm run test:shadow
npm run test:acceptance
npm run test:contracts
npm run test:four-tier
npm run test:redteam
```

## Contributing and security

See [SECURITY.md](SECURITY.md) before reporting a vulnerability or handling provider credentials. Do not commit `.env.local`, private documents, session secrets, or API keys.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
