import React from 'react';
import { motion } from 'motion/react';
import { ConnectionStatus } from '../types';

interface MyraaStatusIndicatorProps {
  status: ConnectionStatus;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking?: boolean;
  dominantEmotion: string;
}

export const MyraaStatusIndicator: React.FC<MyraaStatusIndicatorProps> = ({
  status,
  isListening,
  isSpeaking,
  isThinking,
  dominantEmotion,
}) => {
  const getDisplay = () => {
    if (status === 'disconnected') {
      return {
        label: 'Offline / Tap to Connect',
        pillClass: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
        dotClass: 'bg-rose-500',
      };
    }
    if (status === 'connecting') {
      return {
        label: 'Connecting...',
        pillClass: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        dotClass: 'bg-amber-400 animate-ping',
      };
    }
    if (status === 'reconnecting') {
      return {
        label: 'Reconnecting...',
        pillClass: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        dotClass: 'bg-amber-400 animate-ping',
      };
    }
    if (status === 'standby') {
      return {
        label: 'Standby / Listening for "Hey Myraa"',
        pillClass: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
        dotClass: 'bg-indigo-400',
      };
    }
    if (isThinking) {
      return {
        label: 'Thinking...',
        pillClass: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
        dotClass: 'bg-cyan-400 animate-pulse',
      };
    }
    if (isSpeaking) {
      return {
        label: 'Speaking',
        pillClass: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200',
        dotClass: 'bg-cyan-300 animate-pulse',
      };
    }
    if (isListening) {
      return {
        label: 'Listening',
        pillClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
        dotClass: 'bg-emerald-400 animate-pulse',
      };
    }
    return {
      label: 'Connected',
      pillClass: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
      dotClass: 'bg-cyan-400',
    };
  };

  const current = getDisplay();

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs backdrop-blur-md transition-all ${current.pillClass}`}
    >
      <span className={`w-2 h-2 rounded-full ${current.dotClass}`} />
      <span className="font-medium tracking-wide">{current.label}</span>
      {status === 'connected' && (
        <span className="text-[10px] opacity-70 border-l border-current pl-1.5 capitalize">
          {dominantEmotion}
        </span>
      )}
    </motion.div>
  );
};
