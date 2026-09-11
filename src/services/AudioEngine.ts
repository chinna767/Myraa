/**
 * AudioEngine
 * Manages 16kHz microphone capture, PCM conversion,
 * 24kHz model audio playback with gapless scheduling,
 * real-time frequency analysis for visualization,
 * and immediate barge-in / interruption handling.
 */

export class AudioEngine {
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private micStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private inputAnalyser: AnalyserNode | null = null;
  private outputAnalyser: AnalyserNode | null = null;
  private nextStartTime = 0;
  private activeSourceNodes: AudioBufferSourceNode[] = [];
  private isListening = false;
  private isSpeaking = false;
  private volume = 1.0;
  private speechStartedAt = 0;
  private consecutiveBargeInHits = 0;
  private bargeInThreshold = 0.065; // Balanced RMS threshold to prevent speaker bleed self-interruption

  public onAudioChunk: ((base64Pcm: string) => void) | null = null;
  public onBargeIn: (() => void) | null = null;
  public onActivityChange: ((isListening: boolean, isSpeaking: boolean) => void) | null = null;

  constructor() {
    // Audio contexts will be initialized on first user gesture
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.outputAudioCtx) {
      try {
        this.gainNode.gain.setValueAtTime(this.volume, this.outputAudioCtx.currentTime);
      } catch {
        this.gainNode.gain.value = this.volume;
      }
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public async startMicrophone(bargeInThreshold = 0.065): Promise<void> {
    this.bargeInThreshold = bargeInThreshold;
    if (this.isListening) return;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported by this browser environment.');
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (e: any) {
        // If device has constraint restrictions, fallback to simple audio request
        if (
          e.name === 'OverconstrainedError' ||
          e.name === 'ConstraintNotSatisfiedError' ||
          e.name === 'TypeError'
        ) {
          console.warn('[AudioEngine] Strict audio constraints rejected, falling back to standard audio stream');
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
          throw e;
        }
      }

      this.micStream = stream;

      // Initialize AudioContext safely
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      try {
        this.inputAudioCtx = new AudioContextClass({ sampleRate: 16000 });
      } catch {
        this.inputAudioCtx = new AudioContextClass();
      }

      if (this.inputAudioCtx.state === 'suspended') {
        await this.inputAudioCtx.resume();
      }

      const source = this.inputAudioCtx.createMediaStreamSource(this.micStream);
      this.inputAnalyser = this.inputAudioCtx.createAnalyser();
      this.inputAnalyser.fftSize = 256;
      this.inputAnalyser.smoothingTimeConstant = 0.3;

      // ScriptProcessorNode for raw PCM capture
      this.scriptProcessor = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);
      this.scriptProcessor.onaudioprocess = (e) => {
        const inputBuffer = e.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        const currentSampleRate = inputBuffer.sampleRate;

        // Calculate RMS volume level
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);

        // Safe Barge-in detection:
        // Prevent MYRAA from interrupting herself via speaker echo by enforcing:
        // 1. A 350ms grace period after MYRAA speech starts
        // 2. Requiring at least 3 consecutive frames above threshold
        const now = Date.now();
        if (this.isSpeaking && (now - this.speechStartedAt > 350) && rms > this.bargeInThreshold) {
          this.consecutiveBargeInHits++;
          if (this.consecutiveBargeInHits >= 3) {
            console.log('[AudioEngine] Confirmed barge-in! User speech RMS:', rms);
            this.consecutiveBargeInHits = 0;
            this.interrupt();
            if (this.onBargeIn) {
              this.onBargeIn();
            }
          }
        } else {
          this.consecutiveBargeInHits = Math.max(0, this.consecutiveBargeInHits - 1);
        }

        // Downsample inputData to 16kHz PCM regardless of browser hardware rate
        const pcm16 = this.downsampleTo16k(inputData, currentSampleRate);
        // Convert to Base64
        const base64 = this.arrayBufferToBase64(pcm16.buffer);

        if (this.onAudioChunk) {
          this.onAudioChunk(base64);
        }
      };

      source.connect(this.inputAnalyser);
      this.inputAnalyser.connect(this.scriptProcessor);

      // Connect to destination to keep scriptProcessor running in all browsers
      const silentGain = this.inputAudioCtx.createGain();
      silentGain.gain.value = 0;
      this.scriptProcessor.connect(silentGain);
      silentGain.connect(this.inputAudioCtx.destination);

      this.isListening = true;
      this.notifyActivity();
    } catch (err) {
      console.error('[AudioEngine] Failed to start microphone:', err);
      throw err;
    }
  }

  public stopMicrophone(): void {
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.inputAnalyser) {
      this.inputAnalyser.disconnect();
      this.inputAnalyser = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.inputAudioCtx) {
      this.inputAudioCtx.close().catch(() => {});
      this.inputAudioCtx = null;
    }
    this.isListening = false;
    this.notifyActivity();
  }

  public async playAudioChunk(base64Pcm: string): Promise<void> {
    try {
      if (!this.outputAudioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        // Use native hardware context sample rate to avoid browser NotSupportedError
        this.outputAudioCtx = new AudioContextClass();
        this.gainNode = this.outputAudioCtx.createGain();
        this.gainNode.gain.value = this.volume;

        this.outputAnalyser = this.outputAudioCtx.createAnalyser();
        this.outputAnalyser.fftSize = 256;
        this.outputAnalyser.smoothingTimeConstant = 0.5;

        this.gainNode.connect(this.outputAnalyser);
        this.outputAnalyser.connect(this.outputAudioCtx.destination);
      }

      if (this.outputAudioCtx.state === 'suspended') {
        await this.outputAudioCtx.resume();
      }

      const pcmBytes = this.base64ToArrayBuffer(base64Pcm);
      const int16Array = new Int16Array(pcmBytes);

      // Convert 16-bit PCM to Float32
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      // Create AudioBuffer at 24000Hz (Gemini Live output format)
      // Web Audio automatically and seamlessly resamples this to native hardware rate
      const audioBuffer = this.outputAudioCtx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.copyToChannel(float32Array, 0);

      const sourceNode = this.outputAudioCtx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(this.gainNode!);

      // Gapless scheduling
      const currentTime = this.outputAudioCtx.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }
      sourceNode.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;

      if (!this.isSpeaking) {
        this.speechStartedAt = Date.now();
      }
      this.activeSourceNodes.push(sourceNode);
      this.isSpeaking = true;
      this.notifyActivity();

      sourceNode.onended = () => {
        const index = this.activeSourceNodes.indexOf(sourceNode);
        if (index > -1) {
          this.activeSourceNodes.splice(index, 1);
        }
        if (this.activeSourceNodes.length === 0) {
          this.isSpeaking = false;
          this.notifyActivity();
        }
      };
    } catch (err) {
      console.error('[AudioEngine] Error playing audio chunk:', err);
    }
  }

  /**
   * Resamples float32 input from inputSampleRate down to 16000Hz 16-bit PCM
   */
  private downsampleTo16k(inputData: Float32Array, inputSampleRate: number): Int16Array {
    if (inputSampleRate === 16000) {
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      return pcm16;
    }

    const ratio = inputSampleRate / 16000;
    const newLength = Math.max(1, Math.round(inputData.length / ratio));
    const pcm16 = new Int16Array(newLength);
    let offsetResult = 0;
    let offsetInput = 0;

    while (offsetResult < newLength) {
      const nextOffsetInput = Math.round((offsetResult + 1) * ratio);
      let accum = 0;
      let count = 0;
      for (let i = offsetInput; i < nextOffsetInput && i < inputData.length; i++) {
        accum += inputData[i];
        count++;
      }
      const sample = count > 0 ? accum / count : 0;
      const s = Math.max(-1, Math.min(1, sample));
      pcm16[offsetResult] = s < 0 ? s * 0x8000 : s * 0x7fff;
      offsetResult++;
      offsetInput = nextOffsetInput;
    }

    return pcm16;
  }

  /**
   * Immediate interruption: stop all currently playing audio chunks
   * and reset scheduled playback times
   */
  public interrupt(): void {
    for (const source of this.activeSourceNodes) {
      try {
        source.stop(0);
        source.disconnect();
      } catch {
        // Ignore errors from already stopped nodes
      }
    }
    this.activeSourceNodes = [];
    if (this.outputAudioCtx) {
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
    this.isSpeaking = false;
    this.notifyActivity();
  }

  public getInputFrequencyData(dataArray: Uint8Array): void {
    if (this.inputAnalyser && this.isListening) {
      this.inputAnalyser.getByteFrequencyData(dataArray);
    } else {
      dataArray.fill(0);
    }
  }

  public getOutputFrequencyData(dataArray: Uint8Array): void {
    if (this.outputAnalyser && this.isSpeaking) {
      this.outputAnalyser.getByteFrequencyData(dataArray);
    } else {
      dataArray.fill(0);
    }
  }

  public getInputVolume(): number {
    if (!this.inputAnalyser || !this.isListening) return 0;
    const array = new Uint8Array(this.inputAnalyser.frequencyBinCount);
    this.inputAnalyser.getByteFrequencyData(array);
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i];
    }
    return sum / (array.length * 255);
  }

  public getOutputVolume(): number {
    if (!this.outputAnalyser || !this.isSpeaking) return 0;
    const array = new Uint8Array(this.outputAnalyser.frequencyBinCount);
    this.outputAnalyser.getByteFrequencyData(array);
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i];
    }
    return sum / (array.length * 255);
  }

  public getSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getListening(): boolean {
    return this.isListening;
  }

  private notifyActivity(): void {
    if (this.onActivityChange) {
      this.onActivityChange(this.isListening, this.isSpeaking);
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  public destroy(): void {
    this.interrupt();
    this.stopMicrophone();
    if (this.outputAudioCtx) {
      this.outputAudioCtx.close().catch(() => {});
      this.outputAudioCtx = null;
    }
  }
}
