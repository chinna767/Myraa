import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ConnectionStatus, EmotionBlend, EmotionState } from '../types';
import { noise2D, noise3D } from '../utils/proceduralNoise';

interface MyraaAICoreProps {
  status: ConnectionStatus;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking?: boolean;
  inputVolume: number;
  outputVolume: number;
  dominantEmotion: string;
  emotionBlend?: EmotionBlend;
  emotionState?: EmotionState;
  onCoreClick?: () => void;
}

// Layer 2: Deep Space Background Particles
interface DeepSpaceParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  fadeSpeed: number;
  twinklePhase: number;
}

// Layer 3: Outer Quantum Field Fragments & Arcs
interface QuantumFragment {
  angle: number;
  radius: number;
  baseRadius: number;
  speed: number;
  length: number;
  alpha: number;
  width: number;
  noiseOffset: number;
}

// Layer 4: Neural Membrane Nodes (3D Deforming Lattice)
interface MembraneNode {
  baseX: number;
  baseY: number;
  baseZ: number;
  x: number;
  y: number;
  z: number;
  projX: number;
  projY: number;
  projScale: number;
  active: boolean;
  sparkTime: number;
  displacement: number;
}

// Layer 5: Dynamic Data Pulses (Traveling along synaptic connections)
interface DataPulse {
  sourceIndex: number;
  targetIndex: number;
  progress: number;
  speed: number;
  size: number;
  color: string;
  intensity: number;
}

// Layer 6: Orbital Swarm Particles (Physics & Force-fields)
interface OrbitalParticle {
  group: number; // 0: inner fast, 1: counter mid, 2: eccentric physics
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  mass: number;
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  orbitInclination: number;
  size: number;
  alpha: number;
  color: string;
}

// Layer 7: Inner Energy Cloud (Swirling Digital Plasma)
interface PlasmaParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  baseRadius: number;
  angle: number;
  speed: number;
  elevation: number;
  size: number;
  alpha: number;
  color: string;
}

// Layer 9: Concentric Energy Shock Waves
interface ShockWave {
  radius: number;
  maxRadius: number;
  speed: number;
  alpha: number;
  width: number;
  color: string;
}

// Layer 10: Audio Reactive Particles
interface AudioReactiveParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  baseR: number;
  angle: number;
  speed: number;
  elevation: number;
  size: number;
  alpha: number;
  jitter: number;
}

export const MyraaAICore: React.FC<MyraaAICoreProps> = ({
  status,
  isListening,
  isSpeaking,
  isThinking = false,
  inputVolume,
  outputVolume,
  dominantEmotion,
  emotionBlend,
  onCoreClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Audio smoothed state (Zero-jitter exponential filter)
  const smoothedOutputRef = useRef<number>(0);
  const smoothedInputRef = useRef<number>(0);

  // Visual Inertia Tracking (Smooth parameter transitions)
  const visualInertiaRef = useRef({
    activity: 1.0,
    speed: 1.0,
    focus: 0.0,
    pulseIntensity: 1.0,
    turbulence: 1.0,
    connectionDensity: 1.0,
    membraneDeform: 1.0,
    glowIntensity: 1.0,
  });

  // 3D Virtual Camera & Rotation Angles
  const rotYRef = useRef<number>(0);
  const rotXRef = useRef<number>(0.12);

  // Active Shock Waves list
  const shockWavesRef = useRef<ShockWave[]>([]);
  const lastStateRef = useRef<string>(status);
  const lastAudioPeakRef = useRef<number>(0);
  const [, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina-sharp rendering capped at 2.0 to prevent mobile GPU throttling
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth || 380;
    const height = canvas.clientHeight || 380;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = width / 2;
    const centerY = height / 2;
    const fov = 320; // 3D Camera Field of View
    const baseSphereRadius = Math.min(width, height) * 0.28; // ~105px

    // --- INITIALIZE LAYER 1 & 2: DEEP SPACE BACKGROUND PARTICLES ---
    const deepParticleCount = 48;
    const deepParticles: DeepSpaceParticle[] = [];
    for (let i = 0; i < deepParticleCount; i++) {
      deepParticles.push({
        x: (Math.random() - 0.5) * width * 1.8,
        y: (Math.random() - 0.5) * height * 1.8,
        z: -250 - Math.random() * 450,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        size: 0.7 + Math.random() * 1.4,
        baseAlpha: 0.15 + Math.random() * 0.45,
        alpha: 0.2 + Math.random() * 0.4,
        fadeSpeed: 0.008 + Math.random() * 0.012,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    // --- INITIALIZE LAYER 3: OUTER QUANTUM FIELD FRAGMENTS & ARCS ---
    const quantumFragmentCount = 20;
    const quantumFragments: QuantumFragment[] = [];
    for (let i = 0; i < quantumFragmentCount; i++) {
      const baseR = baseSphereRadius * (1.35 + Math.random() * 0.4);
      quantumFragments.push({
        angle: Math.random() * Math.PI * 2,
        radius: baseR,
        baseRadius: baseR,
        speed: (0.004 + Math.random() * 0.008) * (Math.random() < 0.5 ? 1 : -1),
        length: 0.25 + Math.random() * 0.65, // arc length in radians
        alpha: 0.15 + Math.random() * 0.35,
        width: 0.75 + Math.random() * 1.2,
        noiseOffset: Math.random() * 100,
      });
    }

    // --- INITIALIZE LAYER 4: NEURAL MEMBRANE NODES (Fibonacci Sphere) ---
    const membraneNodeCount = 118;
    const membraneNodes: MembraneNode[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < membraneNodeCount; i++) {
      const y = 1 - (i / (membraneNodeCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      membraneNodes.push({
        baseX: x * baseSphereRadius,
        baseY: y * baseSphereRadius,
        baseZ: z * baseSphereRadius,
        x: x * baseSphereRadius,
        y: y * baseSphereRadius,
        z: z * baseSphereRadius,
        projX: centerX,
        projY: centerY,
        projScale: 1,
        active: false,
        sparkTime: Math.random() * 50,
        displacement: 0,
      });
    }

    // Pre-calculate nearest neighbors for synaptic connections
    const neighbors: number[][] = [];
    for (let i = 0; i < membraneNodeCount; i++) {
      const dists: { index: number; dSq: number }[] = [];
      const na = membraneNodes[i];
      for (let j = 0; j < membraneNodeCount; j++) {
        if (i === j) continue;
        const nb = membraneNodes[j];
        const dx = na.baseX - nb.baseX;
        const dy = na.baseY - nb.baseY;
        const dz = na.baseZ - nb.baseZ;
        dists.push({ index: j, dSq: dx * dx + dy * dy + dz * dz });
      }
      dists.sort((a, b) => a.dSq - b.dSq);
      neighbors.push(dists.slice(0, 4).map((d) => d.index));
    }

    // --- INITIALIZE LAYER 5: DYNAMIC DATA PULSES ---
    const pulseCount = 16;
    const dataPulses: DataPulse[] = [];
    for (let i = 0; i < pulseCount; i++) {
      const src = Math.floor(Math.random() * membraneNodeCount);
      const tgtList = neighbors[src] || [0];
      const tgt = tgtList[Math.floor(Math.random() * tgtList.length)];
      dataPulses.push({
        sourceIndex: src,
        targetIndex: tgt,
        progress: Math.random(),
        speed: 0.012 + Math.random() * 0.02,
        size: 1.8 + Math.random() * 1.4,
        color: Math.random() < 0.75 ? '#00f0ff' : '#ffffff',
        intensity: 0.8 + Math.random() * 0.4,
      });
    }

    // --- INITIALIZE LAYER 6: ORBITAL SWARM PARTICLES ---
    const orbitalCount = 75;
    const orbitalParticles: OrbitalParticle[] = [];
    for (let i = 0; i < orbitalCount; i++) {
      const group = i < 25 ? 0 : i < 50 ? 1 : 2;
      let orbitR = baseSphereRadius;
      let speed = 0.008;
      let inclination = 0;
      let col = '#00f0ff';

      if (group === 0) {
        // Inner fast swarm
        orbitR = baseSphereRadius * (0.65 + Math.random() * 0.35);
        speed = 0.012 + Math.random() * 0.012;
        inclination = 0.25 + (Math.random() - 0.5) * 0.2;
        col = '#ffffff';
      } else if (group === 1) {
        // Mid counter-clockwise swarm
        orbitR = baseSphereRadius * (1.0 + Math.random() * 0.4);
        speed = -(0.008 + Math.random() * 0.01);
        inclination = -0.45 + (Math.random() - 0.5) * 0.3;
        col = '#38bdf8';
      } else {
        // Eccentric physics swarm
        orbitR = baseSphereRadius * (0.8 + Math.random() * 0.75);
        speed = (0.005 + Math.random() * 0.008) * (Math.random() < 0.5 ? 1 : -1);
        inclination = (Math.random() - 0.5) * Math.PI * 0.6;
        col = '#0284c7';
      }

      orbitalParticles.push({
        group,
        x: 0,
        y: 0,
        z: 0,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.2,
        mass: 0.8 + Math.random() * 0.6,
        orbitRadius: orbitR,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: speed,
        orbitInclination: inclination,
        size: group === 0 ? 1.4 : 1.8,
        alpha: 0.35 + Math.random() * 0.55,
        color: col,
      });
    }

    // --- INITIALIZE LAYER 7: INNER ENERGY CLOUD (Digital Plasma) ---
    const plasmaCount = 65;
    const plasmaParticles: PlasmaParticle[] = [];
    for (let i = 0; i < plasmaCount; i++) {
      const baseR = baseSphereRadius * (0.2 + Math.random() * 0.45);
      plasmaParticles.push({
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        radius: baseR,
        baseRadius: baseR,
        angle: Math.random() * Math.PI * 2,
        speed: (0.014 + Math.random() * 0.02) * (Math.random() < 0.5 ? 1 : -1),
        elevation: (Math.random() - 0.5) * Math.PI,
        size: 1.2 + Math.random() * 2.2,
        alpha: 0.25 + Math.random() * 0.6,
        color: Math.random() < 0.6 ? '#00f0ff' : Math.random() < 0.85 ? '#38bdf8' : '#ffffff',
      });
    }

    // --- INITIALIZE LAYER 10: AUDIO REACTIVE PARTICLES ---
    const audioReactiveCount = 38;
    const audioReactiveParticles: AudioReactiveParticle[] = [];
    for (let i = 0; i < audioReactiveCount; i++) {
      const baseR = baseSphereRadius * (0.85 + Math.random() * 0.65);
      audioReactiveParticles.push({
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        baseR,
        angle: Math.random() * Math.PI * 2,
        speed: 0.007 + Math.random() * 0.012,
        elevation: (Math.random() - 0.5) * Math.PI * 0.8,
        size: 1.4 + Math.random() * 2.0,
        alpha: 0.4 + Math.random() * 0.5,
        jitter: 0,
      });
    }

    const startTime = performance.now();
    let lastFrameTime = startTime;

    // Helper: Trigger expanding energy shock wave
    const triggerShockWave = (intensity = 1.0, color = '#00f0ff') => {
      shockWavesRef.current.push({
        radius: baseSphereRadius * 0.25,
        maxRadius: baseSphereRadius * (1.6 + intensity * 0.5),
        speed: (2.5 + intensity * 2.0) * dpr,
        alpha: 0.7 * intensity,
        width: 1.8 * intensity,
        color,
      });
      if (shockWavesRef.current.length > 5) {
        shockWavesRef.current.shift();
      }
    };

    // --- CORE RENDER LOOP ---
    const render = (now: number) => {
      const dt = Math.min((now - lastFrameTime) * 0.001, 0.1);
      lastFrameTime = now;
      const time = (now - startTime) * 0.001;

      // 1. Audio smoothing
      const targetOut = isSpeaking ? Math.min(1.4, outputVolume * 1.8) : 0;
      const targetIn = isListening && !isSpeaking ? Math.min(1.2, inputVolume * 1.5) : 0;
      smoothedOutputRef.current += (targetOut - smoothedOutputRef.current) * 0.18;
      smoothedInputRef.current += (targetIn - smoothedInputRef.current) * 0.18;
      const outAmp = smoothedOutputRef.current;
      const inAmp = smoothedInputRef.current;
      const totalAmp = Math.max(outAmp, inAmp);

      // 2. State change shockwave trigger
      if (lastStateRef.current !== status) {
        triggerShockWave(1.2, status === 'connected' ? '#00f0ff' : '#38bdf8');
        lastStateRef.current = status;
      }

      if (outAmp > 0.65 && now - lastAudioPeakRef.current > 800) {
        triggerShockWave(0.9 + outAmp * 0.4, '#ffffff');
        lastAudioPeakRef.current = now;
      }

      // 3. EMOTION INTELLIGENCE & WEIGHTED BLEND
      let targetActivity = 1.0;
      let targetSpeed = 1.0;
      let targetFocus = 0.0;
      let targetPulse = 1.0;
      let targetTurbulence = 1.0;
      let targetDensity = 1.0;
      let targetDeform = 1.0;

      const dom = dominantEmotion.toLowerCase();
      if (dom.includes('excit') || dom.includes('energy') || dom.includes('surprise')) {
        targetSpeed = 1.45;
        targetPulse = 1.5;
        targetTurbulence = 1.6;
        targetActivity = 1.4;
      } else if (dom.includes('curio') || dom.includes('anticipat')) {
        targetSpeed = 1.2;
        targetDensity = 1.35;
        targetActivity = 1.25;
      } else if (dom.includes('happy') || dom.includes('playful')) {
        targetSpeed = 1.15;
        targetPulse = 1.2;
        targetActivity = 1.15;
      } else if (dom.includes('concern')) {
        targetFocus = 0.6;
        targetTurbulence = 0.75;
        targetSpeed = 0.85;
      } else if (dom.includes('affect') || dom.includes('shy')) {
        targetSpeed = 0.92;
        targetPulse = 1.1;
        targetTurbulence = 0.85;
      } else if (dom.includes('calm') || dom.includes('empath')) {
        targetSpeed = 0.8;
        targetPulse = 0.85;
        targetTurbulence = 0.7;
      } else if (dom.includes('confidence')) {
        targetSpeed = 1.0;
        targetFocus = 0.4;
        targetDeform = 0.85;
      }

      if (isThinking || status === 'connecting' || status === 'reconnecting') {
        targetTurbulence = 1.8;
        targetSpeed = 1.55;
        targetActivity = 1.6;
        targetDensity = 1.4;
      } else if (isListening) {
        targetFocus = 0.7;
        targetSpeed = 1.05;
        targetActivity = 1.2;
      } else if (isSpeaking) {
        targetPulse = 1.6;
        targetSpeed = 1.3;
        targetActivity = 1.35;
      }

      const vi = visualInertiaRef.current;
      const inertiaFactor = Math.min(1.0, dt * 3.2);
      vi.activity += (targetActivity - vi.activity) * inertiaFactor;
      vi.speed += (targetSpeed - vi.speed) * inertiaFactor;
      vi.focus += (targetFocus - vi.focus) * inertiaFactor;
      vi.pulseIntensity += (targetPulse - vi.pulseIntensity) * inertiaFactor;
      vi.turbulence += (targetTurbulence - vi.turbulence) * inertiaFactor;
      vi.connectionDensity += (targetDensity - vi.connectionDensity) * inertiaFactor;
      vi.membraneDeform += (targetDeform - vi.membraneDeform) * inertiaFactor;

      const breathPeriod = 4.2 / vi.speed;
      const breathPhase = (time % breathPeriod) / breathPeriod;
      const breathWave = (Math.sin(breathPhase * Math.PI * 2 - Math.PI / 2) + 1) * 0.5;
      const breathScale =
        1.0 +
        breathWave * 0.08 * vi.pulseIntensity +
        outAmp * 0.35 +
        inAmp * 0.15 -
        vi.focus * 0.06;

      const rotSpeed = (0.003 + outAmp * 0.008 + inAmp * 0.003) * vi.speed;
      rotYRef.current += rotSpeed;
      rotXRef.current += rotSpeed * 0.35;
      const cosY = Math.cos(rotYRef.current);
      const sinY = Math.sin(rotYRef.current);
      const cosX = Math.cos(rotXRef.current);
      const sinX = Math.sin(rotXRef.current);

      ctx.clearRect(0, 0, width, height);

      // LAYER 1: Deep cosmic backdrop
      const bgGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        baseSphereRadius * 2.2 * breathScale
      );
      bgGrad.addColorStop(0, 'rgba(0, 240, 255, 0.12)');
      bgGrad.addColorStop(0.35, 'rgba(2, 132, 199, 0.08)');
      bgGrad.addColorStop(0.7, 'rgba(3, 7, 18, 0.05)');
      bgGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseSphereRadius * 2.2 * breathScale, 0, Math.PI * 2);
      ctx.fill();

      // Distant micro-traces
      for (let i = 0; i < deepParticleCount; i++) {
        const dp = deepParticles[i];
        dp.x += dp.vx * vi.speed;
        dp.y += dp.vy * vi.speed;
        dp.twinklePhase += dp.fadeSpeed;
        dp.alpha = dp.baseAlpha * (0.6 + Math.sin(dp.twinklePhase) * 0.4);

        if (dp.x > width) dp.x = -width * 0.2;
        if (dp.x < -width * 0.2) dp.x = width;
        if (dp.y > height) dp.y = -height * 0.2;
        if (dp.y < -height * 0.2) dp.y = height;

        const scale = fov / (fov - dp.z);
        const px = centerX + (dp.x - centerX) * scale;
        const py = centerY + (dp.y - centerY) * scale;
        ctx.fillStyle = `rgba(186, 230, 253, ${dp.alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.4, dp.size * scale), 0, Math.PI * 2);
        ctx.fill();
      }

      // LAYER 3: OUTER QUANTUM FIELD
      ctx.save();
      for (let i = 0; i < quantumFragmentCount; i++) {
        const qf = quantumFragments[i];
        qf.angle += qf.speed * vi.speed * (1 + totalAmp * 0.8);
        const nR = noise2D(Math.cos(qf.angle) * 1.5, Math.sin(qf.angle) * 1.5 + time * 0.2);
        const curR =
          (qf.baseRadius + nR * 14 * vi.membraneDeform) *
          (isListening ? 0.92 - inAmp * 0.08 : 1.0 + outAmp * 0.18) *
          breathScale;

        ctx.beginPath();
        ctx.arc(centerX, centerY, curR, qf.angle, qf.angle + qf.length);
        ctx.strokeStyle = `rgba(0, 240, 255, ${qf.alpha * (0.5 + totalAmp * 0.5)})`;
        ctx.lineWidth = qf.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        if (i % 3 === 0) {
          const nx = centerX + Math.cos(qf.angle) * curR;
          const ny = centerY + Math.sin(qf.angle) * curR;
          ctx.beginPath();
          ctx.arc(nx, ny, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fill();
        }
      }
      ctx.restore();

      // LAYER 4: NEURAL MEMBRANE
      for (let i = 0; i < membraneNodeCount; i++) {
        const node = membraneNodes[i];
        const nx = node.baseX * 0.015;
        const ny = node.baseY * 0.015;
        const nz = node.baseZ * 0.015 + time * 0.35 * vi.speed;
        const noiseVal = noise3D(nx, ny, nz);
        const harmonic =
          Math.sin(time * 2.2 + i * 0.35) * 3.5 + Math.cos(time * 1.4 + i * 0.5) * 2.5;
        const totalDisplacement = (noiseVal * 12 + harmonic) * vi.membraneDeform * (1 + totalAmp * 0.7);
        node.displacement = totalDisplacement;
        const curRadius = (baseSphereRadius + totalDisplacement) * breathScale;
        const norm = baseSphereRadius;
        const rx = (node.baseX / norm) * curRadius;
        const ry = (node.baseY / norm) * curRadius;
        const rz = (node.baseZ / norm) * curRadius;

        const y1 = ry * cosX - rz * sinX;
        const z1 = ry * sinX + rz * cosX;
        const x2 = rx * cosY + z1 * sinY;
        const z2 = -rx * sinY + z1 * cosY;

        node.x = x2;
        node.y = y1;
        node.z = z2;

        const scale = fov / (fov + z2);
        node.projX = centerX + x2 * scale;
        node.projY = centerY + y1 * scale;
        node.projScale = scale;

        node.sparkTime += (0.025 + outAmp * 0.05 + inAmp * 0.03) * vi.activity;
        node.active = Math.sin(node.sparkTime) > 0.88;
      }

      // LAYER 5: DYNAMIC DATA NETWORK
      ctx.save();
      const maxDist = baseSphereRadius * 0.62 * vi.connectionDensity * (1 + totalAmp * 0.2);
      const maxDistSq = maxDist * maxDist;

      for (let i = 0; i < membraneNodeCount; i++) {
        const na = membraneNodes[i];
        if (na.z < -fov * 0.85) continue;
        const neighborIndices = neighbors[i] || [];
        for (let k = 0; k < neighborIndices.length; k++) {
          const j = neighborIndices[k];
          if (j <= i) continue;
          const nb = membraneNodes[j];
          const dx = na.x - nb.x;
          const dy = na.y - nb.y;
          const dz = na.z - nb.z;
          const dSq = dx * dx + dy * dy + dz * dz;
          if (dSq < maxDistSq) {
            const dist = Math.sqrt(dSq);
            const distFactor = 1 - dist / maxDist;
            const zNorm = ((na.z + nb.z) * 0.5 + baseSphereRadius) / (baseSphereRadius * 2);
            const zAlpha = Math.max(0.12, Math.min(1.0, zNorm));
            const lineAlpha = distFactor * zAlpha * (0.35 + totalAmp * 0.45);

            if (lineAlpha > 0.03) {
              ctx.beginPath();
              ctx.moveTo(na.projX, na.projY);
              ctx.lineTo(nb.projX, nb.projY);
              const isActive = na.active || nb.active || totalAmp > 0.4 || isThinking;
              if (isActive) {
                ctx.strokeStyle = `rgba(0, 240, 255, ${Math.min(0.9, lineAlpha * 1.8)})`;
                ctx.lineWidth = Math.max(0.6, 1.25 * na.projScale);
              } else {
                ctx.strokeStyle = `rgba(14, 116, 144, ${Math.min(0.5, lineAlpha * 0.85)})`;
                ctx.lineWidth = Math.max(0.4, 0.7 * na.projScale);
              }
              ctx.stroke();
            }
          }
        }
      }

      // Traveling Data Pulses
      for (let i = 0; i < pulseCount; i++) {
        const pulse = dataPulses[i];
        pulse.progress += pulse.speed * vi.speed * (isThinking ? 1.8 : 1 + totalAmp * 1.2);
        if (pulse.progress >= 1.0) {
          pulse.progress = 0;
          pulse.sourceIndex = pulse.targetIndex;
          const nextTargets = neighbors[pulse.sourceIndex] || [0];
          pulse.targetIndex = nextTargets[Math.floor(Math.random() * nextTargets.length)];
          membraneNodes[pulse.sourceIndex].active = true;
        }
        const na = membraneNodes[pulse.sourceIndex];
        const nb = membraneNodes[pulse.targetIndex];
        if (na && nb) {
          const px = na.projX + (nb.projX - na.projX) * pulse.progress;
          const py = na.projY + (nb.projY - na.projY) * pulse.progress;
          const pz = na.z + (nb.z - na.z) * pulse.progress;
          const zNorm = (pz + baseSphereRadius) / (baseSphereRadius * 2);
          ctx.beginPath();
          ctx.arc(px, py, Math.max(1.0, pulse.size * na.projScale), 0, Math.PI * 2);
          ctx.fillStyle = pulse.color;
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 8 * na.projScale;
          ctx.fill();
        }
      }
      ctx.restore();

      // Membrane Nodes
      for (let i = 0; i < membraneNodeCount; i++) {
        const node = membraneNodes[i];
        const zNorm = (node.z + baseSphereRadius) / (baseSphereRadius * 2);
        const depthAlpha = Math.max(0.18, Math.min(1.0, zNorm));
        const nodeR = (node.active ? 2.4 : 1.3) * node.projScale * (1 + totalAmp * 0.35);
        ctx.beginPath();
        ctx.arc(node.projX, node.projY, Math.max(0.7, nodeR), 0, Math.PI * 2);
        if (node.active || totalAmp > 0.45) {
          ctx.fillStyle = `rgba(255, 255, 255, ${depthAlpha})`;
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 6 * node.projScale;
        } else {
          ctx.fillStyle = `rgba(56, 189, 248, ${depthAlpha * 0.85})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // LAYER 6: ORBITAL SWARM PARTICLES
      for (let i = 0; i < orbitalCount; i++) {
        const p = orbitalParticles[i];
        p.orbitAngle += p.orbitSpeed * vi.speed * (1 + totalAmp * 1.4);

        let targetOrbitR = p.orbitRadius;
        if (isListening) {
          targetOrbitR = p.orbitRadius * (0.82 - inAmp * 0.12);
        } else if (isSpeaking) {
          targetOrbitR = p.orbitRadius * (1.08 + outAmp * 0.32);
        }
        const curR = targetOrbitR * breathScale;
        const px = Math.cos(p.orbitAngle) * curR;
        const pz = Math.sin(p.orbitAngle) * curR * Math.cos(p.orbitInclination);
        const py = Math.sin(p.orbitAngle) * curR * Math.sin(p.orbitInclination);

        const py1 = py * cosX - pz * sinX;
        const pz1 = py * sinX + pz * cosX;
        const px2 = px * cosY + pz1 * sinY;
        const pz2 = -px * sinY + pz1 * cosY;

        const scale = fov / (fov + pz2);
        const projX = centerX + px2 * scale;
        const projY = centerY + py1 * scale;
        const zNorm = (pz2 + baseSphereRadius * 1.5) / (baseSphereRadius * 3);
        const pAlpha = Math.max(0.15, Math.min(1.0, zNorm)) * p.alpha;

        ctx.beginPath();
        const pR = p.size * scale * (1 + (p.group === 0 ? outAmp * 0.7 : 0));
        ctx.arc(projX, projY, Math.max(0.6, pR), 0, Math.PI * 2);
        if (p.group === 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${pAlpha})`;
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 6 * scale;
        } else {
          ctx.fillStyle = `rgba(0, 240, 255, ${pAlpha * 0.9})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // LAYER 7: INNER ENERGY CLOUD
      for (let i = 0; i < plasmaCount; i++) {
        const pp = plasmaParticles[i];
        pp.angle += pp.speed * vi.speed * vi.turbulence;
        const curlN = noise2D(Math.cos(pp.angle) * 1.2, Math.sin(pp.angle) * 1.2 + time * 0.4);
        const curR = (pp.baseRadius + curlN * 8 * vi.turbulence) * breathScale;
        const px = Math.cos(pp.angle) * curR;
        const py = Math.sin(pp.angle) * curR * Math.cos(pp.elevation);
        const pz = Math.sin(pp.angle) * curR * Math.sin(pp.elevation);

        const py1 = py * cosX - pz * sinX;
        const pz1 = py * sinX + pz * cosX;
        const px2 = px * cosY + pz1 * sinY;
        const pz2 = -px * sinY + pz1 * cosY;

        const scale = fov / (fov + pz2);
        const projX = centerX + px2 * scale;
        const projY = centerY + py1 * scale;
        const zNorm = (pz2 + baseSphereRadius * 0.8) / (baseSphereRadius * 1.6);
        const pAlpha = Math.max(0.12, Math.min(1.0, zNorm)) * pp.alpha;

        ctx.beginPath();
        ctx.arc(projX, projY, Math.max(0.5, pp.size * scale), 0, Math.PI * 2);
        ctx.fillStyle = pp.color === '#ffffff' ? `rgba(255, 255, 255, ${pAlpha})` : `rgba(0, 240, 255, ${pAlpha * 0.85})`;
        ctx.fill();
      }

      // LAYER 9: SHOCK WAVES
      if (shockWavesRef.current.length > 0) {
        ctx.save();
        for (let i = shockWavesRef.current.length - 1; i >= 0; i--) {
          const sw = shockWavesRef.current[i];
          sw.radius += sw.speed * vi.speed;
          sw.alpha *= 0.95;
          if (sw.radius > sw.maxRadius || sw.alpha < 0.02) {
            shockWavesRef.current.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(centerX, centerY, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 240, 255, ${sw.alpha})`;
          ctx.lineWidth = sw.width * (1 - sw.radius / sw.maxRadius);
          ctx.stroke();
        }
        ctx.restore();
      }

      // LAYER 10: AUDIO REACTIVE PARTICLES
      if (isSpeaking || (isListening && inAmp > 0.05)) {
        for (let i = 0; i < audioReactiveCount; i++) {
          const ap = audioReactiveParticles[i];
          ap.angle += ap.speed * (1 + totalAmp * 2.0);
          const audioR = ap.baseR * (isSpeaking ? 1.0 + outAmp * 0.45 : 0.85 - inAmp * 0.15) * breathScale;
          const jitter = (Math.random() - 0.5) * (outAmp * 8 + inAmp * 4);
          const px = Math.cos(ap.angle) * (audioR + jitter);
          const py = Math.sin(ap.angle) * (audioR + jitter) * Math.cos(ap.elevation);
          const pz = Math.sin(ap.angle) * (audioR + jitter) * Math.sin(ap.elevation);

          const py1 = py * cosX - pz * sinX;
          const pz1 = py * sinX + pz * cosX;
          const px2 = px * cosY + pz1 * sinY;
          const pz2 = -px * sinY + pz1 * cosY;

          const scale = fov / (fov + pz2);
          const projX = centerX + px2 * scale;
          const projY = centerY + py1 * scale;

          ctx.beginPath();
          ctx.arc(projX, projY, Math.max(0.6, ap.size * scale * (1 + outAmp * 0.8)), 0, Math.PI * 2);
          ctx.fillStyle = isSpeaking ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 240, 255, 0.75)';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 8 * scale;
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      // LAYER 8: CENTRAL CONSCIOUSNESS CORE
      const coreBaseR = baseSphereRadius * 0.36 * breathScale;
      const corePulseR = coreBaseR * (1 + outAmp * 0.42 + inAmp * 0.2);

      ctx.save();
      const numTendrils = 6;
      for (let t = 0; t < numTendrils; t++) {
        const tendrilAngle = (t / numTendrils) * Math.PI * 2 + time * (1.1 + t * 0.25) * vi.speed;
        const rOffset = Math.sin(time * 3.2 + t * 1.8) * (corePulseR * 0.22);
        const tR = corePulseR * 0.75 + rOffset;
        const tx = centerX + Math.cos(tendrilAngle) * tR;
        const ty = centerY + Math.sin(tendrilAngle) * tR;
        const grad = ctx.createRadialGradient(tx, ty, 0, tx, ty, corePulseR * 0.65);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        grad.addColorStop(0.5, 'rgba(0, 240, 255, 0.35)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(tx, ty, corePulseR * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.save();
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 22 + outAmp * 30 + inAmp * 15;
      const coreGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        corePulseR * 1.05
      );
      coreGradient.addColorStop(0, '#ffffff');
      coreGradient.addColorStop(0.2, '#e0f7fa');
      coreGradient.addColorStop(0.48, '#00f0ff');
      coreGradient.addColorStop(0.78, '#0070f3');
      coreGradient.addColorStop(0.96, 'rgba(8, 145, 178, 0.35)');
      coreGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      const coreSegments = 24;
      for (let s = 0; s <= coreSegments; s++) {
        const theta = (s / coreSegments) * Math.PI * 2;
        const noiseRadius = noise2D(Math.cos(theta) * 1.8, Math.sin(theta) * 1.8 + time * 0.8);
        const rad = corePulseR + noiseRadius * 5 * vi.turbulence;
        const cx = centerX + Math.cos(theta) * rad;
        const cy = centerY + Math.sin(theta) * rad;
        if (s === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.max(2.5, (4.5 + outAmp * 4.5) * breathScale), 0, Math.PI * 2);
      ctx.fill();

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

  const getRealStatus = () => {
    if (status === 'disconnected') {
      return {
        label: 'NEURAL CORE STANDBY',
        sub: 'Tap Core to Connect with MYRAA',
        dotColor: 'bg-rose-500 shadow-rose-500/50',
      };
    }
    if (status === 'connecting') {
      return {
        label: 'SYNCHRONIZING...',
        sub: 'Establishing Gemini Live Audio Channel',
        dotColor: 'bg-amber-400 animate-pulse shadow-amber-400/50',
      };
    }
    if (status === 'reconnecting') {
      return {
        label: 'RECONNECTING NEURAL LINK',
        sub: 'Restoring Live Stream',
        dotColor: 'bg-amber-400 animate-pulse shadow-amber-400/50',
      };
    }
    if (status === 'standby') {
      return {
        label: 'STANDBY MODE',
        sub: 'Say "Hey Myraa" or tap to wake',
        dotColor: 'bg-indigo-400 shadow-indigo-400/50',
      };
    }
    if (isThinking) {
      return {
        label: 'THINKING & PROCESSING',
        sub: 'Information Flowing in Neural Network',
        dotColor: 'bg-sky-400 animate-pulse shadow-[0_0_12px_rgba(56,189,248,0.9)]',
      };
    }
    if (isSpeaking) {
      return {
        label: 'MYRAA SPEAKING',
        sub: 'Natural Voice Stream Active',
        dotColor: 'bg-cyan-300 animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.8)]',
      };
    }
    if (isListening && inputVolume > 0.05) {
      return {
        label: 'LISTENING TO CHINNA',
        sub: 'Real-time Audio Processing',
        dotColor: 'bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]',
      };
    }
    if (isListening) {
      return {
        label: 'ONLINE / ATTENTIVE',
        sub: 'Continuous Listening Active',
        dotColor: 'bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.7)]',
      };
    }
    return {
      label: 'AI CORE ONLINE',
      sub: 'Gemini Live Ready',
      dotColor: 'bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.7)]',
    };
  };

  const currentStatus = getRealStatus();

  return (
    <div
      id="myraa-quantum-neural-entity"
      className="relative flex flex-col items-center justify-center select-none"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onCoreClick}
        className="relative flex items-center justify-center cursor-pointer group"
        title="MYRAA - Quantum Neural Entity - Tap to interact"
      >
        <div className="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none transition-all duration-700 group-hover:bg-cyan-400/20" />
        <canvas
          ref={canvasRef}
          className="w-80 h-80 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] relative z-10 block"
        />
        <div className="absolute w-72 h-72 sm:w-84 sm:h-84 md:w-[380px] md:h-[380px] rounded-full border border-cyan-500/15 pointer-events-none transition-all duration-500 group-hover:border-cyan-400/30" />
      </motion.div>

      <div className="flex flex-col items-center text-center mt-1 z-10 pointer-events-none">
        <h2 className="text-2xl sm:text-3xl font-light tracking-[0.28em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 via-white to-cyan-200 drop-shadow-[0_0_16px_rgba(0,240,255,0.65)] font-sans">
          MYRAA
        </h2>
        <div className="flex items-center gap-2 mt-2 px-3.5 py-1 rounded-full bg-black/60 border border-cyan-500/25 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.15)]">
          <span className={`w-2 h-2 rounded-full ${currentStatus.dotColor}`} />
          <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-cyan-200 uppercase font-mono">
            {currentStatus.label}
          </span>
          <span className="text-cyan-600 text-[10px]">|</span>
          <span className="text-[10px] text-cyan-400/80 font-mono capitalize">
            {emotionBlend?.descriptor || dominantEmotion}
          </span>
        </div>
        <p className="text-[11px] text-cyan-300/60 mt-1 font-mono tracking-wide">
          {currentStatus.sub}
        </p>
      </div>
    </div>
  );
};
