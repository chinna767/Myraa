import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, Sparkles, User, VolumeX } from 'lucide-react';
import { TimelineMessage } from '../types';

interface ConversationTimelineProps {
  messages: TimelineMessage[];
  isSpeaking: boolean;
  onOpenMemory?: (key: string) => void;
}

export const ConversationTimeline: React.FC<ConversationTimelineProps> = ({
  messages,
  isSpeaking,
  onOpenMemory,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSpeaking]);

  return (
    <div
      id="conversation-timeline"
      className="flex-1 w-full max-w-2xl overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin scrollbar-thumb-purple-900/40 scrollbar-track-transparent"
      ref={scrollRef}
    >
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mb-3 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
            <Sparkles className="w-5 h-5 animate-pulse text-cyan-300" />
          </div>
          <h3 className="text-sm font-semibold tracking-wider text-cyan-100 uppercase">
            Live Voice Stream Ready
          </h3>
          <p className="text-xs text-cyan-300/60 max-w-sm mt-1.5 leading-relaxed font-sans">
            Speak naturally with MYRAA anytime. She perceives your voice in real time with emotional depth. Try:
            <span className="block mt-2 font-mono text-cyan-200 text-[11px] bg-black/60 p-2.5 rounded-xl border border-cyan-500/30 shadow-md">
              "Hey Myraa, ela unnav? Let's talk about our plans."
            </span>
          </p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSystem = msg.role === 'system';

            if (isSystem) {
              return (
                <div
                  key={msg.id}
                  className="flex justify-center my-2"
                >
                  <span className="px-3 py-1 rounded-full text-[11px] bg-black/80 text-cyan-300/90 border border-cyan-500/30 shadow-sm flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center text-black text-xs font-black shrink-0 shadow-md shadow-cyan-950/60 border border-cyan-300/40">
                    M
                  </div>
                )}
                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-3.5 text-sm backdrop-blur-xl transition-all ${
                    isUser
                      ? 'bg-[#06182c]/90 border border-sky-400/40 text-sky-50 rounded-tr-sm shadow-lg shadow-sky-950/40'
                      : 'bg-[#041224]/90 border border-cyan-400/35 text-cyan-50 rounded-tl-sm shadow-lg shadow-cyan-950/50'
                  }`}
                >
                  {/* Sender & Timestamp header */}
                  <div className="flex items-center justify-between gap-3 text-[10px] text-cyan-300/60 mb-1.5 font-mono">
                    <span className={`font-bold tracking-wide ${isUser ? 'text-sky-300' : 'text-cyan-300'}`}>
                      {isUser ? 'Chinna' : 'MYRAA'}
                    </span>
                    <span className="text-cyan-400/40">{msg.timestamp}</span>
                  </div>

                  {/* Message body */}
                  <div className="leading-relaxed whitespace-pre-wrap break-words">
                    {msg.text}
                  </div>

                  {/* Interrupted Tag */}
                  {msg.interrupted && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-cyan-300 font-semibold font-mono">
                      <VolumeX className="w-3 h-3" />
                      <span>Interrupted by Chinna</span>
                    </div>
                  )}

                  {/* Memory Stored Badge */}
                  {msg.memorySaved && (
                    <div
                      onClick={() => msg.memoryDetails && onOpenMemory?.(msg.memoryDetails.key)}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 text-[11px] font-semibold cursor-pointer hover:bg-emerald-900/80 transition-colors shadow-sm"
                    >
                      <Bookmark className="w-3 h-3 text-emerald-400" />
                      <span>
                        Saved to Memory:{' '}
                        <strong className="text-emerald-100">{msg.memoryDetails?.key || 'Information'}</strong>
                      </span>
                    </div>
                  )}

                  {/* Emotion Tag */}
                  {msg.emotionTag && !isUser && (
                    <div className="mt-2 text-[10px] text-cyan-400/80 italic font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/70" />
                      <span>{msg.emotionTag}</span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-blue-700 border border-sky-400/40 flex items-center justify-center text-white text-xs shrink-0 shadow-md shadow-sky-950/50">
                    <User className="w-4 h-4 text-sky-200" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
};
