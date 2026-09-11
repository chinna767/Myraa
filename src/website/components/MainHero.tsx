import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface MainHeroProps {
  onConnectMyraa: () => void;
}

export const MainHero: React.FC<MainHeroProps> = ({ onConnectMyraa }) => {
  return (
    <main id="website-main-hero" className="w-full flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-28 relative overflow-hidden">
      {/* Subtle Ambient Background Gradients */}
      <div 
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] md:w-[600px] h-[340px] md:h-[600px] bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-indigo-600/5 rounded-full blur-[100px] pointer-events-none -z-10" 
      />

      {/* Hero Content Container */}
      <div className="max-w-xl mx-auto flex flex-col items-center text-center z-10">
        {/* Subtle decorative aura pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-xs tracking-widest uppercase mb-8 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Core Interface</span>
        </div>

        {/* The One Primary Button */}
        <div className="relative group">
          {/* Subtle Outer Glow Halo */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 group-active:opacity-85 transition-opacity duration-500" />
          
          <motion.button
            id="connect-myraa-btn"
            onClick={onConnectMyraa}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative px-8 md:px-12 py-4 md:py-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-400/50 hover:border-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.25)] text-slate-100 hover:text-white font-medium text-base md:text-lg tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer select-none"
          >
            <span className="relative z-10 bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent font-semibold">
              CONNECT WITH MYRAA
            </span>
            <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Informative subtitle */}
        <p className="mt-6 text-xs md:text-sm text-slate-400 max-w-sm tracking-wide leading-relaxed">
          Step into a live, voice-first emotional intelligence experience.
        </p>
      </div>
    </main>
  );
};
