import React from 'react';
import { motion } from 'motion/react';
import { MicOff, ExternalLink, RefreshCw, Volume2, X, ShieldAlert } from 'lucide-react';

interface MicrophonePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  onContinueSpeakerMode: () => void;
}

export const MicrophonePermissionModal: React.FC<MicrophonePermissionModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  onContinueSpeakerMode,
}) => {
  if (!isOpen) return null;

  const handleOpenInNewTab = () => {
    // Open the current direct app URL in a new browser tab where permissions are not constrained by iframes
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="microphone-permission-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-cyan-500/40 p-5 sm:p-6 shadow-[0_0_40px_rgba(0,240,255,0.15)] text-slate-100"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Aura */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] shrink-0">
            <MicOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Microphone Access Blocked
            </h3>
            <p className="text-xs text-rose-300/90 font-mono">
              Permission denied by browser
            </p>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
          MYRAA needs microphone access to listen to Chinna’s voice in real-time. Your browser or preview iframe currently blocked audio input.
        </p>

        {/* Step-by-Step Resolution */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-2.5 mb-5 text-xs">
          <div className="flex items-start gap-2.5 text-slate-300">
            <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <span>
              Click the <strong className="text-cyan-200">lock 🔒</strong> or <strong className="text-cyan-200">site settings</strong> icon in your browser address bar.
            </span>
          </div>

          <div className="flex items-start gap-2.5 text-slate-300">
            <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <span>
              Toggle <strong className="text-cyan-200">Microphone</strong> to <strong className="text-emerald-400">Allow</strong>.
            </span>
          </div>

          <div className="flex items-start gap-2.5 text-slate-300">
            <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <span>
              If you are in an embedded preview window, open the application in a dedicated tab.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            {/* Try Again */}
            <button
              onClick={onRetry}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>

            {/* Open in New Tab */}
            <button
              onClick={handleOpenInNewTab}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Open in New Tab</span>
            </button>
          </div>

          {/* Speaker / Text Mode Fallback */}
          <button
            onClick={onContinueSpeakerMode}
            className="w-full px-3.5 py-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-200 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
            <span>Continue in Speaker Mode (Listen & Quick Actions)</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
