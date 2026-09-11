import React from 'react';
import { motion } from 'motion/react';
import {
  Coffee,
  MessageCircle,
  Sparkles,
  BookOpen,
  Feather,
  Clock,
  Calendar,
} from 'lucide-react';
import { MyraaLanguage } from '../types';

export interface CompanionAction {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  prompt: string;
  purpose: string;
}

export const COMPANION_ACTIONS: CompanionAction[] = [
  {
    id: 'india_time',
    title: 'India Time',
    subtitle: 'IST Clock',
    icon: Clock,
    color: 'text-cyan-300',
    borderColor: 'border-cyan-500/40 hover:border-cyan-300/90',
    prompt: 'MYRAA, what time is it in India right now?',
    purpose: 'Checks the real-time Indian Standard Time (IST).',
  },
  {
    id: 'festivals',
    title: 'Festivals',
    subtitle: 'Vinayaka Chavithi',
    icon: Calendar,
    color: 'text-amber-300',
    borderColor: 'border-amber-500/40 hover:border-amber-300/90',
    prompt: 'MYRAA, when is Vinayaka Chavithi this year?',
    purpose: 'Asks MYRAA about Indian festivals with year awareness.',
  },
  {
    id: 'daily_routine',
    title: 'Daily Routine',
    subtitle: 'Plan schedule',
    icon: Coffee,
    color: 'text-amber-300',
    borderColor: 'border-amber-500/40 hover:border-amber-300/90',
    prompt: "Let's plan our schedule today Chinna",
    purpose: "Helps organize today's tasks, goals, and focus areas.",
  },
  {
    id: 'chit_chat',
    title: 'Chit-Chat',
    subtitle: 'Casual check-in',
    icon: MessageCircle,
    color: 'text-sky-300',
    borderColor: 'border-sky-500/40 hover:border-sky-300/90',
    prompt: "Hey Myraa, ela unnav? Em chestunnav?",
    purpose: 'Starts a casual, friendly Telugu-English check-in.',
  },
  {
    id: 'surprise_me',
    title: 'Surprise Me',
    subtitle: 'Fascinating insight',
    icon: Sparkles,
    color: 'text-cyan-300',
    borderColor: 'border-cyan-500/40 hover:border-cyan-300/90',
    prompt: 'Tell me something fascinating or unexpected',
    purpose: 'Prompts MYRAA to share an intriguing insight, scientific fact, or creative thought.',
  },
  {
    id: 'kavithalu',
    title: 'Kavithalu',
    subtitle: 'Telugu poem',
    icon: BookOpen,
    color: 'text-purple-300',
    borderColor: 'border-purple-500/40 hover:border-purple-300/90',
    prompt: 'Naku oka manchi poem cheppu',
    purpose: 'Asks MYRAA to compose or recite an expressive poetic piece in Telugu.',
  },
  {
    id: 'kathalu',
    title: 'Kathalu',
    subtitle: 'Short story',
    icon: Feather,
    color: 'text-emerald-300',
    borderColor: 'border-emerald-500/40 hover:border-emerald-300/90',
    prompt: 'Oka manchi short story cheppu',
    purpose: 'Requests a short, captivating story.',
  },
];

interface CompanionQuickActionsProps {
  onSelectAction: (prompt: string) => void;
  language?: MyraaLanguage;
  disabled?: boolean;
}

export const CompanionQuickActions: React.FC<CompanionQuickActionsProps> = ({
  onSelectAction,
  disabled = false,
}) => {
  return (
    <div
      id="companion-quick-actions-tray"
      className="w-full max-w-2xl px-2 py-1 flex items-center justify-center gap-2 overflow-x-auto scrollbar-none"
    >
      {COMPANION_ACTIONS.map((action, idx) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.id}
            id={`companion-action-${action.id}`}
            disabled={disabled}
            onClick={() => onSelectAction(action.prompt)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.2 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-cyan-500/20 hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(0,240,255,0.25)] backdrop-blur-xl transition-all shrink-0 cursor-pointer text-left"
            title={`${action.title}: "${action.prompt}" — ${action.purpose}`}
          >
            <div className="p-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 group-hover:scale-110 group-hover:text-cyan-100 transition-all">
              <Icon className="w-3.5 h-3.5 drop-shadow-[0_0_6px_currentColor]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-cyan-100/90 group-hover:text-white transition-colors whitespace-nowrap tracking-wide leading-tight">
                {action.title}
              </span>
              <span className="text-[9px] text-cyan-400/60 group-hover:text-cyan-300 font-sans whitespace-nowrap leading-tight">
                {action.subtitle}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};
