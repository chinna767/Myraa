import React, { useEffect, useRef } from 'react';
import { ConnectionStatus, EmotionBlend, EmotionState } from '../types';

interface MyraaAtmosphericBackgroundProps {
  status: ConnectionStatus;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking?: boolean;
  inputVolume: number;
  outputVolume: number;
  dominantEmotion: string;
  emotionBlend?: EmotionBlend;
  emotionState?: EmotionState;
}

interface DustMote {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  vx: number;
  vy: number;
  phase: number;
  phaseSpeed: number;
}

interface ColorRGB {
  r: number;
  g: number;
  b: number;
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

export const MyraaAtmosphericBackground: React.FC<MyraaAtmosphericBackgroundProps> = ({
  status,
  isListening,
  isSpeaking,
  isThinking = false,
  inputVolume,
  outputVolume,
  dominantEmotion,
  emotionBlend,
  emotionState,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Performance architecture: Keep latest props in a ref so requestAnimationFrame never restarts
  const propsRef = useRef({
    status,
    isListening,
    isSpeaking,
    isThinking,
    inputVolume,
    outputVolume,
    dominantEmotion,
    emotionBlend,
    emotionState,
  });

  propsRef.current = {
    status,
    isListening,
    isSpeaking,
    isThinking,
    inputVolume,
    outputVolume,
    dominantEmotion,
    emotionBlend,
    emotionState,
  };

  const smoothStateRef = useRef({
    audioLevel: 0,
    tintR: 168,
    tintG: 85,
    tintB: 247, // Default purple
    secondR: 244,
    secondG: 114,
    secondB: 182, // Soft pink
    thirdR: 79,
    thirdG: 70,
    thirdB: 229, // Indigo
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Subtle drifting background atmospheric motes (28 motes)
    const moteCount = 28;
    const motes: DustMote[] = [];
    for (let i = 0; i < moteCount; i++) {
      motes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: 0.8 + Math.random() * 1.6,
        baseAlpha: 0.05 + Math.random() * 0.12,
        alpha: 0.08,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14 - 0.03,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.006 + Math.random() * 0.012,
      });
    }

    const startTime = performance.now();
    let lastFrameTime = startTime;

    const render = (now: number) => {
      if (!isRunning) return;

      const dt = Math.min((now - lastFrameTime) * 0.001, 0.08);
      lastFrameTime = now;
      const time = (now - startTime) * 0.001;

      const p = propsRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Audio smoothing
      const rawActive = p.isSpeaking
        ? Math.min(1.0, p.outputVolume * 1.5)
        : p.isListening
        ? Math.min(1.0, p.inputVolume * 1.4)
        : 0;

      const s = smoothStateRef.current;
      s.audioLevel = lerp(s.audioLevel, rawActive, Math.min(1.0, dt * 8.0));

      // Emotion palette targeting
      const dom = (p.dominantEmotion || 'affection').toLowerCase();
      let targetTop: ColorRGB = { r: 147, g: 51, b: 234 };    // Purple
      let targetLeft: ColorRGB = { r: 244, g: 114, b: 182 };  // Soft Pink
      let targetRight: ColorRGB = { r: 67, g: 56, b: 202 };   // Indigo

      if (dom.includes('happy') || dom.includes('cheer')) {
        targetTop = { r: 217, g: 119, b: 6 };     // Warm Amber/Gold
        targetLeft = { r: 244, g: 114, b: 182 };  // Warm Pink
        targetRight = { r: 147, g: 51, b: 234 };  // Violet
      } else if (dom.includes('curious') || dom.includes('inquisitive')) {
        targetTop = { r: 6, g: 182, b: 212 };     // Cyan
        targetLeft = { r: 59, g: 130, b: 246 };   // Blue
        targetRight = { r: 124, g: 58, b: 237 };  // Violet
      } else if (dom.includes('excite')) {
        targetTop = { r: 236, g: 72, b: 153 };    // Magenta
        targetLeft = { r: 168, g: 85, b: 247 };   // Purple
        targetRight = { r: 14, g: 165, b: 233 };  // Sky
      } else if (dom.includes('concern')) {
        targetTop = { r: 180, g: 83, b: 9 };      // Muted Amber
        targetLeft = { r: 109, g: 40, b: 217 };   // Deep Violet
        targetRight = { r: 30, g: 58, b: 138 };   // Deep Blue
      } else if (dom.includes('confidence')) {
        targetTop = { r: 37, g: 99, b: 235 };     // Royal Blue
        targetLeft = { r: 79, g: 70, b: 229 };    // Indigo
        targetRight = { r: 6, g: 182, b: 212 };   // Cool Cyan
      } else if (dom.includes('empath')) {
        targetTop = { r: 168, g: 85, b: 247 };    // Lavender
        targetLeft = { r: 96, g: 165, b: 250 };   // Soft Blue
        targetRight = { r: 244, g: 114, b: 182 }; // Rose
      }

      // Smooth color lerp
      const cRate = Math.min(1.0, dt * 2.5);
      const topCol = lerpRGB({ r: s.tintR, g: s.tintG, b: s.tintB }, targetTop, cRate);
      s.tintR = topCol.r; s.tintG = topCol.g; s.tintB = topCol.b;

      const leftCol = lerpRGB({ r: s.secondR, g: s.secondG, b: s.secondB }, targetLeft, cRate);
      s.secondR = leftCol.r; s.secondG = leftCol.g; s.secondB = leftCol.b;

      const rightCol = lerpRGB({ r: s.thirdR, g: s.thirdG, b: s.thirdB }, targetRight, cRate);
      s.thirdR = rightCol.r; s.thirdG = rightCol.g; s.thirdB = rightCol.b;

      // ─────────────────────────────────────────────────────────────────
      // RENDER BASE: Deep Slate #020617
      // ─────────────────────────────────────────────────────────────────
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Breath modulation
      const breath = Math.sin(time * 0.8) * 0.03;
      const audioBoost = s.audioLevel * 0.08;

      // ─────────────────────────────────────────────────────────────────
      // 1. TOP CENTER: Purple atmospheric glow
      // ─────────────────────────────────────────────────────────────────
      const topX = width * 0.5;
      const topY = height * 0.15;
      const topRadius = Math.max(width, height) * 0.55;
      const topGrad = ctx.createRadialGradient(topX, topY, 0, topX, topY, topRadius);
      const topAlpha = (0.16 + breath + audioBoost);
      topGrad.addColorStop(0, `rgba(${s.tintR}, ${s.tintG}, ${s.tintB}, ${topAlpha.toFixed(3)})`);
      topGrad.addColorStop(0.5, `rgba(${s.tintR}, ${s.tintG}, ${s.tintB}, ${(topAlpha * 0.35).toFixed(3)})`);
      topGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = topGrad;
      ctx.beginPath();
      ctx.arc(topX, topY, topRadius, 0, Math.PI * 2);
      ctx.fill();

      // ─────────────────────────────────────────────────────────────────
      // 2. LEFT AREA: Soft pink glow
      // ─────────────────────────────────────────────────────────────────
      const leftX = width * 0.12;
      const leftY = height * 0.5;
      const leftRadius = Math.max(width, height) * 0.45;
      const leftGrad = ctx.createRadialGradient(leftX, leftY, 0, leftX, leftY, leftRadius);
      const leftAlpha = (0.12 + breath * 0.6 + audioBoost * 0.6);
      leftGrad.addColorStop(0, `rgba(${s.secondR}, ${s.secondG}, ${s.secondB}, ${leftAlpha.toFixed(3)})`);
      leftGrad.addColorStop(0.55, `rgba(${s.secondR}, ${s.secondG}, ${s.secondB}, ${(leftAlpha * 0.25).toFixed(3)})`);
      leftGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = leftGrad;
      ctx.beginPath();
      ctx.arc(leftX, leftY, leftRadius, 0, Math.PI * 2);
      ctx.fill();

      // ─────────────────────────────────────────────────────────────────
      // 3. BOTTOM RIGHT: Indigo glow
      // ─────────────────────────────────────────────────────────────────
      const rightX = width * 0.88;
      const rightY = height * 0.78;
      const rightRadius = Math.max(width, height) * 0.5;
      const rightGrad = ctx.createRadialGradient(rightX, rightY, 0, rightX, rightY, rightRadius);
      const rightAlpha = (0.14 + breath * 0.8 + audioBoost * 0.8);
      rightGrad.addColorStop(0, `rgba(${s.thirdR}, ${s.thirdG}, ${s.thirdB}, ${rightAlpha.toFixed(3)})`);
      rightGrad.addColorStop(0.5, `rgba(${s.thirdR}, ${s.thirdG}, ${s.thirdB}, ${(rightAlpha * 0.3).toFixed(3)})`);
      rightGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = rightGrad;
      ctx.beginPath();
      ctx.arc(rightX, rightY, rightRadius, 0, Math.PI * 2);
      ctx.fill();

      // ─────────────────────────────────────────────────────────────────
      // 4. SUBTLE RADIAL DOT MATRIX (10-15% opacity, very clean)
      // ─────────────────────────────────────────────────────────────────
      const dotSpacing = 32;
      const cols = Math.floor(width / dotSpacing);
      const rows = Math.floor(height / dotSpacing);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.04)'; // Extremely faint slate dots
      for (let r = 0; r < rows; r += 2) {
        for (let c = 0; c < cols; c += 2) {
          ctx.beginPath();
          ctx.arc(c * dotSpacing + dotSpacing, r * dotSpacing + dotSpacing, 0.85, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ─────────────────────────────────────────────────────────────────
      // 5. FLOATING AMBIENT MOTES (Ethereal drifting dust)
      // ─────────────────────────────────────────────────────────────────
      for (let i = 0; i < moteCount; i++) {
        const m = motes[i];
        m.phase += m.phaseSpeed;
        m.x += m.vx;
        m.y += m.vy;

        if (m.x < 0) m.x = width;
        if (m.x > width) m.x = 0;
        if (m.y < 0) m.y = height;
        if (m.y > height) m.y = 0;

        m.alpha = m.baseAlpha * (0.6 + Math.sin(m.phase) * 0.4);

        ctx.fillStyle = `rgba(${s.secondR}, ${s.secondG}, ${s.secondB}, ${m.alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []); // Mounted once: NEVER torn down by audio/volume updates

  return (
    <canvas
      ref={canvasRef}
      id="myraa-atmospheric-canvas"
      className="fixed inset-0 pointer-events-none z-0 w-full h-full block"
    />
  );
};
