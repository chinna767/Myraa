import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ConnectionStatus, EmotionBlend, EmotionState } from '../types';
import { noise2D } from '../utils/proceduralNoise';

export interface MyraaEnergyRingProps {
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
}

interface OrbitalTrail {
  planeTilt: number; // inclination angle in radians
  planeRotation: number; // orbital orientation
  orbitRadiusRatio: number; // relative to ring radius
  orbitEccentricity: number; // y/x scale
  angle: number;
  speed: number;
  length: number; // arc in radians
  width: number;
  colorType: 'cyan' | 'violet' | 'white-blue' | 'azure';
  baseAlpha: number;
}

interface EnergyWave {
  radius: number;
  maxRadius: number;
  speed: number;
  alpha: number;
  color: string;
}

export const MyraaEnergyRing: React.FC<MyraaEnergyRingProps> = ({
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Smooth audio volume followers (exponential moving average)
  const smoothedOutputRef = useRef<number>(0);
  const smoothedInputRef = useRef<number>(0);

  // Visual inertia variables to smoothly interpolate state transitions
  const visualInertiaRef = useRef({
    scale: 1.0,
    brightness: 1.0,
    glowSize: 1.0,
    trailSpeedFactor: 1.0,
    ringWobble: 1.0,
    innerGlowAlpha: 0.25,
    hueShift: 0, // 0 = blue/violet, 30 = cyan, -30 = deep purple
  });

  const wavesRef = useRef<EnergyWave[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height) || 360;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Initialize 6 orbital light trails with distinct 3D orbital planes
    const trails: OrbitalTrail[] = [
      {
        planeTilt: 0.25,
        planeRotation: -0.3,
        orbitRadiusRatio: 1.08,
        orbitEccentricity: 0.88,
        angle: 0.4,
        speed: 0.014,
        length: 1.3,
        width: 2.2,
        colorType: 'cyan',
        baseAlpha: 0.75,
      },
      {
        planeTilt: -0.35,
        planeRotation: 0.5,
        orbitRadiusRatio: 1.14,
        orbitEccentricity: 0.82,
        angle: 2.2,
        speed: -0.011,
        length: 1.1,
        width: 1.8,
        colorType: 'violet',
        baseAlpha: 0.65,
      },
      {
        planeTilt: 0.12,
        planeRotation: 0.1,
        orbitRadiusRatio: 0.98,
        orbitEccentricity: 0.95,
        angle: 4.1,
        speed: 0.016,
        length: 1.5,
        width: 2.5,
        colorType: 'white-blue',
        baseAlpha: 0.85,
      },
      {
        planeTilt: -0.18,
        planeRotation: -0.6,
        orbitRadiusRatio: 1.22,
        orbitEccentricity: 0.76,
        angle: 1.1,
        speed: 0.009,
        length: 0.9,
        width: 1.5,
        colorType: 'azure',
        baseAlpha: 0.55,
      },
      {
        planeTilt: 0.42,
        planeRotation: 0.8,
        orbitRadiusRatio: 1.04,
        orbitEccentricity: 0.9,
        angle: 5.3,
        speed: -0.013,
        length: 1.2,
        width: 2.0,
        colorType: 'violet',
        baseAlpha: 0.7,
      },
      {
        planeTilt: -0.08,
        planeRotation: 0.2,
        orbitRadiusRatio: 1.18,
        orbitEccentricity: 0.85,
        angle: 3.5,
        speed: 0.012,
        length: 1.0,
        width: 1.6,
        colorType: 'cyan',
        baseAlpha: 0.6,
      },
    ];

    const startTime = performance.now();
    let lastFrameTime = startTime;

    const render = (now: number) => {
      if (!isRunning) return;
      const dt = Math.min((now - lastFrameTime) * 0.001, 0.1);
      lastFrameTime = now;
      const time = (now - startTime) * 0.001;

      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height) || 360;
      const cx = size / 2;
      const cy = size / 2;

      // Base radius of the circular energy ring (~31% of the canvas)
      const baseRadius = size * 0.31;

      // 1. Audio Smoothing
      const targetOut = isSpeaking ? Math.min(1.3, outputVolume * 1.6) : 0;
      const targetIn = isListening && !isSpeaking ? Math.min(1.1, inputVolume * 1.4) : 0;
      smoothedOutputRef.current += (targetOut - smoothedOutputRef.current) * 0.14;
      smoothedInputRef.current += (targetIn - smoothedInputRef.current) * 0.14;
      const outAmp = smoothedOutputRef.current;
      const inAmp = smoothedInputRef.current;
      const totalAmp = Math.max(outAmp, inAmp);

      // 2. State & Emotion Interpolation
      const vi = visualInertiaRef.current;

      // Target state properties
      let targetScale = 1.0;
      let targetBrightness = 1.0;
      let targetGlowSize = 1.0;
      let targetTrailSpeed = 1.0;
      let targetWobble = 1.0;
      let targetInnerGlow = 0.25;

      if (status === 'disconnected') {
        targetBrightness = 0.75;
        targetGlowSize = 0.8;
        targetTrailSpeed = 0.65;
        targetScale = 0.98;
      } else if (status === 'connecting' || status === 'reconnecting') {
        targetBrightness = 1.1;
        targetTrailSpeed = 1.35;
        targetGlowSize = 1.15;
      } else if (isThinking) {
        targetBrightness = 1.18;
        targetTrailSpeed = 1.8;
        targetGlowSize = 1.25;
        targetWobble = 1.3;
      } else if (isSpeaking) {
        targetScale = 1.02 + outAmp * 0.08;
        targetBrightness = 1.15 + outAmp * 0.35;
        targetGlowSize = 1.2 + outAmp * 0.5;
        targetTrailSpeed = 1.2 + outAmp * 0.4;
        targetWobble = 1.2 + outAmp * 0.6;
        targetInnerGlow = 0.35 + outAmp * 0.3;
      } else if (isListening) {
        targetScale = 1.04 + inAmp * 0.05;
        targetBrightness = 1.12 + inAmp * 0.25;
        targetGlowSize = 1.15 + inAmp * 0.35;
        targetTrailSpeed = 1.15;
        targetWobble = 1.1 + inAmp * 0.3;
        targetInnerGlow = 0.32;
      }

      // Emotional nuances from EmotionEngine
      const dom = dominantEmotion.toLowerCase();
      let primaryHue = 220; // Default deep blue / violet
      let secondaryHue = 265; // Violet

      if (dom.includes('calm')) {
        primaryHue = 225; // Deep serene blue
        secondaryHue = 210;
        targetTrailSpeed *= 0.85;
      } else if (dom.includes('happy')) {
        primaryHue = 195; // Bright azure
        secondaryHue = 280; // Radiant magenta/purple
        targetBrightness *= 1.08;
        targetTrailSpeed *= 1.15;
      } else if (dom.includes('curious')) {
        primaryHue = 180; // Pure cyan
        secondaryHue = 240; // Royal blue
        targetTrailSpeed *= 1.1;
      } else if (dom.includes('concern')) {
        primaryHue = 210;
        secondaryHue = 240;
        targetBrightness *= 0.9;
        targetGlowSize *= 0.9;
      } else if (dom.includes('affection')) {
        primaryHue = 245; // Soft violet
        secondaryHue = 200; // Warm cyan-blue
        targetInnerGlow *= 1.15;
      } else if (dom.includes('excitement')) {
        primaryHue = 190;
        secondaryHue = 290;
        targetTrailSpeed *= 1.3;
        targetBrightness *= 1.15;
      }

      // Smooth lerp
      vi.scale += (targetScale - vi.scale) * 0.08;
      vi.brightness += (targetBrightness - vi.brightness) * 0.08;
      vi.glowSize += (targetGlowSize - vi.glowSize) * 0.08;
      vi.trailSpeedFactor += (targetTrailSpeed - vi.trailSpeedFactor) * 0.08;
      vi.ringWobble += (targetWobble - vi.ringWobble) * 0.08;
      vi.innerGlowAlpha += (targetInnerGlow - vi.innerGlowAlpha) * 0.08;

      // Clear previous frame
      ctx.clearRect(0, 0, size, size);

      // Organic subtle breathing cycle (4.2 seconds period)
      const breathing = Math.sin(time * 1.5) * 0.02;
      const currentRadius = baseRadius * (vi.scale + breathing);

      // ==========================================
      // LAYER 1: SOFT ATMOSPHERIC OUTER GLOW
      // ==========================================
      ctx.save();
      const outerGlowRadius = currentRadius * (1.85 * vi.glowSize);
      const outerGrad = ctx.createRadialGradient(
        cx,
        cy,
        currentRadius * 0.65,
        cx,
        cy,
        outerGlowRadius
      );

      const glowAlpha = 0.28 * vi.brightness;
      outerGrad.addColorStop(0, 'rgba(5, 12, 34, 0)');
      outerGrad.addColorStop(0.35, `rgba(30, 27, 75, ${glowAlpha * 0.4})`);
      outerGrad.addColorStop(0.55, `rgba(79, 70, 229, ${glowAlpha * 0.6})`);
      outerGrad.addColorStop(0.72, `rgba(37, 99, 235, ${glowAlpha * 0.75})`);
      outerGrad.addColorStop(0.88, `rgba(6, 182, 212, ${glowAlpha * 0.4})`);
      outerGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');

      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, outerGlowRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ==========================================
      // LAYER 2: SUBTLE TRANSPARENT ENERGY FIELD
      // ==========================================
      ctx.save();
      const fieldPoints = 64;
      ctx.beginPath();
      for (let i = 0; i <= fieldPoints; i++) {
        const theta = (i / fieldPoints) * Math.PI * 2;
        // Harmonic noise undulating halo
        const wave1 = Math.sin(theta * 3 + time * 0.8) * (2.8 + totalAmp * 4);
        const wave2 = Math.cos(theta * 5 - time * 0.6) * 2.0;
        const n = noise2D(Math.cos(theta) * 1.4, Math.sin(theta) * 1.4 + time * 0.25) * 4.0;
        const r = currentRadius * 1.16 + (wave1 + wave2 + n) * vi.ringWobble;
        const px = cx + Math.cos(theta) * r;
        const py = cy + Math.sin(theta) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      const fieldGrad = ctx.createRadialGradient(
        cx,
        cy,
        currentRadius * 0.88,
        cx,
        cy,
        currentRadius * 1.25
      );
      fieldGrad.addColorStop(0, 'rgba(129, 140, 248, 0)');
      fieldGrad.addColorStop(0.5, `rgba(99, 102, 241, ${0.12 * vi.brightness})`);
      fieldGrad.addColorStop(0.85, `rgba(56, 189, 248, ${0.08 * vi.brightness})`);
      fieldGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');

      ctx.fillStyle = fieldGrad;
      ctx.fill();
      ctx.restore();

      // ==========================================
      // LAYER 3: FLOWING ORBITAL LIGHT TRAILS (BEHIND RING)
      // ==========================================
      const renderOrbitalTrails = (renderFrontOnly: boolean) => {
        ctx.save();
        for (const trail of trails) {
          // Update trail angle
          trail.angle += trail.speed * vi.trailSpeedFactor;

          const tiltCos = Math.cos(trail.planeTilt);
          const tiltSin = Math.sin(trail.planeTilt);
          const rotCos = Math.cos(trail.planeRotation);
          const rotSin = Math.sin(trail.planeRotation);

          // Calculate current head position in 3D
          const headAngle = trail.angle;
          const headZ = Math.sin(headAngle) * tiltSin;
          const isFront = headZ >= 0;

          if (isFront !== renderFrontOnly) continue;

          // Draw trailing segments
          const segments = 24;
          for (let s = 0; s < segments; s++) {
            const segFraction = s / segments;
            const segAngle = headAngle - (trail.length * (1 - segFraction));

            // Base ellipse coordinates
            const rx = currentRadius * trail.orbitRadiusRatio;
            const ry = rx * trail.orbitEccentricity;
            const ex = Math.cos(segAngle) * rx;
            const ey = Math.sin(segAngle) * ry;

            // Apply 3D tilt & orbital orientation
            const x3d = ex * rotCos - ey * rotSin;
            const y3d = (ex * rotSin + ey * rotCos) * tiltCos;

            const px = cx + x3d;
            const py = cy + y3d;

            if (s === 0) continue;

            const prevFraction = (s - 1) / segments;
            const prevAngle = headAngle - (trail.length * (1 - prevFraction));
            const pex = Math.cos(prevAngle) * rx;
            const pey = Math.sin(prevAngle) * ry;
            const pxPrev = cx + (pex * rotCos - pey * rotSin);
            const pyPrev = cy + (pex * rotSin + pey * rotCos) * tiltCos;

            ctx.beginPath();
            ctx.moveTo(pxPrev, pyPrev);
            ctx.lineTo(px, py);

            const segAlpha = Math.pow(segFraction, 1.8) * trail.baseAlpha * vi.brightness;
            let strokeColor = `rgba(56, 189, 248, ${segAlpha})`;
            let shadowColor = '#38bdf8';

            if (trail.colorType === 'violet') {
              strokeColor = `rgba(168, 85, 247, ${segAlpha})`;
              shadowColor = '#a855f7';
            } else if (trail.colorType === 'azure') {
              strokeColor = `rgba(37, 99, 235, ${segAlpha})`;
              shadowColor = '#2563eb';
            } else if (trail.colorType === 'white-blue') {
              strokeColor = `rgba(224, 242, 254, ${segAlpha})`;
              shadowColor = '#e0f2fe';
            }

            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = trail.width * segFraction;
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = 6 * segFraction;
            ctx.stroke();
          }

          // Radiant comet head
          const rx = currentRadius * trail.orbitRadiusRatio;
          const ry = rx * trail.orbitEccentricity;
          const hx = cx + (Math.cos(headAngle) * rx * rotCos - Math.sin(headAngle) * ry * rotSin);
          const hy = cy + (Math.cos(headAngle) * rx * rotSin + Math.sin(headAngle) * ry * rotCos) * tiltCos;

          ctx.beginPath();
          ctx.arc(hx, hy, trail.width * 1.1, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = trail.colorType === 'violet' ? '#c084fc' : '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.fill();
        }
        ctx.restore();
      };

      // Draw trails passing behind the ring
      renderOrbitalTrails(false);

      // ==========================================
      // LAYER 5: SUBTLE INNER GLOW (FEATHERED INWARD, LEAVING CENTER DARK)
      // ==========================================
      ctx.save();
      const innerGlowRadius = currentRadius * 0.98;
      const innerGlowStart = currentRadius * 0.65;
      const innerGrad = ctx.createRadialGradient(
        cx,
        cy,
        innerGlowStart,
        cx,
        cy,
        innerGlowRadius
      );

      // The core center stays deep and dark, while rim glows inward
      innerGrad.addColorStop(0, 'rgba(2, 6, 23, 0)');
      innerGrad.addColorStop(0.6, `rgba(30, 27, 75, ${vi.innerGlowAlpha * 0.4})`);
      innerGrad.addColorStop(0.85, `rgba(99, 102, 241, ${vi.innerGlowAlpha * 0.75})`);
      innerGrad.addColorStop(1, `rgba(56, 189, 248, ${vi.innerGlowAlpha})`);

      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, innerGlowRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ==========================================
      // LAYER 4: THE PRIMARY LUMINOUS RING
      // ==========================================
      ctx.save();
      const ringSteps = 80;
      const ringRotation = time * 0.25 * vi.trailSpeedFactor;

      ctx.beginPath();
      for (let r = 0; r <= ringSteps; r++) {
        const theta = (r / ringSteps) * Math.PI * 2;
        // Subtle organic perimeter breathing and micro-harmonic modulation
        const w1 = Math.sin(theta * 4 + ringRotation * 2) * (1.6 + totalAmp * 2.5);
        const w2 = Math.cos(theta * 6 - ringRotation) * (1.0 + totalAmp * 1.5);
        const n = noise2D(Math.cos(theta) * 2.0, Math.sin(theta) * 2.0 + time * 0.3) * (2.2 + totalAmp * 3);
        const rad = currentRadius + (w1 + w2 + n) * vi.ringWobble;

        const rx = cx + Math.cos(theta) * rad;
        const ry = cy + Math.sin(theta) * rad;
        if (r === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();

      // Pass 1: Broad soft atmospheric halo
      ctx.strokeStyle = `rgba(129, 140, 248, ${0.45 * vi.brightness})`;
      ctx.lineWidth = (12 + outAmp * 10) * vi.glowSize;
      ctx.shadowColor = '#818cf8';
      ctx.shadowBlur = (22 + outAmp * 20) * vi.glowSize;
      ctx.stroke();

      // Pass 2: Electric violet-cyan luminous aura
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.85 * vi.brightness})`;
      ctx.lineWidth = (4.5 + outAmp * 3.5) * vi.glowSize;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = (14 + outAmp * 12) * vi.glowSize;
      ctx.stroke();

      // Pass 3: Brilliant electric white-blue core
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.98)';
      ctx.lineWidth = 2.0 + outAmp * 1.2;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8 + outAmp * 6;
      ctx.stroke();
      ctx.restore();

      // Draw trails passing in front of the ring
      renderOrbitalTrails(true);

      // ==========================================
      // DYNAMIC EXPANDING WAVES (ON SPEECH / TAP)
      // ==========================================
      if (wavesRef.current.length > 0) {
        ctx.save();
        for (let w = wavesRef.current.length - 1; w >= 0; w--) {
          const wave = wavesRef.current[w];
          wave.radius += wave.speed;
          wave.alpha *= 0.96;
          if (wave.radius > wave.maxRadius || wave.alpha < 0.02) {
            wavesRef.current.splice(w, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(cx, cy, wave.radius, 0, Math.PI * 2);
          ctx.strokeStyle = wave.color.replace('ALPHA', wave.alpha.toFixed(3));
          ctx.lineWidth = 1.6 * (1 - wave.radius / wave.maxRadius);
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.stroke();
        }
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      resizeObserver.disconnect();
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

  const handleOrbClick = () => {
    // Spawn tactile energy ripple wave
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height) || 360;
      const baseRadius = size * 0.31;
      wavesRef.current.push({
        radius: baseRadius * 0.9,
        maxRadius: baseRadius * 1.6,
        speed: 3.2,
        alpha: 0.65,
        color: 'rgba(56, 189, 248, ALPHA)',
      });
    }
    onOrbClick?.();
  };

  return (
    <div
      ref={containerRef}
      id="myraa-energy-ring-container"
      className="relative w-full h-full max-w-[340px] sm:max-w-[400px] md:max-w-[460px] aspect-square flex items-center justify-center cursor-pointer select-none"
      onClick={handleOrbClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label="MYRAA Living Presence - Tap to interact"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOrbClick();
        }
      }}
    >
      {/* HTML5 Canvas with High-Performance Double-Buffered Layering */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* Subtle deep central cosmic abyss highlight without any face or avatar */}
      <div className="absolute inset-[24%] rounded-full pointer-events-none bg-radial from-[#02040a]/90 via-[#030712]/70 to-transparent" />
    </div>
  );
};
