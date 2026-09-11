import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, PhoneOff, Sparkles, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { TimelineMessage, ConnectionStatus } from '../types';

interface MyraaChatBoxProps {
  messages: TimelineMessage[];
  onSendMessage: (text: string) => Promise<void> | void;
  isSending?: boolean;
  isThinking?: boolean;
  isSpeaking?: boolean;
  isListening?: boolean;
  status: ConnectionStatus;
  onToggleVoice: () => void;
}

const QUICK_PROMPTS = [
  'Ela unnav Myraa?',
  'What is the current IST time?',
  'Upcoming Indian festival?',
  'Tell me something nice',
];

export const MyraaChatBox: React.FC<MyraaChatBoxProps> = ({
  messages,
  onSendMessage,
  isSending = false,
  isThinking = false,
  isSpeaking = false,
  isListening = false,
  status,
  onToggleVoice,
}) => {
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isVoiceActive = status === 'connected' || status === 'connecting' || status === 'reconnecting';

  // Auto-scroll to bottom of messages whenever messages or thinking state changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isThinking, isSpeaking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;

    setInputText('');
    await onSendMessage(trimmed);
  };

  const handleQuickPromptClick = async (prompt: string) => {
    if (isSending) return;
    await onSendMessage(prompt);
  };

  return (
    <div
      id="myraa-chat-box-container"
      className="w-full max-w-md sm:max-w-lg mx-auto flex flex-col items-center z-20 px-3 sm:px-4 transition-all"
    >
      {/* 1. Conversation Stream / Message Display Area */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full mb-2 flex flex-col"
          >
            {/* Message Stream Card */}
            <div
              ref={scrollRef}
              className="w-full max-h-36 xs:max-h-44 sm:max-h-52 overflow-y-auto rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-xl p-3 space-y-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.45)] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
            >
              {messages.length === 0 ? (
                <div className="py-3 px-2 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1.5 text-cyan-400/90 text-xs font-medium mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>Chat with MYRAA</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans max-w-xs leading-relaxed">
                    Type a message in Telugu or English, or use the voice button anytime.
                  </p>
                  
                  {/* Quick suggestion chips */}
                  <div className="flex flex-wrap gap-1.5 justify-center mt-2.5">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleQuickPromptClick(prompt)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-sans bg-slate-900/80 hover:bg-cyan-950/70 border border-slate-700/60 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-200 transition-all cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  const isSystem = msg.role === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-slate-900/80 text-cyan-300/80 border border-cyan-500/20 font-mono">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center text-[9px] font-black text-slate-950 shrink-0 mt-0.5 shadow-sm shadow-cyan-950/60">
                          M
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-xs sm:text-[13px] leading-relaxed break-words font-sans transition-all ${
                          isUser
                            ? 'bg-sky-950/70 border border-sky-500/30 text-sky-100 rounded-tr-xs shadow-md shadow-sky-950/30'
                            : 'bg-slate-900/85 border border-cyan-500/25 text-slate-200 rounded-tl-xs shadow-md shadow-cyan-950/40'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  );
                })
              )}

              {/* Thinking / Streaming Indicator */}
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-cyan-300/80 text-xs py-1 px-1"
                >
                  <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-[8px] font-bold text-slate-950">
                    M
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse delay-150" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse delay-300" />
                    <span className="text-[10px] text-slate-400 font-mono ml-1">MYRAA is thinking...</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Chat Input Box (Precision Alignment & Dark Obsidian Glass Aesthetic) */}
      <form
        onSubmit={handleSubmit}
        className="w-full relative flex items-center gap-2 p-1.5 rounded-full bg-slate-950/80 border border-slate-800/90 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] focus-within:border-cyan-500/50 focus-within:shadow-[0_0_20px_rgba(34,211,238,0.18)] transition-all"
      >
        {/* Toggle Chat History Button (if messages exist) */}
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse messages' : 'Expand messages'}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60 transition-colors shrink-0 cursor-pointer"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <div className="relative">
                <MessageSquare className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
              </div>
            )}
          </button>
        )}

        {/* Text Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Message MYRAA in Telugu or English..."
          disabled={isSending}
          className="flex-1 bg-transparent border-0 outline-none text-slate-100 placeholder-slate-500 font-sans text-xs sm:text-sm px-2.5 py-1.5 min-w-0"
        />

        {/* Voice Toggle Button (Microphone / End Session) */}
        <button
          type="button"
          onClick={onToggleVoice}
          title={isVoiceActive ? 'End voice session' : 'Start voice session with MYRAA'}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            isVoiceActive
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
              : 'bg-slate-900/70 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 border border-slate-700/50'
          }`}
        >
          {isVoiceActive ? (
            <PhoneOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          title="Send message"
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            inputText.trim() && !isSending
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold shadow-[0_0_14px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95'
              : 'bg-slate-900/50 text-slate-600 cursor-not-allowed border border-slate-800/40'
          }`}
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
};
