import React from 'react';
import { motion } from 'motion/react';
import {
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Bookmark,
  Sliders,
  Sparkles,
  Key,
  Heart,
} from 'lucide-react';
import { ConnectionStatus, EmotionBlend, MyraaLanguage } from '../types';

interface MyraaControlDockProps {
  status: ConnectionStatus;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleSession: () => void;
  onOpenSettings: () => void;
  onOpenMemories: () => void;
  onOpenEmotionHUD: () => void;
  dominantEmotion: string;
  emotionBlend?: EmotionBlend;
  memoryCount: number;
  wakeWordActive?: boolean;
  language?: MyraaLanguage;
  onOpenApiSettings?: () => void;
  hasCustomApiKey?: boolean;
}

export const MyraaControlDock: React.FC<MyraaControlDockProps> = ({
  status,
  isMuted,
  onToggleMute,
  onToggleSession,
  onOpenSettings,
  onOpenMemories,
  onOpenEmotionHUD,
  dominantEmotion,
  emotionBlend,
  memoryCount,
  wakeWordActive = false,
  language = 'Telugu + English',
  onOpenApiSettings,
  hasCustomApiKey = false,
}) => {
  const isConnected = status === 'connected' || status === 'connecting' || status === 'reconnecting';

  return (
    <div
      id="myraa-control-dock"
      className="flex flex-col items-center gap-3 w-full max-w-2xl px-3 pb-4 z-20"
    >
      {/* Floating Pill bar with emotion HUD, connection state, and memory count */}
      <div className="flex items-center justify-between w-full max-w-lg px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-lg text-xs">
        {/* Emotion Button */}
        <button
          id="dock-open-emotion-btn"
          onClick={onOpenEmotionHUD}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800/90 text-cyan-300 border border-slate-700/60 transition-all cursor-pointer"
          title="Open Emotion Engine HUD"
        >
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20" />
          <span className="capitalize font-medium text-[11px]">
            {emotionBlend?.descriptor || dominantEmotion}
          </span>
        </button>

        {/* Live Audio Status Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected
                ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.8)]'
                : 'bg-slate-500'
            }`}
          />
          <span className="font-mono text-[10px]">
            {isConnected ? 'Voice Active' : wakeWordActive ? '"Hey Myraa" Ready' : 'Standby'}
          </span>
        </div>

        {/* Memory Count */}
        <button
          id="dock-open-memories-btn"
          onClick={onOpenMemories}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800/90 text-slate-300 border border-slate-700/60 transition-all cursor-pointer"
          title="View Stored Memories"
        >
          <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-[11px]">{memoryCount}</span>
        </button>
      </div>

      {/* Main Action Dock Controls */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 backdrop-blur-2xl shadow-2xl">
        {/* Settings button */}
        <button
          id="dock-settings-btn"
          onClick={onOpenSettings}
          className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer hover:border-slate-700 active:scale-95"
          title="Settings & Language Preferences"
        >
          <Sliders className="w-5 h-5" />
        </button>

        {/* API Settings button */}
        {onOpenApiSettings && (
          <button
            id="dock-api-settings-btn"
            onClick={onOpenApiSettings}
            className={`p-3 rounded-xl border transition-all cursor-pointer active:scale-95 relative ${
              hasCustomApiKey
                ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/50'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Gemini API Key Configuration"
          >
            <Key className="w-5 h-5" />
            {hasCustomApiKey && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
            )}
          </button>
        )}

        {/* Toggle Mute button (only active when connected) */}
        <button
          id="dock-toggle-mute-btn"
          onClick={onToggleMute}
          disabled={!isConnected}
          className={`p-3 rounded-xl border transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
            isMuted
              ? 'bg-rose-950/50 border-rose-500/60 text-rose-300 hover:bg-rose-900/60'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Main Connect / Disconnect Big Call Button */}
        <motion.button
          id="dock-main-session-btn"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onToggleSession}
          className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2.5 transition-all cursor-pointer shadow-lg ${
            isConnected
              ? 'bg-rose-500 hover:bg-rose-400 text-black shadow-rose-500/25'
              : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black shadow-cyan-500/25'
          }`}
        >
          {isConnected ? (
            <>
              <PhoneOff className="w-5 h-5 stroke-[2.5]" />
              <span className="text-sm font-bold">End Session</span>
            </>
          ) : (
            <>
              <PhoneCall className="w-5 h-5 stroke-[2.5]" />
              <span className="text-sm font-bold">Talk with MYRAA</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
