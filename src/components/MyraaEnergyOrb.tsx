import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ConnectionStatus, EmotionBlend, EmotionState } from '../types';
import { noise2D } from '../utils/proceduralNoise';

interface MyraaEnergyOrbProps {
  status: ConnectionStatus;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking?: boolean;
  inputVolume: number;
  outputVolume: number;
  dominantEmotion: string;
  emotionBlend?: EmotionBlend;
  emotionState?: EmotionState;
  onOrbClick?: () => void;
  onOpenSettings?: () => void;
}

// Layer 2: Flowing Orbiting Energy Trail Structure
interface EnergyTrail {
  baseRadiusX: number;
  baseRadiusY: number;
  angle: number;
  speed: number;
  tiltAngle: number; // inclination in radians
  length: number; // arc length
  width: number;
  alpha: number;
  baseAlpha: number;
  colorType: 'violet' | 'blue' | 'magenta' | 'white';
  zDepth: number;
}

// Layer 9: Dynamic Energy Wave Structure
interface EnergyWave {
  radius: number;
  maxRadius: number;
  speed: number;
  alpha: number;
  color: string;
}

export const MyraaEnergyOrb: React.FC<MyraaEnergyOrbProps> = ({
  status,
  isListening,
  isSpeaking,
  isThinking = false,
  inputVolume,
  outputVolume,
  dominantEmotion,
  emotionBlend,
  onOrbClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Filtered audio levels (smooth exponential falloff)
  const smoothedOutputRef = useRef<number>(0);
  const smoothedInputRef = useRef<number>(0);

  // Visual Inertia Tracking (prevents jarring jumps)
  const visualInertiaRef = useRef({
    activity: 1.0,
    speed: 1.0,
    focus: 0.0,
    pulseIntensity: 1.0,
    fluidTurbulence: 1.0,
    trailSpeed: 1.0,
    pinkIntensity: 0.8,
    ringGlow: 1.0,
  });

  const wavesRef = useRef<EnergyWave[]>([]);
  const lastStateRef = useRef<string>(status);
  const lastPeakTimeRef = useRef<number>(0);
  const [, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina-sharp rendering capped at 2.0 for buttery 60fps on mobile
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth || 380;
    const height = canvas.clientHeight || 380;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = width / 2;
    const centerY = height / 2;
    const baseOrbRadius = Math.min(width, height) * 0.28;

    // --- INITIALIZE LAYER 2: ORBITING ENERGY TRAILS ---
    const trailCount = 10;
    const trails: EnergyTrail[] = [];
    const colorTypes: Array<'violet' | 'blue' | 'magenta' | 'white'> = [
      'violet',
      'blue',
      'magenta',
      'white',
      'violet',
      'magenta',
      'blue',
      'white',
      'violet',
      'magenta',
    ];

    for (let i = 0; i < trailCount; i++) {
      const isClockwise = i % 2 === 0;
      const rx = baseOrbRadius * (1.12 + (i % 4) * 0.14);
      const ry = rx * (0.45 + (i % 3) * 0.15);
      trails.push({
        baseRadiusX: rx,
        baseRadiusY: ry,
        angle: (i / trailCount) * Math.PI * 2,
        speed: (0.008 + (i % 5) * 0.004) * (isClockwise ? 1 : -1),
        tiltAngle: ((i * 35) % 180) * (Math.PI / 180),
        length: 1.2 + Math.random() * 0.9,
        width: 1.4 + (i % 3) * 0.8,
        baseAlpha: 0.45 + (i % 3) * 0.25,
        alpha: 0.5,
        colorType: colorTypes[i],
        zDepth: Math.sin((i / trailCount) * Math.PI * 2),
      });
    }

    const triggerWave = (intensity = 1.0, color = 'rgba(236, 72, 153, 0.6)') => {
      wavesRef.current.push({
        radius: baseOrbRadius * 0.35,
        maxRadius: baseOrbRadius * 1.55,
        speed: (2.2 + intensity * 1.5) * dpr,
        alpha: 0.65 * intensity,
        color,
      });
      if (wavesRef.current.length > 4) {
        wavesRef.current.shift();
      }
    };

    const startTime = performance.now();
    let lastFrameTime = startTime;

    const render = (now: number) => {
      const dt = Math.min((now - lastFrameTime) * 0.001, 0.1);
      lastFrameTime = now;
      const time = (now - startTime) * 0.001;

      // 1. Audio amplitude smoothing
      const targetOut = isSpeaking ? Math.min(1.4, outputVolume * 1.8) : 0;
      const targetIn = isListening && !isSpeaking ? Math.min(1.2, inputVolume * 1.5) : 0;
      smoothedOutputRef.current += (targetOut - smoothedOutputRef.current) * 0.18;
      smoothedInputRef.current += (targetIn - smoothedInputRef.current) * 0.18;
      const outAmp = smoothedOutputRef.current;
      const inAmp = smoothedInputRef.current;
      const totalAmp = Math.max(outAmp, inAmp);

      if (lastStateRef.current !== status) {
        triggerWave(1.1, status === 'connected' ? 'rgba(236, 72, 153, 0.7)' : 'rgba(168, 85, 247, 0.7)');
        lastStateRef.current = status;
      }

      if (outAmp > 0.6 && now - lastPeakTimeRef.current > 700) {
        triggerWave(0.85 + outAmp * 0.3, 'rgba(255, 255, 255, 0.8)');
        lastPeakTimeRef.current = now;
      }

      let targetSpeed = 1.0;
      let targetPulse = 1.0;
      let targetTurbulence = 1.0;
      let targetPink = 0.8;
      let targetFocus = 0.0;
      let targetRingGlow = 1.0;

      const dom = dominantEmotion.toLowerCase();
      if (dom.includes('happy') || dom.includes('playful')) {
        targetSpeed = 1.15;
        targetPulse = 1.25;
        targetPink = 1.1;
        targetRingGlow = 1.2;
      } else if (dom.includes('excit') || dom.includes('energy')) {
        targetSpeed = 1.35;
        targetPulse = 1.45;
        targetTurbulence = 1.4;
        targetPink = 1.25;
      } else if (dom.includes('curio')) {
        targetSpeed = 1.12;
        targetTurbulence = 1.2;
        targetFocus = 0.3;
      } else if (dom.includes('affect') || dom.includes('shy')) {
        targetSpeed = 0.88;
        targetPink = 1.3;
        targetPulse = 1.1;
      } else if (dom.includes('concern')) {
        targetSpeed = 0.85;
        targetFocus = 0.5;
        targetTurbulence = 0.75;
      } else if (dom.includes('calm') || dom.includes('empath')) {
        targetSpeed = 0.8;
        targetPulse = 0.85;
        targetTurbulence = 0.7;
      } else if (dom.includes('confidence')) {
        targetSpeed = 1.0;
        targetRingGlow = 1.3;
      }

      if (isThinking || status === 'connecting' || status === 'reconnecting') {
        targetSpeed = 1.45;
        targetTurbulence = 1.6;
        targetPulse = 1.35;
        targetFocus = 0.4;
      } else if (isListening) {
        targetFocus = 0.6;
        targetRingGlow = 1.3;
        targetSpeed = 1.05;
      } else if (isSpeaking) {
        targetPulse = 1.5;
        targetSpeed = 1.2;
        targetRingGlow = 1.4;
      }

      const vi = visualInertiaRef.current;
      const factor = Math.min(1.0, dt * 3.0);
      vi.speed += (targetSpeed - vi.speed) * factor;
      vi.pulseIntensity += (targetPulse - vi.pulseIntensity) * factor;
      vi.fluidTurbulence += (targetTurbulence - vi.fluidTurbulence) * factor;
      vi.pinkIntensity += (targetPink - vi.pinkIntensity) * factor;
      vi.focus += (targetFocus - vi.focus) * factor;
      vi.ringGlow += (targetRingGlow - vi.ringGlow) * factor;

      const auraBreath = (Math.sin(time * 1.15) + 1) * 0.5;
      const bodyBreath = (Math.sin(time * 1.5) + 1) * 0.5;
      const coreBreath = (Math.sin(time * 1.95) + 1) * 0.5;

      const dynamicOrbRadius =
        baseOrbRadius *
        (1.0 + bodyBreath * 0.05 * vi.pulseIntensity + outAmp * 0.28 + inAmp * 0.12 - vi.focus * 0.04);

      ctx.clearRect(0, 0, width, height);

      // LAYER 1: OUTER AURA
      const auraMaxRadius = dynamicOrbRadius * (1.65 + auraBreath * 0.2 + outAmp * 0.35);
      const auraGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        dynamicOrbRadius * 0.6,
        centerX,
        centerY,
        auraMaxRadius
      );
      auraGradient.addColorStop(0, 'rgba(147, 51, 234, 0.35)');
      auraGradient.addColorStop(0.35, 'rgba(124, 58, 237, 0.22)');
      auraGradient.addColorStop(0.65, 'rgba(56, 189, 248, 0.14)');
      auraGradient.addColorStop(0.9, 'rgba(76, 29, 149, 0.06)');
      auraGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, auraMaxRadius, 0, Math.PI * 2);
      ctx.fill();

      // LAYER 2: ORBITING ENERGY TRAILS
      const renderTrails = (isForeground: boolean) => {
        ctx.save();
        for (let i = 0; i < trailCount; i++) {
          const trail = trails[i];
          trail.angle += trail.speed * vi.speed * (1 + totalAmp * 1.1);
          const currentZ = Math.sin(trail.angle);
          const belongsToGroup = isForeground ? currentZ >= 0 : currentZ < 0;
          if (!belongsToGroup) continue;

          const tiltCos = Math.cos(trail.tiltAngle);
          const tiltSin = Math.sin(trail.tiltAngle);
          const rx = trail.baseRadiusX * (1 + bodyBreath * 0.04 + outAmp * 0.15);
          const ry = trail.baseRadiusY * (1 + bodyBreath * 0.04 + outAmp * 0.15);

          const arcSegments = 24;
          const arcStep = trail.length / arcSegments;
          const points: { x: number; y: number }[] = [];

          for (let s = 0; s <= arcSegments; s++) {
            const a = trail.angle - s * arcStep;
            const wave = noise2D(Math.cos(a) * 2, Math.sin(a) * 2 + time * 0.6) * 5 * vi.fluidTurbulence;
            const pxRaw = Math.cos(a) * (rx + wave);
            const pyRaw = Math.sin(a) * (ry + wave);
            const px = centerX + pxRaw * tiltCos - pyRaw * tiltSin;
            const py = centerY + pxRaw * tiltSin + pyRaw * tiltCos;
            points.push({ x: px, y: py });
          }

          if (points.length > 1) {
            const head = points[0];
            const tail = points[points.length - 1];
            const grad = ctx.createLinearGradient(head.x, head.y, tail.x, tail.y);
            let mainCol = '236, 72, 153';
            if (trail.colorType === 'violet') mainCol = '168, 85, 247';
            else if (trail.colorType === 'blue') mainCol = '56, 189, 248';
            else if (trail.colorType === 'white') mainCol = '255, 255, 255';

            const alphaMultiplier = (isForeground ? 0.85 : 0.45) * trail.baseAlpha * (0.8 + totalAmp * 0.4);
            grad.addColorStop(0, `rgba(${mainCol}, ${alphaMultiplier})`);
            grad.addColorStop(0.5, `rgba(${mainCol}, ${alphaMultiplier * 0.5})`);
            grad.addColorStop(1, `rgba(${mainCol}, 0)`);

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let p = 1; p < points.length; p++) {
              ctx.lineTo(points[p].x, points[p].y);
            }
            ctx.strokeStyle = grad;
            ctx.lineWidth = trail.width * (isForeground ? 1.4 : 0.9);
            ctx.lineCap = 'round';
            ctx.shadowColor = `rgba(${mainCol}, 0.8)`;
            ctx.shadowBlur = isForeground ? 8 : 4;
            ctx.stroke();

            if (isForeground) {
              ctx.beginPath();
              ctx.arc(head.x, head.y, trail.width * 1.1, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = `rgba(${mainCol}, 1)`;
              ctx.shadowBlur = 10;
              ctx.fill();
            }
          }
        }
        ctx.restore();
      };

      renderTrails(false);

      // LAYER 4: TRANSPARENT ENERGY SHELL
      ctx.save();
      const shellGrad = ctx.createRadialGradient(
        centerX - dynamicOrbRadius * 0.35,
        centerY - dynamicOrbRadius * 0.35,
        dynamicOrbRadius * 0.1,
        centerX,
        centerY,
        dynamicOrbRadius
      );
      shellGrad.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
      shellGrad.addColorStop(0.4, 'rgba(109, 40, 217, 0.35)');
      shellGrad.addColorStop(0.75, 'rgba(30, 27, 75, 0.6)');
      shellGrad.addColorStop(0.95, 'rgba(56, 189, 248, 0.4)');
      shellGrad.addColorStop(1, 'rgba(236, 72, 153, 0.5)');
      ctx.fillStyle = shellGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, dynamicOrbRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // LAYER 5: FLUID INNER SURFACE
      ctx.save();
      const numFluidLayers = 3;
      const fluidConfigs = [
        {
          color: 'rgba(124, 58, 237, 0.75)',
          scale: 0.82,
          rotSpeed: 0.45,
          freq: 2.2,
          amp: 9,
        },
        {
          color: 'rgba(217, 70, 239, 0.65)',
          scale: 0.74,
          rotSpeed: -0.55,
          freq: 2.8,
          amp: 11,
        },
        {
          color: 'rgba(56, 189, 248, 0.55)',
          scale: 0.64,
          rotSpeed: 0.65,
          freq: 3.2,
          amp: 8,
        },
      ];

      for (let f = 0; f < numFluidLayers; f++) {
        const cfg = fluidConfigs[f];
        const rotAngle = time * cfg.rotSpeed * vi.speed;
        const currentFluidRadius = dynamicOrbRadius * cfg.scale;
        ctx.beginPath();
        const steps = 36;
        for (let s = 0; s <= steps; s++) {
          const theta = (s / steps) * Math.PI * 2;
          const noiseSample = noise2D(
            Math.cos(theta + rotAngle) * cfg.freq,
            Math.sin(theta + rotAngle) * cfg.freq + time * 0.4 * vi.fluidTurbulence
          );
          const harmonic = Math.sin((theta + rotAngle) * 3 + time * 1.8) * 3;
          const offset = (noiseSample * cfg.amp + harmonic) * vi.fluidTurbulence * (1 + totalAmp * 0.5);
          const r = currentFluidRadius + offset;
          const fx = centerX + Math.cos(theta) * r;
          const fy = centerY + Math.sin(theta) * r;
          if (s === 0) ctx.moveTo(fx, fy);
          else ctx.lineTo(fx, fy);
        }
        ctx.closePath();
        ctx.fillStyle = cfg.color;
        ctx.shadowColor = cfg.color;
        ctx.shadowBlur = 14;
        ctx.fill();
      }
      ctx.restore();

      // LAYER 6: INNER ENERGY CORE
      ctx.save();
      const coreRadius =
        dynamicOrbRadius *
        (0.42 + coreBreath * 0.08 * vi.pulseIntensity + outAmp * 0.25 + inAmp * 0.12);
      const coreGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        coreRadius
      );
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.22, 'rgba(253, 242, 248, 0.95)');
      coreGrad.addColorStop(0.48, `rgba(244, 114, 182, ${0.9 * vi.pinkIntensity})`);
      coreGrad.addColorStop(0.75, 'rgba(217, 70, 239, 0.7)');
      coreGrad.addColorStop(0.92, 'rgba(124, 58, 237, 0.45)');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 24 + outAmp * 30 + inAmp * 15;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.max(2.8, 5.0 * (1 + outAmp * 0.5)), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // LAYER 9: CONCENTRIC DYNAMIC ENERGY WAVES
      if (wavesRef.current.length > 0) {
        ctx.save();
        for (let w = wavesRef.current.length - 1; w >= 0; w--) {
          const wave = wavesRef.current[w];
          wave.radius += wave.speed * vi.speed;
          wave.alpha *= 0.96;
          if (wave.radius > wave.maxRadius || wave.alpha < 0.02) {
            wavesRef.current.splice(w, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(centerX, centerY, wave.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(244, 114, 182, ${wave.alpha})`;
          ctx.lineWidth = 1.8 * (1 - wave.radius / wave.maxRadius);
          ctx.shadowColor = '#f472b6';
          ctx.shadowBlur = 8;
          ctx.stroke();
        }
        ctx.restore();
      }

      // LAYER 3: GLOWING OUTER RING
      ctx.save();
      const ringSteps = 64;
      const ringAngleOffset = time * 0.35 * vi.speed;
      ctx.beginPath();
      for (let r = 0; r <= ringSteps; r++) {
        const theta = (r / ringSteps) * Math.PI * 2;
        const wave1 = Math.sin(theta * 4 + ringAngleOffset * 2) * 2.2;
        const wave2 = noise2D(Math.cos(theta) * 2.5, Math.sin(theta) * 2.5 + time * 0.5) * 3.5;
        const rad = dynamicOrbRadius + (wave1 + wave2) * vi.fluidTurbulence;
        const rx = centerX + Math.cos(theta) * rad;
        const ry = centerY + Math.sin(theta) * rad;
        if (r === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 2.4 + outAmp * 1.5;
      ctx.shadowColor = isSpeaking ? '#ec4899' : '#8b5cf6';
      ctx.shadowBlur = (16 + outAmp * 24 + inAmp * 14) * vi.ringGlow;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.0;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();

      renderTrails(true);
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    status,
    isListening,
    isSpeaking,
    isThinking,
    dominantEmotion,
    emotionBlend,
    inputVolume,
    outputVolume,
  ]);

  const getStatusDisplay = () => {
    if (status === 'disconnected') {
      return {
        label: 'NEURAL LINK STANDBY',
        sub: 'Tap Orb to Connect',
        dotColor: 'bg-rose-500 shadow-rose-500/50',
      };
    }
    if (status === 'connecting') {
      return {
        label: 'SYNCHRONIZING...',
        sub: 'Establishing Gemini Live Channel',
        dotColor: 'bg-amber-400 animate-pulse shadow-amber-400/50',
      };
    }
    if (status === 'reconnecting') {
      return {
        label: 'RECONNECTING...',
        sub: 'Restoring Live Stream',
        dotColor: 'bg-amber-400 animate-pulse shadow-amber-400/50',
      };
    }
    if (status === 'standby') {
      return {
        label: 'STANDBY',
        sub: 'Say "Hey Myraa" or tap orb',
        dotColor: 'bg-indigo-400 shadow-indigo-400/50',
      };
    }
    if (isThinking) {
      return {
        label: 'THINKING...',
        sub: 'Processing Information',
        dotColor: 'bg-fuchsia-400 animate-pulse shadow-[0_0_12px_rgba(217,70,239,0.9)]',
      };
    }
    if (isSpeaking) {
      return {
        label: 'SPEAKING...',
        sub: 'Natural Voice Stream Active',
        dotColor: 'bg-pink-400 animate-pulse shadow-[0_0_12px_rgba(244,114,182,0.9)]',
      };
    }
    if (isListening && inputVolume > 0.05) {
      return {
        label: 'LISTENING TO CHINNA',
        sub: 'Receiving Voice',
        dotColor: 'bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.9)]',
      };
    }
    if (isListening) {
      return {
        label: 'LISTENING...',
        sub: 'Continuous Listening Active',
        dotColor: 'bg-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]',
      };
    }
    return {
      label: 'ONLINE',
      sub: 'Gemini Live Ready',
      dotColor: 'bg-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]',
    };
  };

  const currentStatus = getStatusDisplay();

  return (
    <div
      id="myraa-dynamic-energy-orb-container"
      className="relative flex flex-col items-center justify-center select-none"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onOrbClick}
        className="relative flex items-center justify-center cursor-pointer group"
        title="MYRAA - Living Dynamic Energy Orb - Tap to interact"
      >
        <div className="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full bg-violet-600/15 blur-3xl pointer-events-none transition-all duration-700 group-hover:bg-fuchsia-500/25" />
        <canvas
          ref={canvasRef}
          className="w-80 h-80 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] relative z-10 block"
        />
        <div className="absolute w-72 h-72 sm:w-84 sm:h-84 md:w-[380px] md:h-[380px] rounded-full border border-violet-500/15 pointer-events-none transition-all duration-500 group-hover:border-fuchsia-400/30" />
      </motion.div>

      <div className="flex flex-col items-center text-center mt-2 z-10 pointer-events-none">
        <h2 className="text-2xl sm:text-3xl font-light tracking-[0.32em] text-transparent bg-clip-text bg-gradient-to-r from-violet-100 via-pink-100 to-cyan-100 drop-shadow-[0_0_18px_rgba(168,85,247,0.6)] font-sans">
          MYRAA
        </h2>
        <div className="flex items-center gap-2 mt-2 px-3.5 py-1 rounded-full bg-black/60 border border-violet-500/25 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.15)]">
          <span className={`w-2 h-2 rounded-full ${currentStatus.dotColor}`} />
          <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-pink-100 uppercase font-mono">
            {currentStatus.label}
          </span>
          <span className="text-violet-500 text-[10px]">|</span>
          <span className="text-[10px] text-fuchsia-300/85 font-mono capitalize">
            {emotionBlend?.descriptor || dominantEmotion}
          </span>
        </div>
        <p className="text-[11px] text-violet-300/60 mt-1 font-mono tracking-wide">
          {currentStatus.sub}
        </p>
      </div>
    </div>
  );
};
