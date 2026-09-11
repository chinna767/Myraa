import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  isListening: boolean;
  isSpeaking: boolean;
  getInputData: (dataArray: Uint8Array) => void;
  getOutputData: (dataArray: Uint8Array) => void;
  primaryColor?: string;
  secondaryColor?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isListening,
  isSpeaking,
  getInputData,
  getOutputData,
  primaryColor = '#38bdf8', // Electric Sky for Chinna
  secondaryColor = '#00f0ff', // Pure Cyan for MYRAA
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = 64;
    const inputData = new Uint8Array(bufferLength);
    const outputData = new Uint8Array(bufferLength);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isListening) {
        getInputData(inputData);
      } else {
        inputData.fill(0);
      }

      if (isSpeaking) {
        getOutputData(outputData);
      } else {
        outputData.fill(0);
      }

      const barWidth = (canvas.width / bufferLength) * 0.75;
      const gap = (canvas.width / bufferLength) * 0.25;
      const centerY = canvas.height / 2;

      for (let i = 0; i < bufferLength; i++) {
        // Compute input (Chinna) bar height and output (MYRAA) bar height
        const inVal = isListening ? inputData[i] / 255 : 0;
        const outVal = isSpeaking ? outputData[i] / 255 : 0;

        // Choose dominant signal
        const activeVal = outVal > 0.05 ? outVal : inVal;
        const color = outVal > 0.05 ? secondaryColor : primaryColor;
        const barHeight = Math.max(2, activeVal * (canvas.height * 0.85));

        const x = i * (barWidth + gap);
        const y = centerY - barHeight / 2;

        ctx.fillStyle = activeVal > 0.05 ? color : 'rgba(0, 240, 255, 0.08)';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isListening, isSpeaking, getInputData, getOutputData, primaryColor, secondaryColor]);

  return (
    <div id="myraa-audio-waveform-wrapper" className="w-full flex flex-col items-center">
      <div className="w-full max-w-sm h-8 px-3 py-1 rounded-full bg-black/60 border border-cyan-500/20 backdrop-blur-md flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.08)]">
        <canvas
          ref={canvasRef}
          width={320}
          height={26}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
