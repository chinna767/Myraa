import React, { useEffect, useRef, useState } from 'react';
import { ConnectionStatus, EmotionBlend, EmotionState } from '../types';

export interface MyraaOrbProps {
  // Connection and voice state
  status: ConnectionStatus;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking?: boolean;
  isInterrupted?: boolean;
  isSavingMemory?: boolean;

  // Real audio levels (normalized 0.0 - 1.0)
  micLevel?: number;       // from user's microphone
  outputLevel?: number;    // from MYRAA's voice playback
  inputVolume?: number;    // backwards-compatible alias
  outputVolume?: number;   // backwards-compatible alias

  // Emotion integration (read-only from existing Emotion Engine)
  dominantEmotion?: string;
  emotionBlend?: EmotionBlend;
  emotionState?: EmotionState;
  emotionIntensity?: number;

  // Optional real audio frequency data getter
  getFrequencyData?: (dataArray: Uint8Array) => void;

  // Click handler
  onOrbClick?: () => void;
  className?: string;
}

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

interface EmotionPalette {
  primary: ColorRGB;
  secondary: ColorRGB;
  tertiary: ColorRGB;
  core: ColorRGB;
  glow: ColorRGB;
  speed: number;
  glowFactor: number;
  deformFactor: number;
  coreTightness: number;
}

// 7 Master Emotional Palettes as explicitly specified
const MASTER_EMOTION_PALETTES: Record<string, EmotionPalette> = {
  // HAPPINESS: Soft Gold, Warm Pink, Violet
  happiness: {
    primary: { r: 251, g: 191, b: 36 },    // Soft Gold
    secondary: { r: 244, g: 114, b: 182 }, // Warm Pink
    tertiary: { r: 192, g: 132, b: 252 },  // Violet
    core: { r: 254, g: 243, b: 199 },      // Luminous Cream Gold
    glow: { r: 251, g: 191, b: 36 },
    speed: 1.15,
    glowFactor: 1.25,
    deformFactor: 1.12,
    coreTightness: 1.0,
  },
  // CURIOSITY: Cyan, Blue, Violet
  curiosity: {
    primary: { r: 6, g: 182, b: 212 },     // Cyan
    secondary: { r: 59, g: 130, b: 246 },  // Blue
    tertiary: { r: 139, g: 92, b: 246 },   // Violet
    core: { r: 207, g: 250, b: 254 },      // Luminous Ice Cyan
    glow: { r: 6, g: 182, b: 212 },
    speed: 1.2,
    glowFactor: 1.15,
    deformFactor: 1.22,
    coreTightness: 1.05,
  },
  // EXCITEMENT: Pink, Purple, Electric Blue
  excitement: {
    primary: { r: 236, g: 72, b: 153 },    // Pink
    secondary: { r: 168, g: 85, b: 247 },  // Purple
    tertiary: { r: 0, g: 240, b: 255 },    // Electric Blue
    core: { r: 253, g: 231, b: 243 },      // Radiant Magenta Light
    glow: { r: 236, g: 72, b: 153 },
    speed: 1.4,
    glowFactor: 1.35,
    deformFactor: 1.32,
    coreTightness: 1.1,
  },
  // CONCERN: Soft Amber, Muted Violet, Deep Blue
  concern: {
    primary: { r: 245, g: 158, b: 11 },    // Soft Amber
    secondary: { r: 109, g: 40, b: 217 },  // Muted Violet
    tertiary: { r: 30, g: 58, b: 138 },    // Deep Blue
    core: { r: 254, g: 243, b: 199 },      // Amber Glow
    glow: { r: 245, g: 158, b: 11 },
    speed: 0.8,
    glowFactor: 0.9,
    deformFactor: 0.85,
    coreTightness: 0.95,
  },
  // AFFECTION: Soft Rose, Lavender, Gentle Pink
  affection: {
    primary: { r: 251, g: 113, b: 133 },   // Soft Rose
    secondary: { r: 232, g: 121, b: 249 },  // Lavender
    tertiary: { r: 244, g: 63, b: 94 },    // Gentle Pink
    core: { r: 255, g: 228, b: 230 },      // Rose Pearl
    glow: { r: 251, g: 113, b: 133 },
    speed: 0.9,
    glowFactor: 1.2,
    deformFactor: 0.95,
    coreTightness: 1.0,
  },
  // CONFIDENCE: Royal Blue, Indigo, Cool Cyan
  confidence: {
    primary: { r: 37, g: 99, b: 235 },     // Royal Blue
    secondary: { r: 79, g: 70, b: 229 },   // Indigo
    tertiary: { r: 56, g: 189, b: 248 },   // Cool Cyan
    core: { r: 224, g: 242, b: 254 },      // Bright Stellar Blue
    glow: { r: 37, g: 99, b: 235 },
    speed: 0.95,
    glowFactor: 1.15,
    deformFactor: 0.9,
    coreTightness: 1.12,
  },
  // EMPATHY: Lavender, Soft Blue, Muted Rose
  empathy: {
    primary: { r: 192, g: 132, b: 252 },   // Lavender
    secondary: { r: 96, g: 165, b: 250 },  // Soft Blue
    tertiary: { r: 253, g: 164, b: 175 },  // Muted Rose
    core: { r: 245, g: 243, b: 255 },      // Gentle Violet White
    glow: { r: 192, g: 132, b: 252 },
    speed: 0.78,
    glowFactor: 1.08,
    deformFactor: 0.88,
    coreTightness: 0.98,
  },
};

// Subtle Internal Digital Consciousness Particle
interface InternalParticle {
  angle: number;
  dist: number;
  speed: number;
  radius: number;
  alpha: number;
  phase: number;
  colorType: 'primary' | 'secondary' | 'core';
}

// Gentle Click / Interaction Wave
interface RippleWave {
  radius: number;
  maxRadius: number;
  speed: number;
  alpha: number;
  color: ColorRGB;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpRGB(a: ColorRGB, b: ColorRGB, t: number): ColorRGB {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function rgbStr(c: ColorRGB, alpha = 1.0): string {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
}

export const MyraaOrb: React.FC<MyraaOrbProps> = ({
  status,
  isListening,
  isSpeaking,
  isThinking = false,
  isInterrupted = false,
  isSavingMemory = false,
  micLevel,
  outputLevel,
  inputVolume = 0,
  outputVolume = 0,
  dominantEmotion = 'affection',
  emotionBlend,
  emotionState,
  emotionIntensity = 1.0,
  getFrequencyData,
  onOrbClick,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Performance architecture: Keep latest props in a ref so the single animation loop NEVER restarts on audio updates
  const propsRef = useRef({
    status,
    isListening,
    isSpeaking,
    isThinking,
    isInterrupted,
    isSavingMemory,
    effectiveMic: micLevel !== undefined ? micLevel : inputVolume,
    effectiveOut: outputLevel !== undefined ? outputLevel : outputVolume,
    dominantEmotion,
    emotionBlend,
    emotionState,
    emotionIntensity,
    getFrequencyData,
  });

  // Keep ref synchronized immediately on every React render
  propsRef.current = {
    status,
    isListening,
    isSpeaking,
    isThinking,
    isInterrupted,
    isSavingMemory,
    effectiveMic: micLevel !== undefined ? micLevel : inputVolume,
    effectiveOut: outputLevel !== undefined ? outputLevel : outputVolume,
    dominantEmotion,
    emotionBlend,
    emotionState,
    emotionIntensity,
    getFrequencyData,
  };

  // Internal smooth tracking follower states
  const audioFollowerRef = useRef({
    outAmp: 0,
    inAmp: 0,
    activeLevel: 0,
  });

  // Current interpolated emotion palette (starts at Affection / Warmth)
  const currentPaletteRef = useRef<EmotionPalette>({ ...MASTER_EMOTION_PALETTES.affection });

  // Inertia and visual dynamic scales
  const dynamicStateRef = useRef({
    baseRadius: 110,
    breathPhase: 0,
    scale: 1.0,
    glowIntensity: 1.0,
    deformation: 1.0,
    energyCurrents: 0.0,
    interruptedAlpha: 0.0,
    memoryPulse: 0.0,
  });

  // Internal consciousness particles (18 particles)
  const particlesRef = useRef<InternalParticle[]>([]);
  // Interactive click ripples
  const ripplesRef = useRef<RippleWave[]>([]);
  // Real frequency bins buffer
  const freqBufferRef = useRef<Uint8Array>(new Uint8Array(64));

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    // High-DPI Canvas sizing
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    const resize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const size = Math.round(Math.min(rect.width, rect.height)) || 380;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Initialize 20 internal soft particles
    const particles: InternalParticle[] = [];
    for (let i = 0; i < 20; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: 0.15 + Math.random() * 0.62,
        speed: (0.008 + Math.random() * 0.012) * (Math.random() > 0.5 ? 1 : -1),
        radius: 1.4 + Math.random() * 2.2,
        alpha: 0.25 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        colorType: i % 3 === 0 ? 'core' : i % 2 === 0 ? 'primary' : 'secondary',
      });
    }
    particlesRef.current = particles;

    const startTime = performance.now();
    let lastTime = startTime;

    // ─────────────────────────────────────────────────────────────────────────
    // SINGLE REQUEST ANIMATION FRAME LOOP (Never destroyed during audio updates)
    // ─────────────────────────────────────────────────────────────────────────
    const render = (now: number) => {
      if (!isRunning) return;

      const dt = Math.min((now - lastTime) * 0.001, 0.08);
      lastTime = now;
      const time = (now - startTime) * 0.001;

      const p = propsRef.current;
      const rect = container.getBoundingClientRect();
      const size = Math.round(Math.min(rect.width, rect.height)) || 380;
      const cx = size / 2;
      const cy = size / 2;

      // Base radius ~31% of viewport width
      const baseRadius = size * 0.31;
      dynamicStateRef.current.baseRadius = baseRadius;

      // ─────────────────────────────────────────────────────────────────────
      // 1. REAL AUDIO LEVEL PROCESSING (Zero faked data)
      // ─────────────────────────────────────────────────────────────────────
      const audio = audioFollowerRef.current;
      const rawOut = p.effectiveOut || 0;
      const rawIn = p.effectiveMic || 0;

      // MYRAA Speaking: visual responds directly to original MYRAA voice output
      const targetOut = p.isSpeaking ? Math.min(1.5, rawOut * 1.7) : 0;
      // User Speaking: visual responds directly to microphone volume
      const targetIn = (p.isListening && !p.isSpeaking) ? Math.min(1.4, rawIn * 1.6) : 0;

      // Smooth follower interpolation
      audio.outAmp = lerp(audio.outAmp, targetOut, Math.min(1.0, dt * 12.0));
      audio.inAmp = lerp(audio.inAmp, targetIn, Math.min(1.0, dt * 12.0));

      let activeAudio = 0;
      if (p.isSpeaking) {
        // Natural visual breathing floor while speaking
        activeAudio = Math.max(audio.outAmp, 0.08);
      } else if (p.isListening) {
        activeAudio = Math.max(audio.inAmp, 0.04);
      }
      audio.activeLevel = lerp(audio.activeLevel, activeAudio, Math.min(1.0, dt * 10.0));

      // Optional real frequency data extraction
      let freqArray: Uint8Array | null = null;
      if (p.getFrequencyData) {
        try {
          p.getFrequencyData(freqBufferRef.current);
          freqArray = freqBufferRef.current;
        } catch {
          freqArray = null;
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // 2. CONTINUOUS EMOTION BLENDING (Smooth lerp, no sudden flashing)
      // ─────────────────────────────────────────────────────────────────────
      const emotionKey = (p.dominantEmotion || 'affection').toLowerCase();
      let targetPalette = MASTER_EMOTION_PALETTES.affection;

      if (emotionKey.includes('happy') || emotionKey.includes('cheer') || emotionKey.includes('joy')) {
        targetPalette = MASTER_EMOTION_PALETTES.happiness;
      } else if (emotionKey.includes('curious') || emotionKey.includes('inquisitive') || emotionKey.includes('explore')) {
        targetPalette = MASTER_EMOTION_PALETTES.curiosity;
      } else if (emotionKey.includes('excite') || emotionKey.includes('play') || emotionKey.includes('energy')) {
        targetPalette = MASTER_EMOTION_PALETTES.excitement;
      } else if (emotionKey.includes('concern') || emotionKey.includes('care') || emotionKey.includes('attentive')) {
        targetPalette = MASTER_EMOTION_PALETTES.concern;
      } else if (emotionKey.includes('confidence') || emotionKey.includes('pride') || emotionKey.includes('calm')) {
        targetPalette = MASTER_EMOTION_PALETTES.confidence;
      } else if (emotionKey.includes('empath') || emotionKey.includes('gentle') || emotionKey.includes('soft') || emotionKey.includes('sadness')) {
        targetPalette = MASTER_EMOTION_PALETTES.empathy;
      } else if (emotionKey.includes('affection') || emotionKey.includes('love') || emotionKey.includes('warm')) {
        targetPalette = MASTER_EMOTION_PALETTES.affection;
      }

      const currPal = currentPaletteRef.current;
      const colorLerpRate = Math.min(1.0, dt * 3.2);
      currPal.primary = lerpRGB(currPal.primary, targetPalette.primary, colorLerpRate);
      currPal.secondary = lerpRGB(currPal.secondary, targetPalette.secondary, colorLerpRate);
      currPal.tertiary = lerpRGB(currPal.tertiary, targetPalette.tertiary, colorLerpRate);
      currPal.core = lerpRGB(currPal.core, targetPalette.core, colorLerpRate);
      currPal.glow = lerpRGB(currPal.glow, targetPalette.glow, colorLerpRate);
      currPal.speed = lerp(currPal.speed, targetPalette.speed, colorLerpRate);
      currPal.glowFactor = lerp(currPal.glowFactor, targetPalette.glowFactor, colorLerpRate);
      currPal.deformFactor = lerp(currPal.deformFactor, targetPalette.deformFactor, colorLerpRate);
      currPal.coreTightness = lerp(currPal.coreTightness, targetPalette.coreTightness, colorLerpRate);

      // ─────────────────────────────────────────────────────────────────────
      // 3. VOICE STATE DYNAMICS
      // ─────────────────────────────────────────────────────────────────────
      const dyn = dynamicStateRef.current;
      let targetScale = 1.0;
      let targetGlow = currPal.glowFactor;
      let targetDeform = currPal.deformFactor;
      let targetSpeed = currPal.speed;

      // Natural breathing cycle
      const breath = Math.sin(time * (1.2 * targetSpeed)) * 0.028;

      if (p.status === 'disconnected') {
        // STANDBY: Slow breathing, minimal movement, calm internal glow
        targetScale = 0.96 + breath * 0.8;
        targetGlow = 0.75;
        targetDeform = 0.55;
      } else if (p.status === 'connecting' || p.status === 'reconnecting') {
        // CONNECTING: Energy gathers, rhythmic pulsing, internal light gathers
        const gatheringPulse = Math.sin(time * 4.5) * 0.05;
        targetScale = 1.02 + gatheringPulse;
        targetGlow = 1.35;
        targetDeform = 1.25;
      } else if (p.isThinking) {
        // THINKING / REFLECTING: Concentrated intellectual swirl
        targetScale = 1.03 + Math.sin(time * 3.0) * 0.03;
        targetGlow = 1.3;
        targetDeform = 1.3;
      } else if (p.isSpeaking) {
        // MYRAA_SPEAKING: Dances with original voice output
        targetScale = 1.04 + audio.outAmp * 0.09;
        targetGlow = 1.3 + audio.outAmp * 0.55;
        targetDeform = 1.15 + audio.outAmp * 0.65;
      } else if (p.isListening) {
        // USER_SPEAKING or LISTENING: Attentive, slightly expanded, responding to mic
        targetScale = 1.02 + audio.inAmp * 0.07;
        targetGlow = 1.15 + audio.inAmp * 0.45;
        targetDeform = 1.05 + audio.inAmp * 0.5;
      }

      if (p.isInterrupted) {
        dyn.interruptedAlpha = 1.0;
      }
      dyn.interruptedAlpha = lerp(dyn.interruptedAlpha, 0, Math.min(1.0, dt * 2.5));

      if (p.isSavingMemory) {
        dyn.memoryPulse = 1.0;
      }
      dyn.memoryPulse = lerp(dyn.memoryPulse, 0, Math.min(1.0, dt * 2.0));

      // Smooth inertia transitions
      dyn.scale = lerp(dyn.scale, targetScale, Math.min(1.0, dt * 6.0));
      dyn.glowIntensity = lerp(dyn.glowIntensity, targetGlow, Math.min(1.0, dt * 6.0));
      dyn.deformation = lerp(dyn.deformation, targetDeform, Math.min(1.0, dt * 6.0));

      const orbRadius = baseRadius * dyn.scale;

      // Clear Canvas
      ctx.clearRect(0, 0, size, size);

      // ─────────────────────────────────────────────────────────────────────
      // LAYER 1 — AMBIENT ENERGY FIELD (Large soft radial glow, breathing)
      // ─────────────────────────────────────────────────────────────────────
      const ambientGlowRadius = orbRadius * (1.85 + breath * 0.15 + audio.activeLevel * 0.35);
      const ambientGrad = ctx.createRadialGradient(cx, cy, orbRadius * 0.3, cx, cy, ambientGlowRadius);

      const baseGlowAlpha = (0.28 + audio.activeLevel * 0.28) * dyn.glowIntensity;
      ambientGrad.addColorStop(0, rgbStr(currPal.glow, baseGlowAlpha * 0.8));
      ambientGrad.addColorStop(0.35, rgbStr(currPal.secondary, baseGlowAlpha * 0.4));
      ambientGrad.addColorStop(0.7, rgbStr(currPal.tertiary, baseGlowAlpha * 0.15));
      ambientGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = ambientGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, ambientGlowRadius, 0, Math.PI * 2);
      ctx.fill();

      // ─────────────────────────────────────────────────────────────────────
      // LAYER 2 — ORGANIC ENERGY AURA (Secondary harmonic energy field)
      // ─────────────────────────────────────────────────────────────────────
      const AURA_POINTS = 48;
      const auraCoords: { x: number; y: number }[] = [];
      const auraBase = orbRadius * 1.14;

      for (let i = 0; i < AURA_POINTS; i++) {
        const angle = (i / AURA_POINTS) * Math.PI * 2;
        const harm1 = Math.sin(angle * 3 + time * 1.8) * (4.5 * dyn.deformation);
        const harm2 = Math.cos(angle * 2 - time * 1.3) * (3.5 * dyn.deformation);
        const audioDisplace = audio.activeLevel * 8 * Math.sin(angle * 4 + time * 2.5);
        const r = auraBase + harm1 + harm2 + audioDisplace;
        auraCoords.push({
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r,
        });
      }

      ctx.save();
      ctx.beginPath();
      const auraMid0 = {
        x: (auraCoords[0].x + auraCoords[1].x) / 2,
        y: (auraCoords[0].y + auraCoords[1].y) / 2,
      };
      ctx.moveTo(auraMid0.x, auraMid0.y);
      for (let i = 1; i < AURA_POINTS; i++) {
        const next = (i + 1) % AURA_POINTS;
        const midX = (auraCoords[i].x + auraCoords[next].x) / 2;
        const midY = (auraCoords[i].y + auraCoords[next].y) / 2;
        ctx.quadraticCurveTo(auraCoords[i].x, auraCoords[i].y, midX, midY);
      }
      ctx.quadraticCurveTo(auraCoords[0].x, auraCoords[0].y, auraMid0.x, auraMid0.y);
      ctx.closePath();

      ctx.strokeStyle = rgbStr(currPal.secondary, 0.22 + audio.activeLevel * 0.25);
      ctx.lineWidth = 2.0;
      ctx.stroke();
      ctx.restore();

      // ─────────────────────────────────────────────────────────────────────
      // LAYER 3 — FLUID ORB PERIMETER (64 points, harmonic deformation, smooth curves)
      // ─────────────────────────────────────────────────────────────────────
      const NUM_POINTS = 64;
      const perimeterPoints: { x: number; y: number }[] = [];

      const speedA = 1.4 * currPal.speed;
      const speedB = 1.8 * currPal.speed;
      const amplitudeA = 6.0 * dyn.deformation;
      const amplitudeB = 4.5 * dyn.deformation;

      for (let i = 0; i < NUM_POINTS; i++) {
        const angle = (i / NUM_POINTS) * Math.PI * 2;

        // Mathematical harmonic deformation as specified
        const harmA = Math.sin(angle * 3.0 + time * speedA) * amplitudeA;
        const harmB = Math.cos(angle * 4.0 - time * speedB) * amplitudeB;

        // Real frequency response if available, or direct audio level modulation
        let freqResponse = 0;
        if (freqArray && freqArray.length > 0) {
          const binIdx = Math.floor((i / NUM_POINTS) * Math.min(freqArray.length, 32));
          freqResponse = (freqArray[binIdx] / 255) * 14 * dyn.deformation;
        } else {
          freqResponse = audio.activeLevel * 9 * Math.sin(angle * 5 + time * 3.0);
        }

        // Interruption jitter wave
        const interruptDisplace = dyn.interruptedAlpha * 8 * Math.sin(angle * 12 + time * 20);

        const r = orbRadius + harmA + harmB + freqResponse + interruptDisplace;
        perimeterPoints.push({
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r,
        });
      }

      // Smooth organic shape path using quadratic curve midpoint smoothing
      ctx.save();
      ctx.beginPath();
      const firstMid = {
        x: (perimeterPoints[0].x + perimeterPoints[1].x) / 2,
        y: (perimeterPoints[0].y + perimeterPoints[1].y) / 2,
      };
      ctx.moveTo(firstMid.x, firstMid.y);

      for (let i = 1; i < NUM_POINTS; i++) {
        const next = (i + 1) % NUM_POINTS;
        const midX = (perimeterPoints[i].x + perimeterPoints[next].x) / 2;
        const midY = (perimeterPoints[i].y + perimeterPoints[next].y) / 2;
        ctx.quadraticCurveTo(perimeterPoints[i].x, perimeterPoints[i].y, midX, midY);
      }
      ctx.quadraticCurveTo(perimeterPoints[0].x, perimeterPoints[0].y, firstMid.x, firstMid.y);
      ctx.closePath();

      // Clip inside perimeter to contain internal fluid energy
      ctx.save();
      ctx.clip();

      // Core Gradient fill
      const coreGrad = ctx.createRadialGradient(
        cx - orbRadius * 0.18,
        cy - orbRadius * 0.22,
        orbRadius * 0.05,
        cx,
        cy,
        orbRadius * 1.05
      );

      coreGrad.addColorStop(0, rgbStr(currPal.core, 0.98));
      coreGrad.addColorStop(0.28, rgbStr(currPal.primary, 0.92));
      coreGrad.addColorStop(0.65, rgbStr(currPal.secondary, 0.88));
      coreGrad.addColorStop(0.92, rgbStr(currPal.tertiary, 0.92));
      coreGrad.addColorStop(1, rgbStr({ r: 15, g: 23, b: 42 }, 0.95)); // Deep slate rim

      ctx.fillStyle = coreGrad;
      ctx.fill();

      // ─────────────────────────────────────────────────────────────────────
      // LAYER 4 — INTERNAL ENERGY (Living digital consciousness, light currents)
      // ─────────────────────────────────────────────────────────────────────
      // Internal flowing wave ribbon 1
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const waveGrad1 = ctx.createLinearGradient(
        cx - orbRadius,
        cy - orbRadius,
        cx + orbRadius,
        cy + orbRadius
      );
      waveGrad1.addColorStop(0, 'transparent');
      waveGrad1.addColorStop(0.5, rgbStr(currPal.primary, 0.35 + audio.activeLevel * 0.3));
      waveGrad1.addColorStop(1, 'transparent');

      ctx.fillStyle = waveGrad1;
      ctx.beginPath();
      const waveOffset1 = Math.sin(time * 1.5) * (orbRadius * 0.3);
      ctx.arc(cx, cy + waveOffset1, orbRadius * 0.72, 0, Math.PI * 2);
      ctx.fill();

      // Internal luminous vortex ribbon 2
      const waveOffset2 = Math.cos(time * 1.8) * (orbRadius * 0.25);
      const waveGrad2 = ctx.createRadialGradient(
        cx + waveOffset2,
        cy - waveOffset2,
        orbRadius * 0.1,
        cx,
        cy,
        orbRadius * 0.85
      );
      waveGrad2.addColorStop(0, rgbStr(currPal.core, 0.45 + audio.activeLevel * 0.35));
      waveGrad2.addColorStop(0.6, rgbStr(currPal.secondary, 0.25));
      waveGrad2.addColorStop(1, 'transparent');

      ctx.fillStyle = waveGrad2;
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius * 0.85, 0, Math.PI * 2);
      ctx.fill();

      // Internal soft consciousness particles
      for (const pt of particlesRef.current) {
        pt.angle += pt.speed * (1 + audio.activeLevel * 1.5);
        const curDist = orbRadius * pt.dist * (0.92 + Math.sin(pt.phase + time * 2) * 0.08);
        const px = cx + Math.cos(pt.angle) * curDist;
        const py = cy + Math.sin(pt.angle) * curDist;

        const color = pt.colorType === 'core' ? currPal.core : pt.colorType === 'primary' ? currPal.primary : currPal.secondary;
        ctx.fillStyle = rgbStr(color, pt.alpha * (0.8 + audio.activeLevel * 0.4));
        ctx.beginPath();
        ctx.arc(px, py, pt.radius * (1 + audio.activeLevel * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }

      // Memory saving crystalline convergence pulse
      if (dyn.memoryPulse > 0.02) {
        ctx.fillStyle = `rgba(16, 185, 129, ${dyn.memoryPulse * 0.45})`;
        ctx.beginPath();
        ctx.arc(cx, cy, orbRadius * (1 - dyn.memoryPulse * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore(); // Exit lighter mode

      // ─────────────────────────────────────────────────────────────────────
      // LAYER 5 — SPECULAR HIGHLIGHT (Three-dimensional volume, glass depth)
      // ─────────────────────────────────────────────────────────────────────
      // Primary off-center specular light (top-left)
      const specX = cx - orbRadius * 0.28;
      const specY = cy - orbRadius * 0.32;
      const specRadius = orbRadius * 0.58;

      const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, specRadius);
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
      specGrad.addColorStop(0.32, 'rgba(255, 255, 255, 0.22)');
      specGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
      specGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.arc(specX, specY, specRadius, 0, Math.PI * 2);
      ctx.fill();

      // Subtle bottom-right counter-reflection
      const rimX = cx + orbRadius * 0.32;
      const rimY = cy + orbRadius * 0.35;
      const rimGrad = ctx.createRadialGradient(rimX, rimY, 0, rimX, rimY, orbRadius * 0.45);
      rimGrad.addColorStop(0, rgbStr(currPal.tertiary, 0.3));
      rimGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(rimX, rimY, orbRadius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // Exit perimeter clipping

      // Perimeter fluid stroke
      ctx.strokeStyle = rgbStr(currPal.primary, 0.45 + audio.activeLevel * 0.45);
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.restore(); // Restore base transform

      // ─────────────────────────────────────────────────────────────────────
      // LAYER 6 — SUBTLE ENERGY PARTICLES & INTERACTION RIPPLES
      // ─────────────────────────────────────────────────────────────────────
      if (ripplesRef.current.length > 0) {
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          const r = ripplesRef.current[i];
          r.radius += r.speed;
          r.alpha *= 0.94;

          if (r.alpha <= 0.02 || r.radius >= r.maxRadius) {
            ripplesRef.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.strokeStyle = rgbStr(r.color, r.alpha);
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.arc(cx, cy, r.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Connecting spinner halo (subtle orbital dots)
      if (p.status === 'connecting' || p.status === 'reconnecting') {
        const orbitDots = 8;
        const orbitR = orbRadius * 1.32;
        ctx.save();
        for (let i = 0; i < orbitDots; i++) {
          const angle = (i / orbitDots) * Math.PI * 2 + time * 2.2;
          const dx = cx + Math.cos(angle) * orbitR;
          const dy = cy + Math.sin(angle) * orbitR;
          ctx.fillStyle = rgbStr(currPal.primary, (i / orbitDots) * 0.8);
          ctx.beginPath();
          ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Next frame
      animFrameRef.current = requestAnimationFrame(render);
    };

    // Start single loop
    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      resizeObserver.disconnect();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []); // Mounted once: NEVER torn down by audio/emotion updates

  const handleOrbClick = () => {
    const pal = currentPaletteRef.current;
    const baseR = dynamicStateRef.current.baseRadius || 110;
    ripplesRef.current.push({
      radius: baseR * 0.9,
      maxRadius: baseR * 1.75,
      speed: 4.0,
      alpha: 0.85,
      color: pal.primary,
    });
    onOrbClick?.();
  };

  return (
    <div
      ref={containerRef}
      id="myraa-advanced-orb-container"
      className={`relative w-full aspect-square flex items-center justify-center cursor-pointer select-none mx-auto touch-manipulation transition-transform duration-300 ${
        isHovered ? 'scale-[1.02]' : 'scale-100'
      } max-w-[290px] xs:max-w-[310px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[440px] ${className}`}
      onClick={handleOrbClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label="MYRAA Living Presence - Tap to talk"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOrbClick();
        }
      }}
    >
      <canvas
        ref={canvasRef}
        id="myraa-orb-canvas"
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
};
