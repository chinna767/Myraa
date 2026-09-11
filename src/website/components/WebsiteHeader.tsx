import React from 'react';

interface WebsiteHeaderProps {
  onConnectMyraa?: () => void;
}

export const WebsiteHeader: React.FC<WebsiteHeaderProps> = ({ onConnectMyraa }) => {
  return (
    <header id="website-site-header" className="w-full py-5 md:py-7 px-6 flex justify-between items-center relative z-20 border-b border-cyan-950/40 bg-slate-950/60 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Subtle glowing ambient dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></span>
        </span>
        {/* Prominent MYRAA logotype */}
        <h1 
          id="website-brand-logo" 
          className="text-2xl md:text-3xl font-bold tracking-[0.3em] uppercase bg-gradient-to-r from-slate-100 via-cyan-100 to-cyan-400 bg-clip-text text-transparent select-none drop-shadow-[0_0_18px_rgba(6,182,212,0.35)]"
        >
          MYRAA
        </h1>
      </div>

      {onConnectMyraa && (
        <button
          id="website-header-launch-btn"
          onClick={onConnectMyraa}
          className="text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all shadow-[0_0_14px_rgba(6,182,212,0.2)] cursor-pointer"
        >
          Connect with MYRAA
        </button>
      )}
    </header>
  );
};
