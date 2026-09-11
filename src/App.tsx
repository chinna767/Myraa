import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  PhoneOff,
  Layers,
} from 'lucide-react';

import {
  ConnectionStatus,
  EmotionState,
  EmotionBlend,
  Memory,
  MyraaLanguage,
  MyraaSettings,
  TimelineMessage,
} from './types';

import { AudioEngine } from './services/AudioEngine';
import { GeminiLiveService } from './services/GeminiLiveService';
import { EmotionEngine } from './services/EmotionEngine';
import { MemoryEngine } from './services/MemoryEngine';
import { WakeWordEngine } from './services/WakeWordEngine';
import { ProactiveBehaviorEngine } from './services/ProactiveBehaviorEngine';
import { ToolManager } from './services/ToolManager';

import { MyraaLivingOrb, MyraaOrb } from './components/MyraaLivingOrb';
import { MyraaAtmosphericBackground } from './components/MyraaAtmosphericBackground';
import { MyraaHeader } from './components/MyraaHeader';
import { MyraaMinimalStatusArea } from './components/MyraaMinimalStatusArea';
import { CompanionSecondaryDrawer } from './components/CompanionSecondaryDrawer';
import { AudioWaveform } from './components/AudioWaveform';
import { MemoryPanel } from './components/MemoryPanel';
import { EmotionHUD } from './components/EmotionHUD';
import { SettingsModal } from './components/SettingsModal';
import { ApiKeySettingsModal } from './components/ApiKeySettingsModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { MicrophonePermissionModal } from './components/MicrophonePermissionModal';
import { MyraaCalendarModal } from './components/MyraaCalendarModal';
import { WebsiteHome } from './website/WebsiteHome.tsx';

export default function App() {
  // --- Screen Navigation: 'WEBSITE' (official landing) or 'MYRAA' (companion) ---
  const [currentScreen, setCurrentScreen] = useState<'WEBSITE' | 'MYRAA'>('WEBSITE');

  // --- Persistent Settings State ---
  const [settings, setSettings] = useState<MyraaSettings>(() => {
    try {
      const saved = localStorage.getItem('myraa_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      language: 'Telugu + English',
      voiceName: 'Aoede',
      wakeWordEnabled: true,
      soundVolume: 0.95,
      bargeInThreshold: 0.065,
      proactiveEnabled: true,
      proactiveIntervalMinutes: 25,
    };
  });

  // Save settings on update
  useEffect(() => {
    try {
      localStorage.setItem('myraa_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save settings to localStorage:', e);
    }
  }, [settings]);


  // --- Service Singletons via Refs to avoid stale closures ---
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const geminiLiveRef = useRef<GeminiLiveService | null>(null);
  const emotionEngineRef = useRef<EmotionEngine | null>(null);
  const memoryEngineRef = useRef<MemoryEngine | null>(null);
  const wakeWordEngineRef = useRef<WakeWordEngine | null>(null);
  const proactiveEngineRef = useRef<ProactiveBehaviorEngine | null>(null);
  const toolManagerRef = useRef<ToolManager | null>(null);

  // --- Real-time Activity & Status States ---
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [inputVolume, setInputVolume] = useState(0);
  const [outputVolume, setOutputVolume] = useState(0);

  // --- Emotion States ---
  const [emotionState, setEmotionState] = useState<EmotionState>({
    happiness: 0.72,
    curiosity: 0.75,
    excitement: 0.65,
    concern: 0.15,
    affection: 0.75,
    confidence: 0.8,
    empathy: 0.78,
    energy: 0.7,
    playfulness: 0.7,
    surprise: 0.2,
    calmness: 0.65,
    sadness: 0.05,
    frustration: 0.05,
    pride: 0.65,
    shyness: 0.25,
    anticipation: 0.6,
  });
  const [dominantEmotion, setDominantEmotion] = useState('affection');
  const [emotionBlend, setEmotionBlend] = useState<EmotionBlend>({
    dominant: 'affection',
    descriptor: 'Warm & Attentive',
    auraColors: { primary: '#00f0ff', secondary: '#38bdf8', glow: '#06b6d4' },
    speedGuide: 'normal',
    deliveryTone: 'Affectionate, warm, and companionable',
    weights: { affection: 0.75, happiness: 0.72 },
  });

  // --- Memory State ---
  const [memories, setMemories] = useState<Memory[]>([]);

  // --- Timeline Messages State ---
  const [messages, setMessages] = useState<TimelineMessage[]>([]);
  const [isChatSending, setIsChatSending] = useState(false);

  // --- Modal & Panel States ---
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [showEmotionHUD, setShowEmotionHUD] = useState(false);
  const [showSecondaryDrawer, setShowSecondaryDrawer] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showMicPermissionModal, setShowMicPermissionModal] = useState(false);
  const [safetyModal, setSafetyModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Notification logger (pop-up banner removed per user request)
  const showNotification = useCallback((title: string, message: string) => {
    console.log(`[MYRAA Notice] ${title}: ${message}`);
  }, []);

  // --- Initialize Service Layer ---
  useEffect(() => {
    // 1. Audio Engine
    const audio = new AudioEngine();
    audioEngineRef.current = audio;

    // 2. Emotion Engine
    const emotions = new EmotionEngine();
    emotionEngineRef.current = emotions;

    // 3. Memory Engine
    const mems = new MemoryEngine();
    memoryEngineRef.current = mems;
    mems.onMemoriesUpdated = (updated) => {
      setMemories(updated);
    };
    mems.refreshMemories().then(setMemories);

    // 4. Tool Manager
    const tools = new ToolManager();
    toolManagerRef.current = tools;
    tools.onConfirmationRequired = (title, description, onConfirm) => {
      setSafetyModal({
        isOpen: true,
        title,
        description,
        onConfirm: () => {
          setSafetyModal((prev) => ({ ...prev, isOpen: false }));
          onConfirm();
        },
      });
    };
    tools.onToolNotification = (title, desc) => {
      showNotification(title, desc);
    };
    tools.onOpenCalendar = () => {
      setShowCalendarModal(true);
    };

    // 5. Proactive Behavior Engine
    const proactive = new ProactiveBehaviorEngine(
      settings.proactiveEnabled,
      settings.proactiveIntervalMinutes
    );
    proactiveEngineRef.current = proactive;
    proactive.onProactiveInitiate = (promptText) => {
      if (geminiLiveRef.current?.getStatus() === 'connected') {
        geminiLiveRef.current.sendText(
          `[Context: Proactive companion check-in for Chinna] ${promptText}`
        );
      }
    };

    // 6. Wake Word Engine
    const wakeWord = new WakeWordEngine();
    wakeWordEngineRef.current = wakeWord;
    wakeWord.onWakeWordDetected = () => {
      console.log('[App] Wake word heard!');
      if (geminiLiveRef.current?.getStatus() !== 'connected') {
        startSession();
      }
    };

    // 7. Gemini Live Service
    const live = new GeminiLiveService({
      onStatusChange: (newStatus) => {
        console.log('[App] Live status changed:', newStatus);
        setStatus(newStatus);
        if (newStatus === 'connected') {
          setIsThinking(false);
        } else if (newStatus === 'disconnected') {
          setIsSpeaking(false);
          setIsListening(false);
          setIsThinking(false);
        }
      },
      onAudioChunk: (base64Pcm) => {
        setIsSpeaking(true);
        setIsThinking(false);
        audio.playAudioChunk(base64Pcm);
      },
      onTranscription: (role, text, isFinal) => {
        proactive.registerUserActivity();

        if (role === 'user') {
          setIsThinking(true);
          if (text) {
            const lower = text.toLowerCase();
            if (
              lower.includes('show me the calendar') ||
              lower.includes('open calendar') ||
              lower.includes('show calendar') ||
              lower.includes('క్యాలెండర్') ||
              lower.includes('కెలెండర్')
            ) {
              setShowCalendarModal(true);
            }
          }
        } else {
          setIsThinking(false);
        }

        // Update Emotion Engine from conversation
        emotions.processInteraction(role === 'user' ? text : '', role === 'model' ? text : '');
        const nextState = emotions.getState();
        setEmotionState(nextState);
        const dom = emotions.getDominantEmotion();
        setDominantEmotion(dom.type);
        const nextBlend = emotions.getBlendedEmotion();
        const auraColors = emotions.getAuraColors();
        nextBlend.auraColors = auraColors;
        nextBlend.dominant = dom.type;
        setEmotionBlend(nextBlend);
        live.sendEmotionUpdate(nextBlend);

        // Update Conversation Timeline
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (last && last.role === role && !last.isFinal) {
            // Update last chunk
            return [
              ...prev.slice(0, -1),
              {
                ...last,
                text: last.text.endsWith(text) ? last.text : `${last.text} ${text}`.trim(),
                isFinal: Boolean(isFinal),
                timestamp: timeStr,
              },
            ];
          } else {
            return [
              ...prev,
              {
                id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                role,
                text,
                timestamp: timeStr,
                isFinal: Boolean(isFinal),
              },
            ];
          }
        });
      },
      onInterrupted: () => {
        console.log('[App] Model interrupted');
        audio.interrupt();
        setIsSpeaking(false);
        setIsThinking(false);
      },
      onTurnComplete: () => {
        setIsSpeaking(false);
        setIsThinking(false);
      },
      onMemorySaved: (savedMem) => {
        mems.addDirectMemoryLocally(savedMem);
        showNotification('Memory Stored', `MYRAA remembered: "${savedMem.key}"`);
      },
      onMemoryDeleted: (key) => {
        mems.removeDirectMemoryLocally(key);
        showNotification('Memory Forgotten', `MYRAA removed memory: "${key}"`);
      },
      onToolExecuted: (action, details) => {
        tools.executeTool(action, details);
      },
      onError: (errMsg) => {
        console.warn('[App] Gemini Live notice:', errMsg);
        showNotification('Connection Notice', errMsg);
        setIsThinking(false);
      },
    });
    geminiLiveRef.current = live;

    // Audio Engine callbacks
    audio.onAudioChunk = (base64Pcm) => {
      live.sendAudio(base64Pcm);
    };
    audio.onBargeIn = () => {
      live.interrupt();
      setIsSpeaking(false);
    };
    audio.onActivityChange = (listening, speaking) => {
      setIsListening(listening);
      setIsSpeaking(speaking);
    };

    // Polling loop for audio volumes to drive visualizers smoothly
    const volumeInterval = window.setInterval(() => {
      setInputVolume(audio.getInputVolume());
      setOutputVolume(audio.getOutputVolume());
    }, 40);

    return () => {
      window.clearInterval(volumeInterval);
      audio.stopMicrophone();
      live.disconnect();
      wakeWord.stop();
    };
  }, [showNotification]);

  // Handle settings changes
  const handleUpdateSettings = (newSettings: Partial<MyraaSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };

      if (newSettings.language && geminiLiveRef.current) {
        geminiLiveRef.current.setLanguage(newSettings.language);
      }
      if (newSettings.voiceName && geminiLiveRef.current) {
        geminiLiveRef.current.setVoice(newSettings.voiceName);
      }
      if (newSettings.soundVolume !== undefined && audioEngineRef.current) {
        audioEngineRef.current.setVolume(newSettings.soundVolume);
      }
      if (newSettings.wakeWordEnabled !== undefined && wakeWordEngineRef.current) {
        wakeWordEngineRef.current.setEnabled(newSettings.wakeWordEnabled);
      }
      if (proactiveEngineRef.current) {
        proactiveEngineRef.current.setConfig(
          updated.proactiveEnabled,
          updated.proactiveIntervalMinutes
        );
      }

      return updated;
    });
  };

  // Start continuous voice session
  const startSession = async (fallbackToSpeakerMode = false) => {
    try {
      const audio = audioEngineRef.current;
      const live = geminiLiveRef.current;
      if (!audio || !live) return;

      setStatus('connecting');

      if (!fallbackToSpeakerMode) {
        try {
          // Start microphone at 16kHz
          await audio.startMicrophone(settings.bargeInThreshold);
          audio.setVolume(settings.soundVolume);
          setIsMuted(false);
        } catch (micErr: any) {
          console.warn('[App] Microphone error:', micErr);
          const isPermDenied =
            micErr?.name === 'NotAllowedError' ||
            micErr?.name === 'PermissionDeniedError' ||
            micErr?.message?.toLowerCase().includes('permission denied') ||
            micErr?.message?.toLowerCase().includes('permission dismissed');

          if (isPermDenied) {
            setShowMicPermissionModal(true);
            setStatus('disconnected');
            return;
          }
          throw micErr;
        }
      } else {
        // Speaker-only mode (listen & quick actions)
        audio.setVolume(settings.soundVolume);
        setIsMuted(true);
      }

      // Connect to Gemini Live over WebSocket
      await live.connect(settings.voiceName, settings.language);
      setShowMicPermissionModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start session';
      console.warn('[App] Failed to start voice session notice:', msg);
      setStatus('error');
      showNotification('Microphone / Connection Error', msg);
    }
  };

  // Stop / End continuous voice session
  const stopSession = () => {
    audioEngineRef.current?.stopMicrophone();
    geminiLiveRef.current?.disconnect();
    setStatus('disconnected');
    setIsListening(false);
    setIsSpeaking(false);
    setIsThinking(false);
  };

  // Website to AI Companion Navigation Handlers
  const handleConnectMyraa = () => {
    // Only transitions screen; keeps companion in STANDBY until user activates
    setCurrentScreen('MYRAA');
  };

  const handleReturnToWebsite = () => {
    // Safely closes active voice session before returning to landing website
    stopSession();
    setCurrentScreen('WEBSITE');
  };

  const toggleSession = () => {
    if (status === 'connected' || status === 'connecting' || status === 'reconnecting') {
      stopSession();
    } else {
      startSession(false);
    }
  };

  const toggleMute = async () => {
    if (!audioEngineRef.current) return;
    if (isMuted) {
      try {
        await audioEngineRef.current.startMicrophone(settings.bargeInThreshold);
        setIsMuted(false);
      } catch (micErr: any) {
        const isPermDenied =
          micErr?.name === 'NotAllowedError' ||
          micErr?.name === 'PermissionDeniedError' ||
          micErr?.message?.toLowerCase().includes('permission denied') ||
          micErr?.message?.toLowerCase().includes('permission dismissed');

        if (isPermDenied) {
          setShowMicPermissionModal(true);
        } else {
          showNotification('Microphone Error', micErr?.message || 'Could not start microphone');
        }
      }
    } else {
      audioEngineRef.current.stopMicrophone();
      setIsMuted(true);
    }
  };

  // Custom API key save
  const handleSaveCustomKey = (key: string) => {
    geminiLiveRef.current?.setApiKey(key);
    showNotification('API Key Configured', 'Key updated for current session');
  };

  // Interactive Text & Quick Action Chat Handler
  const handleSendChatMessage = async (text: string) => {
    if (!text.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `msg_user_${Date.now()}`;
    const userMsg: TimelineMessage = {
      id: userMsgId,
      role: 'user',
      text: text.trim(),
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);

    // Feed user interaction into emotion engine
    emotionEngineRef.current?.processInteraction(text, '');
    const nextState = emotionEngineRef.current?.getState();
    if (nextState) setEmotionState(nextState);
    const dom = emotionEngineRef.current?.getDominantEmotion();
    if (dom) setDominantEmotion(dom.type);
    const nextBlend = emotionEngineRef.current?.getBlendedEmotion();
    if (nextBlend) {
      const auraColors = emotionEngineRef.current?.getAuraColors();
      if (auraColors) nextBlend.auraColors = auraColors;
      if (dom) nextBlend.dominant = dom.type;
      setEmotionBlend(nextBlend);
    }

    // If live voice session is active, forward text to the live session
    if (geminiLiveRef.current?.getStatus() === 'connected') {
      setIsThinking(true);
      geminiLiveRef.current.sendText(text.trim());
      return;
    }

    // Otherwise, generate response directly via /api/chat
    setIsChatSending(true);
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          language: settings.language,
          apiKey: settings.customApiKey,
          history: messages.slice(-8).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const reply = data.reply || 'I am here with you, Chinna.';
      const modelMsgId = `msg_model_${Date.now()}`;
      const modelMsg: TimelineMessage = {
        id: modelMsgId,
        role: 'model',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);

      // Feed model response into emotion engine for live aura and orb reactivity
      emotionEngineRef.current?.processInteraction('', reply);
      const updatedState = emotionEngineRef.current?.getState();
      if (updatedState) setEmotionState(updatedState);
      const updatedDom = emotionEngineRef.current?.getDominantEmotion();
      if (updatedDom) setDominantEmotion(updatedDom.type);
      const updatedBlend = emotionEngineRef.current?.getBlendedEmotion();
      if (updatedBlend) {
        const auraColors = emotionEngineRef.current?.getAuraColors();
        if (auraColors) updatedBlend.auraColors = auraColors;
        if (updatedDom) updatedBlend.dominant = updatedDom.type;
        setEmotionBlend(updatedBlend);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error chatting with MYRAA';
      showNotification('Chat Notice', msg);
    } finally {
      setIsChatSending(false);
      setIsThinking(false);
    }
  };

  // Handle Quick Action prompt click
  const handleSelectQuickAction = (promptText: string) => {
    handleSendChatMessage(promptText);
  };

  // If on Website Landing Page, display the official WebsiteHome
  if (currentScreen === 'WEBSITE') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="myraa-website-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="w-full min-h-screen"
        >
          <WebsiteHome onConnectMyraa={handleConnectMyraa} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="myraa-companion-screen"
        id="myraa-companion-root"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="relative w-screen h-screen h-[100dvh] overflow-hidden bg-[#020612] text-slate-100 flex flex-col justify-between select-none font-sans"
      >
        {/* 1. Living Atmospheric Dynamic Background */}
        <MyraaAtmosphericBackground
          status={status}
          isListening={isListening}
          isSpeaking={isSpeaking}
          isThinking={isThinking}
          inputVolume={inputVolume}
          outputVolume={outputVolume}
          dominantEmotion={dominantEmotion}
          emotionBlend={emotionBlend}
          emotionState={emotionState}
        />

        {/* 2. Pristine Minimal Header: MYRAA + AI Companion + Controls + Return to Website */}
        <MyraaHeader
          onOpenSettingsModal={() => setShowSettingsModal(true)}
          onOpenDrawer={() => setShowSecondaryDrawer(true)}
          onOpenCalendar={() => setShowCalendarModal(true)}
          onReturnToWebsite={handleReturnToWebsite}
          dominantEmotion={dominantEmotion}
          emotionBlend={emotionBlend}
        />

      {/* 3. Main Center Stage: Luminous Dynamic Living Orb & Minimal Status Area */}
      <main
        id="myraa-main-stage"
        className="relative z-10 flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden"
      >
        <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full max-h-[64vh] sm:max-h-[68vh]">
          {/* THE CENTERPIECE: Next-Generation Emotion-Reactive Dynamic MYRAA Orb */}
          <MyraaOrb
            status={status}
            isListening={isListening && !isMuted}
            isSpeaking={isSpeaking}
            isThinking={isThinking}
            inputVolume={inputVolume}
            outputVolume={outputVolume}
            micLevel={inputVolume}
            outputLevel={outputVolume}
            dominantEmotion={dominantEmotion}
            emotionBlend={emotionBlend}
            emotionState={emotionState}
            getFrequencyData={(buf) => {
              if (isSpeaking) {
                audioEngineRef.current?.getOutputFrequencyData(buf);
              } else if (isListening) {
                audioEngineRef.current?.getInputFrequencyData(buf);
              }
            }}
            onOrbClick={toggleSession}
          />

          {/* Minimal Frequency Waveform Ribbon (only visible when actively speaking or listening) */}
          {(isListening || isSpeaking) && (
            <div className="w-full max-w-xs h-3 -mt-2 mb-1 opacity-70 pointer-events-none">
              <AudioWaveform
                isListening={isListening && !isMuted}
                isSpeaking={isSpeaking}
                getInputData={(buf) => audioEngineRef.current?.getInputFrequencyData(buf)}
                getOutputData={(buf) => audioEngineRef.current?.getOutputFrequencyData(buf)}
                primaryColor="#38bdf8"
                secondaryColor="#818cf8"
              />
            </div>
          )}

          {/* Minimal Dynamic Status Pill (Clean indicator, no emotion text, no dynamic caption) */}
          <MyraaMinimalStatusArea
            status={status}
            isListening={isListening && !isMuted}
            isSpeaking={isSpeaking}
            isThinking={isThinking}
          />
        </div>
      </main>

      {/* 4. Bottom Controls: ONE Primary Interaction Control & Subtle Drawer Trigger */}
      <footer className="relative z-20 w-full flex flex-col items-center pb-5 pt-1 px-4">
        {/* ONE Primary Interaction Control: "TALK WITH MYRAA" / "END SESSION" */}
        <motion.button
          id="main-talk-session-btn"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={toggleSession}
          className={`px-8 py-3.5 rounded-full font-medium flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xl ${
            status === 'connected' || status === 'connecting' || status === 'reconnecting'
              ? 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
              : 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/40 hover:border-cyan-300 text-cyan-100 shadow-[0_0_28px_rgba(6,182,212,0.25)]'
          }`}
        >
          {status === 'connected' || status === 'connecting' || status === 'reconnecting' ? (
            <>
              <PhoneOff className="w-4 h-4 text-rose-400" />
              <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase">
                End Session
              </span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase">
                Talk with MYRAA
              </span>
            </>
          )}
        </motion.button>

        {/* Subtle Secondary Drawer Trigger (Keeping Home Screen uncluttered) */}
        <button
          onClick={() => setShowSecondaryDrawer(true)}
          className="mt-3 flex items-center gap-1.5 text-[11px] font-mono tracking-widest text-slate-400/70 hover:text-cyan-300/90 transition-colors uppercase cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Quick Actions & Hub</span>
        </button>
      </footer>

      {/* 5. Secondary Actions Drawer (Bottom sheet preserving all features) */}
      <CompanionSecondaryDrawer
        isOpen={showSecondaryDrawer}
        onClose={() => setShowSecondaryDrawer(false)}
        onSelectAction={handleSelectQuickAction}
        isConnecting={status === 'connecting'}
        isConnected={status === 'connected'}
        isMuted={isMuted}
        toggleMute={toggleMute}
        memoriesCount={memories.length}
        onOpenMemories={() => setShowMemoryPanel(true)}
        onOpenEmotionHUD={() => setShowEmotionHUD(true)}
        onOpenSettingsModal={() => setShowSettingsModal(true)}
        onOpenCalendar={() => setShowCalendarModal(true)}
        onReturnToWebsite={handleReturnToWebsite}
      />

      {/* Indian Calendar & Festival Intelligence Modal */}
      <MyraaCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onAskMyraa={(prompt) => handleSelectQuickAction(prompt)}
      />

      {/* Modals and Panels */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenApiSettings={() => setShowApiModal(true)}
      />

      <ApiKeySettingsModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        onSaveCustomKey={handleSaveCustomKey}
      />

      <MemoryPanel
        isOpen={showMemoryPanel}
        onClose={() => setShowMemoryPanel(false)}
        memories={memories}
        onSaveMemory={async (data) => {
          await memoryEngineRef.current?.saveExplicitMemory(data);
        }}
        onDeleteMemory={async (id) => {
          await memoryEngineRef.current?.deleteMemory(id);
        }}
      />

      <EmotionHUD
        isOpen={showEmotionHUD}
        onClose={() => setShowEmotionHUD(false)}
        emotionState={emotionState}
        dominantEmotion={dominantEmotion}
        emotionBlend={emotionBlend}
        auraColors={emotionBlend.auraColors}
      />

      <ConfirmationModal
        isOpen={safetyModal.isOpen}
        title={safetyModal.title}
        description={safetyModal.description}
        onConfirm={safetyModal.onConfirm}
        onCancel={() => setSafetyModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <MicrophonePermissionModal
        isOpen={showMicPermissionModal}
        onClose={() => setShowMicPermissionModal(false)}
        onRetry={() => {
          setShowMicPermissionModal(false);
          startSession(false);
        }}
        onContinueSpeakerMode={() => {
          setShowMicPermissionModal(false);
          startSession(true);
        }}
      />
      </motion.div>
    </AnimatePresence>
  );
}
