import React from 'react';
import { ConnectionStatus, EmotionBlend } from '../types';

interface MyraaMinimalStatusAreaProps {
  status: ConnectionStatus;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  isInterrupted?: boolean;
  isSavingMemory?: boolean;
  caption?: string;
  dominantEmotion?: string;
  emotionBlend?: EmotionBlend;
}

export const MyraaMinimalStatusArea: React.FC<MyraaMinimalStatusAreaProps> = ({
  status,
  isListening,
  isSpeaking,
  isThinking,
  isInterrupted = false,
  isSavingMemory = false,
}) => {
  // Determine state indicator colors and label as explicitly requested in the design spec
  let statusText = 'STANDBY';
  let dotColor = 'bg-slate-500 shadow-slate-500/30';
  let pillBorder = 'border-slate-800/80';
  let textColor = 'text-slate-300';

  if (status === 'error') {
    statusText = 'ERROR';
    dotColor = 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]';
    pillBorder = 'border-rose-500/30';
    textColor = 'text-rose-200';
  } else if (isInterrupted) {
    statusText = 'INTERRUPTED';
    dotColor = 'bg-amber-400 animate-ping shadow-[0_0_10px_rgba(251,191,36,0.9)]';
    pillBorder = 'border-amber-500/40';
    textColor = 'text-amber-200';
  } else if (isSavingMemory) {
    statusText = 'SAVING MEMORY';
    dotColor = 'bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]';
    pillBorder = 'border-emerald-500/40';
    textColor = 'text-emerald-200';
  } else if (status === 'connected') {
    if (isSpeaking) {
      statusText = 'MYRAA SPEAKING';
      dotColor = 'bg-pink-400 animate-pulse shadow-[0_0_12px_rgba(244,114,182,0.9)]';
      pillBorder = 'border-pink-500/40';
      textColor = 'text-pink-200';
    } else if (isThinking) {
      statusText = 'THINKING';
      dotColor = 'bg-purple-400 animate-pulse shadow-[0_0_10px_rgba(192,132,252,0.9)]';
      pillBorder = 'border-purple-500/40';
      textColor = 'text-purple-200';
    } else if (isListening) {
      // If mic is picking up user speech
      statusText = 'LISTENING';
      dotColor = 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.9)]';
      pillBorder = 'border-indigo-500/40';
      textColor = 'text-indigo-200';
    } else {
      statusText = 'WITH YOU';
      dotColor = 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]';
      pillBorder = 'border-cyan-500/30';
      textColor = 'text-cyan-200';
    }
  } else if (status === 'connecting' || status === 'reconnecting') {
    statusText = 'CONNECTING';
    dotColor = 'bg-purple-400 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]';
    pillBorder = 'border-purple-500/40';
    textColor = 'text-purple-200';
  }

  return (
    <div
      id="myraa-status-and-presence"
      className="flex items-center justify-center text-center px-4 w-full select-none z-10 my-1"
    >
      {/* Frosted Glass State Indicator Pill with animated LED */}
      <div className={`flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-950/60 border ${pillBorder} backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.4)]`}>
        <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${dotColor}`} />
        <span className={`text-[10px] sm:text-[10.5px] font-mono tracking-[0.22em] uppercase font-medium ${textColor}`}>
          {statusText}
        </span>
      </div>
    </div>
  );
};
