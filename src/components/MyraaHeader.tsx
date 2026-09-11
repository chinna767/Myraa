import React from 'react';
import { motion } from 'motion/react';
import { Settings, Layers, Calendar, Globe } from 'lucide-react';
import { EmotionBlend } from '../types';

interface MyraaHeaderProps {
  onOpenSettingsModal: () => void;
  onOpenDrawer?: () => void;
  onOpenCalendar?: () => void;
  onReturnToWebsite?: () => void;
  dominantEmotion?: string;
  emotionBlend?: EmotionBlend;
}

export const MyraaHeader: React.FC<MyraaHeaderProps> = ({
  onOpenSettingsModal,
  onOpenDrawer,
  onOpenCalendar,
  onReturnToWebsite,
}) => {
  return (
    <header
      id="myraa-minimal-header"
      className="relative z-30 w-full px-4 sm:px-8 pt-3.5 sm:pt-5 pb-2 flex items-center justify-between pointer-events-auto select-none"
    >
      {/* Left: MYRAA identity */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="relative flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6">
          <span className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
          <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xs sm:text-sm md:text-base font-light tracking-[0.28em] text-slate-100 uppercase font-sans">
            MYRAA
          </h1>
          <span className="text-[8px] sm:text-[9px] font-light tracking-[0.2em] text-cyan-400/80 font-mono uppercase">
            AI Companion for Chinna
          </span>
        </div>
      </div>

      {/* Right Controls: Website, Calendar, Quick Actions & Settings */}
      <div className="flex items-center gap-1 sm:gap-2">
        {onReturnToWebsite && (
          <motion.button
            id="myraa-return-website-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={onReturnToWebsite}
            aria-label="Return to MYRAA Website"
            title="Return to MYRAA Website"
            className="p-2 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60 border border-transparent hover:border-cyan-500/20 transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4 stroke-[1.8]" />
          </motion.button>
        )}

        {onOpenCalendar && (
          <motion.button
            id="myraa-open-calendar-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenCalendar}
            aria-label="Indian Calendar & Festivals"
            title="Indian Calendar & Festivals"
            className="p-2 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60 border border-transparent hover:border-cyan-500/20 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 stroke-[1.8]" />
          </motion.button>
        )}

        {onOpenDrawer && (
          <motion.button
            id="myraa-open-drawer-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenDrawer}
            aria-label="Open Actions & Memories"
            title="Quick Actions & Memories"
            className="p-2 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60 border border-transparent hover:border-cyan-500/20 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 stroke-[1.8]" />
          </motion.button>
        )}

        <motion.button
          id="myraa-header-settings-btn"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={onOpenSettingsModal}
          aria-label="Settings"
          title="Settings"
          className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4 stroke-[1.8]" />
        </motion.button>
      </div>
    </header>
  );
};
