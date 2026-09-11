import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Brain, Heart, Sliders, Mic, MicOff, Calendar, Globe } from 'lucide-react';
import { CompanionQuickActions } from './CompanionQuickActions';

interface CompanionSecondaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (promptText: string) => void;
  isConnecting: boolean;
  isConnected: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  memoriesCount: number;
  onOpenMemories: () => void;
  onOpenEmotionHUD: () => void;
  onOpenSettingsModal: () => void;
  onOpenCalendar?: () => void;
  onReturnToWebsite?: () => void;
}

export const CompanionSecondaryDrawer: React.FC<CompanionSecondaryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  isConnecting,
  isConnected,
  isMuted,
  toggleMute,
  memoriesCount,
  onOpenMemories,
  onOpenEmotionHUD,
  onOpenSettingsModal,
  onOpenCalendar,
  onReturnToWebsite,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Slide-up bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto bg-slate-950/95 border-t border-cyan-500/20 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl p-5 sm:p-6"
          >
            {/* Grab bar */}
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold tracking-wide text-slate-100">
                  Companion Actions & Hub
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hub Quick Tools */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-5">
              {/* Mic toggle */}
              <button
                onClick={toggleMute}
                disabled={!isConnected}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium transition-all ${
                  isMuted
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-cyan-500/30'
                } ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isMuted ? <MicOff className="w-4 h-4 text-amber-400" /> : <Mic className="w-4 h-4 text-cyan-400" />}
                <span>{isMuted ? 'Muted' : 'Mic Active'}</span>
              </button>

              {/* Indian Calendar & Festivals */}
              {onOpenCalendar && (
                <button
                  id="drawer-open-calendar-btn"
                  onClick={() => {
                    onClose();
                    onOpenCalendar();
                  }}
                  className="p-3 rounded-xl border bg-slate-900/60 border-slate-800 text-slate-300 hover:border-cyan-500/40 flex items-center gap-2.5 text-xs font-medium transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Calendar</span>
                </button>
              )}

              {/* Memory Bank */}
              <button
                onClick={() => {
                  onClose();
                  onOpenMemories();
                }}
                className="p-3 rounded-xl border bg-slate-900/60 border-slate-800 text-slate-300 hover:border-cyan-500/30 flex items-center gap-2.5 text-xs font-medium transition-all cursor-pointer"
              >
                <Brain className="w-4 h-4 text-cyan-400" />
                <span>Memories ({memoriesCount})</span>
              </button>

              {/* Emotion Engine */}
              <button
                onClick={() => {
                  onClose();
                  onOpenEmotionHUD();
                }}
                className="p-3 rounded-xl border bg-slate-900/60 border-slate-800 text-slate-300 hover:border-violet-500/30 flex items-center gap-2.5 text-xs font-medium transition-all cursor-pointer"
              >
                <Heart className="w-4 h-4 text-violet-400" />
                <span>Emotion State</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => {
                  onClose();
                  onOpenSettingsModal();
                }}
                className="p-3 rounded-xl border bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 flex items-center gap-2.5 text-xs font-medium transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>

              {/* Return to Website */}
              {onReturnToWebsite && (
                <button
                  id="drawer-return-website-btn"
                  onClick={() => {
                    onClose();
                    onReturnToWebsite();
                  }}
                  className="p-3 rounded-xl border bg-slate-900/60 border-slate-800 text-cyan-300 hover:border-cyan-500/40 flex items-center gap-2.5 text-xs font-medium transition-all cursor-pointer col-span-2 sm:col-span-1"
                >
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Website</span>
                </button>
              )}
            </div>

            {/* Section: Conversation Starters / Quick Actions */}
            <div className="mb-2">
              <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase block mb-2.5">
                Telugu & English Quick Topics
              </span>
              <CompanionQuickActions
                onSelectAction={(prompt) => {
                  onClose();
                  onSelectAction(prompt);
                }}
                disabled={isConnecting}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
