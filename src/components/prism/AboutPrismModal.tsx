'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Crown, Heart, Rocket, Trophy, X, Zap } from 'lucide-react';
import { MorphFish } from '@/components/morphing/MorphIcons';
import { useEngageShortcut } from '@/components/prism/useEngageShortcut';

export function AboutPrismModal({
  isOpen,
  onClose,
  darkMode = true,
}: {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}) {
  useEngageShortcut(isOpen, onClose);

  const surface = darkMode
    ? 'bg-[#091022]/95 border-blue-400/25 text-slate-100 shadow-[0_0_120px_rgba(59,130,246,0.22)]'
    : 'bg-[#f3ede0]/98 border-[#cfc3ad] text-[#172133] shadow-[0_28px_90px_rgba(23,33,51,0.16)]';

  const muted = darkMode ? 'text-slate-300' : 'text-[#475569]';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[650] flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            className={`max-w-4xl w-full border-2 p-6 sm:p-10 md:p-14 rounded-[2.25rem] sm:rounded-[3.5rem] relative my-auto overflow-hidden ${surface}`}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close About the Prism"
              className="absolute top-4 right-4 sm:top-8 sm:right-8 p-2.5 rounded-full hover:bg-white/10 opacity-75 hover:opacity-100 transition-all z-20 cursor-pointer"
            >
              <X size={24} />
            </button>

            <div className="space-y-10 relative z-10">
              <header className="space-y-3">
                <div className="flex items-center gap-4 text-blue-500 font-black uppercase tracking-[0.3em] text-xs">
                  <div className="w-12 h-[2px] bg-blue-500/50" /> THE HEART OF DASSAH&apos;S PRISM ENGINE
                </div>
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight italic">
                  The <span className="prism-text">Dastastical Founder</span> <span className="not-italic">🧠✨</span>
                </h2>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className={`lg:col-span-2 space-y-6 text-base sm:text-lg leading-relaxed font-medium ${muted}`}>
                  <div className="bg-gradient-to-r from-blue-500/10 to-transparent p-6 sm:p-8 border-l-4 border-blue-500 rounded-r-3xl">
                    <p>
                      For as long as I can remember, the world has not just been loud. It has been a flood of raw unfiltered data. From a young age, my mind and body processed every detail with profound intensity. For years, I navigated a world that felt like an overwhelming cacophony while battling the sheer exhaustion of a mind trying to process everything at once. I tried to manage this massive cognitive load on my own strength, but it only ever led to paralysis and defeat.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600/15 via-purple-600/15 to-blue-600/15 p-7 sm:p-9 rounded-[2.5rem] border border-blue-400/20 italic font-semibold">
                    <p className="text-lg sm:text-xl leading-relaxed">
                      The turning point was not a clever productivity hack or a sudden surge of willpower. When my mother and I surrendered our lives to Christ, He stepped into the absolute centre of that mental chaos. He did not just quiet the room. He rescued me from the weight of my own mind. I realised then that my profound cognitive intensity was not a glitch. It was a high powered engine that I had simply been running on the wrong fuel.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/10 to-transparent p-6 sm:p-8 border-l-4 border-purple-500 rounded-r-3xl">
                    <p>
                      It was only through His strength that my greatest source of exhaustion was transformed into my most powerful gift. The victory was not that the world stopped being complex. The victory was that He gave me the peace to finally master it. Guided by His grace, I began to channel that intense processing power into systems thinking. Suddenly, I could look under the hood of chaotic environments, whether untangling complex partnerships or building outdoor communities, and build structures that brought clarity, all for His glory.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500/10 to-transparent p-7 sm:p-9 rounded-[2.5rem] border border-amber-500/25">
                    <p className="font-bold text-lg sm:text-xl leading-relaxed">
                      That is how Dassah&apos;s Prism Engine was born. It is not merely a tool. It is a living testimony of triumph. Our mission is to empower every neurodivergent soul to reclaim ownership of their focus. We transmute the overwhelming noise of modern information into a purposeful stream of clarity, inviting you to step out of the exhaustion, discover the true purpose of your neurodivergence, and perhaps meet the very Source of this peace.
                    </p>
                    <p className="mt-6 text-2xl sm:text-3xl font-black italic">
                      <span className="prism-text">Stay Dastastic!</span> <span className="not-italic">🌟✨</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-600/15 to-purple-600/15 p-6 sm:p-7 rounded-[2.25rem] border border-blue-500/35 relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 opacity-10 rotate-12">
                      <Rocket size={110} />
                    </div>
                    <div className="flex items-center gap-2.5 text-blue-500 font-black uppercase text-xs tracking-widest mb-5 relative z-10">
                      <Zap size={15} className="text-amber-500" /> The Final Push
                    </div>

                    <div className="space-y-6 relative z-10 text-sm">
                      <p className={`italic leading-relaxed ${muted}`}>
                        This build became a reality through the steady support of three remarkable people:
                      </p>

                      <div className="border-l-4 border-blue-500 pl-4 py-1 space-y-1.5">
                        <p className="font-black uppercase tracking-tight text-base">Eng. Jimmy Njuguna</p>
                        <p className={`text-xs font-semibold leading-relaxed ${muted}`}>
                          The loving support of a brother who <span className="text-blue-500 uppercase">ALWAYS PUSHES FOR THE BEST</span> and challenged me to use my tech knowledge for a greater purpose.
                        </p>
                      </div>

                      <div className="border-l-4 border-amber-500 pl-4 py-1 space-y-1.5">
                        <p className="font-black uppercase tracking-tight text-base">Magama Tongogara Njuguna</p>
                        <p className={`text-xs font-semibold leading-relaxed ${muted}`}>
                          My cousin and lifelong companion in growth. Raised alongside me, Magama has remained consistent to the core, always striving for my growth and refusing to let me give up. His mother, Auntie Sisy, gave us a lasting charge to push one another forward and stand together.
                        </p>
                      </div>

                      <div className="border-l-4 border-purple-500 pl-4 py-1 space-y-1.5">
                        <p className="font-black uppercase tracking-tight text-base">Dr. Kizzie Shako</p>
                        <p className={`text-xs font-semibold leading-relaxed ${muted}`}>
                          The mentor whose encouragement gave the vision weight and urgency, turning an idea into a responsibility to act: <span className="text-purple-500 font-black italic">Then do something about it.</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 p-6 sm:p-7 rounded-[2.25rem] border border-amber-500/25 relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 opacity-10 rotate-[-12deg]">
                      <Crown size={90} />
                    </div>
                    <p className="text-amber-500 font-black uppercase text-[10px] tracking-widest mb-5 relative z-10 flex items-center gap-2">
                      <Trophy size={14} /> Dedication &amp; Legacy
                    </p>
                    <div className="space-y-5 relative z-10">
                      <div className="border-b border-black/10 dark:border-white/10 pb-3">
                        <p className="font-black text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                          DChan <Heart size={12} className="fill-red-500 stroke-red-500" />
                        </p>
                        <p className={`text-xs italic leading-relaxed ${muted}`}>
                          He who finds a wife finds a good thing. My anchor, who centred me and fixed my eyes on Him.
                        </p>
                      </div>
                      <div className="border-b border-black/10 dark:border-white/10 pb-3">
                        <p className="font-black text-sm uppercase tracking-wider mb-1">Phido (Mum)</p>
                        <p className={`text-xs leading-relaxed ${muted}`}>
                          My foundation, who rooted me in faith so I could stand back up when I fell.
                        </p>
                      </div>
                      <div className="border-b border-black/10 dark:border-white/10 pb-3">
                        <p className="font-black text-sm uppercase tracking-wider mb-1">Old, old Cucu</p>
                        <p className={`text-xs leading-relaxed ${muted}`}>My roots.</p>
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-wider mb-1">Auntie Sisy</p>
                        <p className={`text-xs leading-relaxed ${muted}`}>
                          My guide and tread-setter, who kept me grasped to the right path.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-black/10 dark:border-white/10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl relative">
                    <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black p-1 rounded-full shadow">
                      <Brain size={14} />
                    </div>
                    <span className="text-2xl font-black text-white italic">JG</span>
                  </div>
                  <div>
                    <p className="font-black uppercase text-xs sm:text-sm tracking-widest">Founded by JGitu</p>
                    <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mt-1">
                      Powered by Grace <MorphFish size={14} stage="fish" className="text-blue-500" />
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-10 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.35em] text-[10px] shadow-lg transition-all cursor-pointer"
                >
                  Engage
                </button>
              </footer>

              <div className="pt-4 flex justify-center gap-8 border-t border-black/5 dark:border-white/5 opacity-60 hover:opacity-100 transition-opacity">
                <a href="/privacy" className="text-[9px] font-black uppercase tracking-widest hover:text-blue-500 transition-colors">
                  Privacy Shield
                </a>
                <a href="/terms" className="text-[9px] font-black uppercase tracking-widest hover:text-blue-500 transition-colors">
                  Neural Terms
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
