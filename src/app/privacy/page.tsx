import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 p-8 md:p-24 font-sans leading-relaxed">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="space-y-4 border-b border-white/10 pb-8">
          <h1 className="text-4xl font-black text-white italic">Privacy Policy</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Dassah's Prism | Effective November 2026</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">1. Cognitive Focus</h2>
          <p>Dassah's Prism is a document-refraction and learning workspace. It is not a medical, diagnostic, or therapeutic service. Do not submit passwords, payment details, government identifiers, or other information you would not want processed by the selected service.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">2. Data Processing</h2>
          <p>Depending on the active route and configuration, submitted content may be processed by server-side providers such as Google Gemini, Groq, or OpenRouter. Provider processing is subject to the applicable provider terms and retention practices. Prism keeps only the records needed for the feature you use, such as signed-in history, feedback, or saved workspace items; private-session and local-fallback paths are intended to avoid new history writes but are not a guarantee that upstream processing never occurs.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">3. User Rights</h2>
          <p>You may request deletion of account-linked Prism records. Deletion does not automatically erase provider-side logs or records retained under a provider's own terms. The current public build does not promise instant or universal erasure from every system, so contact the project maintainer with the account email and the records you want reviewed.</p>
        </section>

        <footer className="pt-12 border-t border-white/10">
          <a href="/" className="text-blue-400 font-black uppercase tracking-widest text-xs hover:text-white transition-colors">← Return to the Prism</a>
        </footer>
      </div>
    </div>
  );
}
