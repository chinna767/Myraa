/**
 * Core TypeScript definitions for PROJECT MYRAA
 */

export type EmotionType = 
  | 'happiness'
  | 'curiosity'
  | 'excitement'
  | 'concern'
  | 'affection'
  | 'confidence'
  | 'empathy'
  | 'energy'
  | 'playfulness'
  | 'surprise'
  | 'calmness'
  | 'sadness'
  | 'frustration'
  | 'pride'
  | 'shyness'
  | 'anticipation';

export interface EmotionState {
  happiness: number;     // 0.0 - 1.0 (cheerful, positive, bright)
  curiosity: number;     // 0.0 - 1.0 (inquisitive, engaged, thoughtful)
  excitement: number;    // 0.0 - 1.0 (lively, animated, enthusiastic)
  concern: number;       // 0.0 - 1.0 (attentive, supportive, caring)
  affection: number;     // 0.0 - 1.0 (warm, romantic, friendly, sweet)
  confidence: number;    // 0.0 - 1.0 (clear, assured, composed)
  empathy: number;       // 0.0 - 1.0 (compassionate, understanding)
  energy: number;        // 0.0 - 1.0 (vocal vigor, spirited, dynamic)
  playfulness: number;   // 0.0 - 1.0 (teasing, cute, humorous)
  surprise: number;      // 0.0 - 1.0 (delighted, astonished, wide-eyed)
  calmness: number;      // 0.0 - 1.0 (peaceful, serene, relaxed)
  sadness: number;       // 0.0 - 1.0 (subdued, sympathetic, gentle)
  frustration: number;   // 0.0 - 1.0 (empathetic awareness of obstacles)
  pride: number;         // 0.0 - 1.0 (celebratory, proud of Chinna)
  shyness: number;       // 0.0 - 1.0 (flustered, cute, endearing)
  anticipation: number;  // 0.0 - 1.0 (eager expectation, looking forward)
}

export type VisualMode = 'living_orb' | 'energy_orb' | 'quantum_neural';

export interface EmotionBlend {
  primary?: EmotionType;
  primaryValue?: number;
  secondary?: EmotionType;
  secondaryValue?: number;
  dominant?: string;
  descriptor: string;
  deliveryTone?: string;
  speedGuide?: 'normal' | 'slightly_faster' | 'moderate' | 'slightly_slower' | 'relaxed_soft';
  auraColors?: {
    primary: string;
    secondary: string;
    glow: string;
  };
  weights?: Record<string, number>;
}

export type MemoryCategory = 
  | 'Preference'
  | 'Goal'
  | 'Project'
  | 'Habit'
  | 'Schedule'
  | 'Relationship'
  | 'Interest'
  | 'Important Fact'
  | 'Conversation'
  | 'Instruction';

export interface Memory {
  id: string;
  category: MemoryCategory;
  key: string;
  value: string;
  source: string;
  importance: number; // 1 - 10
  createdAt: string;
  updatedAt: string;
}

export type ConnectionStatus = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'standby'
  | 'reconnecting'
  | 'error';

export type AudioActivity = 
  | 'idle'
  | 'listening'
  | 'speaking'
  | 'interrupted';

export interface TimelineMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
  emotionTag?: string;
  memorySaved?: boolean;
  memoryDetails?: {
    key: string;
    value: string;
    category: MemoryCategory;
  };
  interrupted?: boolean;
}

export type MyraaLanguage = 'Telugu + English' | 'English' | 'Telugu';

export interface MyraaSettings {
  language: MyraaLanguage; // 'Telugu + English' (Default) | 'English' | 'Telugu'
  voiceName: string; // 'Kore' | 'Zephyr' | 'Aoede' | 'Puck'
  wakeWordEnabled: boolean;
  wakeWordSensitivity: number; // 0.1 - 1.0
  proactiveEnabled: boolean;
  proactiveIntervalMinutes: number; // e.g. 15, 30, 45, 60
  bargeInThreshold: number; // audio volume threshold for mic interruption
  soundVolume: number; // 0.0 - 1.0
  autoListenOnStart: boolean;
}

export interface SystemTool {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'productivity' | 'memory' | 'media';
  requiresConfirmation: boolean;
  parameters: Record<string, unknown>;
}

export interface ActivityContext {
  currentTime: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  currentProject: string;
  sessionDurationMinutes: number;
  batteryLevel?: number;
  isOnline: boolean;
}
