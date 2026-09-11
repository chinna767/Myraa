import React from 'react';
import { motion } from 'motion/react';
import { X, Mic, Volume2, ShieldCheck, Sparkles, Clock, Sliders, Languages, Check, Key } from 'lucide-react';
import { MyraaSettings, MyraaLanguage } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: MyraaSettings;
  onUpdateSettings: (newSettings: Partial<MyraaSettings>) => void;
  onOpenApiSettings?: () => void;
}

const LANGUAGES: {
  id: MyraaLanguage;
  name: string;
  isDefault?: boolean;
  desc: string;
  example: string;
}[] = [
  {
    id: 'Telugu + English',
    name: 'Telugu + English',
    isDefault: true,
    desc: 'Primary mode. Natural conversational code-switching, understanding spoken Telugu, English, and Romanized Telugu.',
    example: '"Okay Chinna, let\'s finish it today. First manam project lo issue check cheddam."',
  },
  {
    id: 'English',
    name: 'English',
    desc: 'MYRAA responds primarily in English while understanding both Telugu and English speech.',
    example: '"We\'re working on the MYRAA voice system. Let\'s continue from where we stopped."',
  },
  {
    id: 'Telugu',
    name: 'Telugu',
    desc: 'MYRAA responds primarily in natural spoken Telugu.',
    example: '"అవును చిన్నా... ఇవాళ మనం MYRAA వాయిస్ సిస్టమ్ ని కంప్లీట్ చేద్దాం."',
  },
];

const VOICES = [
  { id: 'Aoede', name: 'Aoede', style: 'Bright, melodic, playful, cute & youthful female voice (Recommended)' },
  { id: 'Zephyr', name: 'Zephyr', style: 'Young, warm, gentle & lively female companion voice' },
  { id: 'Kore', name: 'Kore', style: 'Soft, intimate, soothing & caring female voice' },
  { id: 'Puck', name: 'Puck', style: 'Energetic, cheerful, lively female voice' },
  { id: 'Fenrir', name: 'Fenrir', style: 'Calm, focused, deeper tone' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenApiSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="settings-modal-overlay"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">MYRAA Settings & Language</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-800">
          {/* Gemini API Key Configuration Entry */}
          {onOpenApiSettings && (
            <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-100 font-semibold block text-xs">
                    MYRAA API Configuration
                  </span>
                  <span className="text-[11px] text-cyan-300/70">
                    Google Gemini API Key & connection testing
                  </span>
                </div>
              </div>
              <button
                type="button"
                id="modal-open-api-settings-btn"
                onClick={() => {
                  onClose();
                  onOpenApiSettings();
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap shadow-sm"
              >
                Configure Key
              </button>
            </div>
          )}

          {/* Language Selection */}
          <div className="space-y-2 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-semibold flex items-center gap-1.5 text-xs">
                <Languages className="w-4 h-4 text-amber-400" />
                MYRAA Language
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono">
                Active: {settings.language}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Select MYRAA's conversational language mode. Saved persistently across app restarts.
            </p>

            <div className="grid grid-cols-1 gap-2 mt-2">
              {LANGUAGES.map((lang) => {
                const isActive = settings.language === lang.id;
                return (
                  <button
                    key={lang.id}
                    id={`language-option-${lang.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    onClick={() => onUpdateSettings({ language: lang.id })}
                    className={`text-left p-3 rounded-xl border transition-all relative cursor-pointer ${
                      isActive
                        ? 'bg-amber-950/30 border-amber-500/70 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-xs">{lang.name}</span>
                        {lang.isDefault && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 border border-slate-700 font-mono">
                            Default
                          </span>
                        )}
                      </div>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold">
                          <Check className="w-3 h-3 stroke-[3]" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{lang.desc}</p>
                    <div className="mt-1.5 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60 font-mono text-[10px] text-slate-300 italic">
                      {lang.example}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Model Selection */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-rose-400" />
              Gemini Live Voice
            </label>
            <p className="text-[11px] text-slate-400">
              Select prebuilt voice style for MYRAA. Changes apply seamlessly to live sessions.
            </p>
            <div className="grid grid-cols-1 gap-1.5 mt-2">
              {VOICES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => onUpdateSettings({ voiceName: v.id })}
                  className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                    settings.voiceName === v.id
                      ? 'bg-rose-950/40 border-rose-500/50 text-white'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{v.name}</span>
                    {settings.voiceName === v.id && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-black font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{v.style}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Wake Word Detection */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-semibold block flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-cyan-400" />
                  Wake Word Activation
                </span>
                <span className="text-[11px] text-slate-400">
                  Wake MYRAA from standby saying "Hey Myraa" or "Myraa"
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.wakeWordEnabled}
                onChange={(e) => onUpdateSettings({ wakeWordEnabled: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Proactive Companion Behavior */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-semibold block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Proactive Check-Ins
                </span>
                <span className="text-[11px] text-slate-400">
                  Gently initiate natural check-ins when Chinna works for a while
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.proactiveEnabled}
                onChange={(e) => onUpdateSettings({ proactiveEnabled: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {settings.proactiveEnabled && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  Interval:
                </span>
                <select
                  value={settings.proactiveIntervalMinutes}
                  onChange={(e) =>
                    onUpdateSettings({ proactiveIntervalMinutes: parseInt(e.target.value, 10) })
                  }
                  className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-300"
                >
                  <option value={15}>Every 15 minutes</option>
                  <option value={25}>Every 25 minutes (Pomodoro)</option>
                  <option value={45}>Every 45 minutes</option>
                  <option value={60}>Every 60 minutes</option>
                </select>
              </div>
            )}
          </div>

          {/* Voice Volume Control */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                MYRAA Voice Volume
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                {Math.round(settings.soundVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Barge-in Sensitivity */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-200 font-semibold">Barge-in / Interruption Sensitivity</span>
              <span className="text-slate-400 font-mono text-[11px]">
                {Math.round(settings.bargeInThreshold * 1000)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Low threshold stops MYRAA quickly when you talk over her.
            </p>
            <input
              type="range"
              min="0.01"
              max="0.10"
              step="0.005"
              value={settings.bargeInThreshold}
              onChange={(e) => onUpdateSettings({ bargeInThreshold: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Privacy & Safety Note */}
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Privacy & Companion Ethics
            </div>
            <p className="leading-relaxed">
              Continuous listening is active only during session. Microphone is released when
              stopped. Memories are stored locally on server and never shared.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
