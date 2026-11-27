import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 p-8 md:p-24 font-sans leading-relaxed">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="space-y-4 border-b border-white/10 pb-8">
          <h1 className="text-4xl font-black text-white italic">Privacy Policy</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Dassah&apos;s Prism Engine | Effective April 2026
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">1. Cognitive Focus &amp; Privacy</h2>
          <p>
            Dassah&apos;s Prism Engine (spanning Prism Focus, Prism Play, Prism Forge, and Prism Word) is built on the
            principle that your thoughts and data are your own. We do not sell, rent, or trade your neural profiles,
            saved vaults, or refracted data to third parties.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">2. Data Processing</h2>
          <p>
            Inputs you submit for AI refraction are processed through our configured intelligence cascade (Mistral AI,
            Google Gemini, OpenRouter, Groq, or zero-token local offline refraction). Please remove passwords, API keys,
            identity numbers, and private medical or financial records before sending material. We only store history in
            the cloud if you choose to sign in and save it; otherwise your vaults remain private in your browser.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">3. User Rights</h2>
          <p>
            You have the absolute right to erasure. You can delete your saved local and cloud history at any time
            through your Neural Identity settings.
          </p>
        </section>

        <footer className="pt-12 border-t border-white/10">
          <Link
            href="/engine"
            className="text-blue-400 font-black uppercase tracking-widest text-xs hover:text-white transition-colors"
          >
            ← Return to Dassah&apos;s Prism Engine
          </Link>
        </footer>
      </div>
    </div>
  );
}
