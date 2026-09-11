/**
 * WakeWordEngine
 * Lightweight wake-word detector using Web Speech API.
 * Detects "Hey Myraa" and "Myraa" in standby mode without heavy CPU loops.
 */

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

export class WakeWordEngine {
  private recognition: any = null;
  private isListening = false;
  private enabled = true;
  public onWakeWordDetected: (() => void) | null = null;
  public onError: ((err: string) => void) | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition(): void {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[WakeWordEngine] SpeechRecognition is not supported in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.toLowerCase().trim();
          console.log('[WakeWordEngine] Heard:', transcript);

          // Check for wake words
          if (
            transcript.includes('hey myraa') ||
            transcript.includes('myraa') ||
            transcript.includes('hey myra') ||
            transcript.includes('myra') ||
            transcript.includes('hey mira') ||
            transcript.includes('mira') ||
            transcript.includes('hey mara') ||
            transcript.includes('mara')
          ) {
            console.log('[WakeWordEngine] Wake word recognized!');
            if (this.onWakeWordDetected) {
              this.onWakeWordDetected();
            }
            break;
          }
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Ignore normal aborts or no-speech events
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('[WakeWordEngine] Recognition error:', event.error);
          if (this.onError) {
            this.onError(event.error);
          }
        }
      };

      this.recognition.onend = () => {
        // Debounce restart if still in listening mode to prevent rapid-fire loops
        if (this.isListening && this.enabled) {
          setTimeout(() => {
            if (this.isListening && this.enabled && this.recognition) {
              try {
                this.recognition.start();
              } catch {
                // Ignore if already running or state not ready
              }
            }
          }, 300);
        }
      };
    } catch (e) {
      console.error('[WakeWordEngine] Initialization error:', e);
    }
  }

  public start(): void {
    if (!this.recognition || this.isListening || !this.enabled) return;
    try {
      this.isListening = true;
      this.recognition.start();
      console.log('[WakeWordEngine] Started listening for wake word...');
    } catch (err) {
      console.warn('[WakeWordEngine] Could not start recognition:', err);
    }
  }

  public stop(): void {
    if (!this.recognition || !this.isListening) return;
    try {
      this.isListening = false;
      this.recognition.stop();
      console.log('[WakeWordEngine] Stopped wake word detector');
    } catch (err) {
      console.warn('[WakeWordEngine] Could not stop recognition:', err);
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled && this.isListening) {
      this.stop();
    }
  }

  public isSupported(): boolean {
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public destroy(): void {
    this.stop();
    this.recognition = null;
  }
}
