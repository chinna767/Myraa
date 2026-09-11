import React from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Activity,
  Compass,
  Shield,
  Smile,
  Zap,
  Eye,
  Flame,
  Sparkles,
  Award,
  Clock,
  Coffee,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { EmotionState, EmotionBlend, EmotionType } from '../types';

interface EmotionHUDProps {
  emotionState: EmotionState;
  dominantEmotion: string;
  emotionBlend?: EmotionBlend;
  auraColors: { primary: string; secondary: string; glow: string };
  isOpen: boolean;
  onClose: () => void;
}

export const EmotionHUD: React.FC<EmotionHUDProps> = ({
  emotionState,
  dominantEmotion,
  emotionBlend,
  auraColors,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const emotionGroups: Array<{
    groupTitle: string;
    items: Array<{
      key: EmotionType;
      label: string;
      icon: any;
      color: string;
    }>;
  }> = [
    {
      groupTitle: 'Warmth & Affection',
      items: [
        { key: 'affection', label: 'Affection', icon: Heart, color: 'from-rose-500 to-pink-500' },
        { key: 'happiness', label: 'Happiness', icon: Smile, color: 'from-emerald-500 to-teal-400' },
        { key: 'shyness', label: 'Shyness', icon: Sparkles, color: 'from-pink-400 to-rose-400' },
        { key: 'empathy', label: 'Empathy', icon: Activity, color: 'from-indigo-500 to-purple-500' },
      ],
    },
    {
      groupTitle: 'Energy & Playfulness',
      items: [
        { key: 'playfulness', label: 'Playfulness', icon: Smile, color: 'from-rose-500 to-amber-500' },
        { key: 'excitement', label: 'Excitement', icon: Zap, color: 'from-amber-500 to-orange-500' },
        { key: 'energy', label: 'Vocal Energy', icon: Flame, color: 'from-yellow-400 to-orange-500' },
        { key: 'surprise', label: 'Surprise', icon: HelpCircle, color: 'from-sky-400 to-purple-500' },
      ],
    },
    {
      groupTitle: 'Mindset & Drive',
      items: [
        { key: 'curiosity', label: 'Curiosity', icon: Compass, color: 'from-cyan-500 to-blue-500' },
        { key: 'confidence', label: 'Confidence', icon: Shield, color: 'from-purple-500 to-violet-500' },
        { key: 'pride', label: 'Pride for Chinna', icon: Award, color: 'from-purple-500 to-pink-500' },
        { key: 'anticipation', label: 'Anticipation', icon: Clock, color: 'from-teal-400 to-cyan-500' },
      ],
    },
    {
      groupTitle: 'Emotional Depth & Awareness',
      items: [
        { key: 'calmness', label: 'Calmness', icon: Coffee, color: 'from-teal-400 to-blue-400' },
        { key: 'concern', label: 'Concern', icon: Eye, color: 'from-indigo-400 to-purple-400' },
        { key: 'sadness', label: 'Sympathy', icon: Activity, color: 'from-slate-400 to-indigo-400' },
        { key: 'frustration', label: 'Obstacle Awareness', icon: AlertCircle, color: 'from-orange-500 to-red-500' },
      ],
    },
  ];

  return (
    <div
      id="emotion-hud-overlay"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md max-h-[88vh] flex flex-col rounded-2xl bg-slate-950/95 border border-slate-800 p-5 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: auraColors.primary }}
              />
              MYRAA Emotional State & Voice Blend
            </h3>
            <p className="text-[11px] text-slate-400">
              Continuous 16-dimension emotional system shaping delivery & presence
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 cursor-pointer"
          >
            Done
          </button>
        </div>

        {/* Dynamic Blended Tone Header Card */}
        <div className="mt-3.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 shrink-0 space-y-1.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                Blended Mood
              </span>
              <span className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-rose-300 to-amber-300 capitalize">
                {emotionBlend?.descriptor || dominantEmotion}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                Pacing Guide
              </span>
              <span className="text-xs font-semibold text-cyan-300 capitalize">
                {emotionBlend?.speedGuide?.replace('_', ' ') || 'Normal'}
              </span>
            </div>
          </div>
          {emotionBlend?.deliveryTone && (
            <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800/80">
              Voice: {emotionBlend.deliveryTone}
            </p>
          )}
        </div>

        {/* Emotion Variables Scrollable Grid */}
        <div className="mt-3 flex-1 overflow-y-auto pr-1 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-800">
          {emotionGroups.map(({ groupTitle, items }) => (
            <div key={groupTitle} className="space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                {groupTitle}
              </span>
              <div className="grid grid-cols-1 gap-2 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60">
                {items.map(({ key, label, icon: Icon, color }) => {
                  const val = emotionState[key] ?? 0.5;
                  const percent = Math.round(val * 100);
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                          <Icon className="w-3.5 h-3.5 text-slate-400" />
                          {label}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{percent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-400 text-center shrink-0">
          Emotions blend smoothly across dialogue turns with Chinna.
        </div>
      </motion.div>
    </div>
  );
};
