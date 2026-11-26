# Dassah's Prism Engine

**Dassah's Prism Engine — Prism Focus, Prism Play, Prism Word & Prism Forge — powered by the Prism Engine.** It helps ADHD and neurodivergent learners and knowledge workers turn overwhelming documents, images, webpages, and goals into clear, actionable next steps. It is built with [Next.js](https://nextjs.org).

The product uses **a resilient provider cascade with local structural fallback when remote providers are unavailable**. Automatic text requests use **Mistral → Gemini → OpenRouter free pool → Groq → local structural fallback**. Vision requests use **Gemini first**, then an approved OpenRouter vision fallback; text-only providers do not receive image payloads. Provider keys remain server-side.

## Product routes

- `/` — Prism Focus, the primary document-refraction workspace.
- `/canvas` — Prism Play, a focused learning and action-card experience.
- `/engine` — the product-family hub.
- `/forge` — Prism Forge, the co-design and building workspace.
- Prism Word and Prism Lens remain distinct experiences within the broader product family; Ask DJ remains a question tool, not a feedback channel.

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
