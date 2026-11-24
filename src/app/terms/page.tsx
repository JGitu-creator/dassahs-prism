import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 p-8 md:p-24 font-sans leading-relaxed">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="space-y-4 border-b border-white/10 pb-8">
          <h1 className="text-4xl font-black text-white italic">Terms of Neural Link</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Dassah's Prism | Effective November 2026</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">1. Acceptable Use</h2>
          <p>Dassah's Prism is provided as-is for lawful document simplification, learning, reflection, and planning. It is not a substitute for professional legal, medical, financial, educational, or spiritual advice. You are responsible for reviewing generated content before relying on it.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">2. Data and Generated Content</h2>
          <p>Users are responsible for the material they submit and for checking AI-generated summaries, actions, translations, and study suggestions. Do not submit secrets or highly sensitive identifiers. Provider availability, model behavior, and output accuracy can change without notice.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">3. Access and Availability</h2>
          <p>You may stop using the service at any time. We may rate-limit, suspend, or change a feature to protect users, providers, or service stability. No uninterrupted or guaranteed output is promised, and local fallback results may be less complete than provider-generated results.</p>
        </section>

        <footer className="pt-12 border-t border-white/10">
          <a href="/" className="text-blue-400 font-black uppercase tracking-widest text-xs hover:text-white transition-colors">← Return to the Prism</a>
        </footer>
      </div>
    </div>
  );
}
