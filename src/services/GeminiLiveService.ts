/**
 * GeminiLiveService
 * Manages WebSocket communication with the backend Gemini Live service.
 * Handles bidirectional audio streaming, real-time events,
 * and memory/tool synchronizations.
 */

import { ConnectionStatus, Memory, MyraaLanguage, EmotionBlend } from '../types';

export interface GeminiLiveCallbacks {
  onStatusChange?: (status: ConnectionStatus) => void;
  onAudioChunk?: (base64Pcm: string) => void;
  onTranscription?: (role: 'user' | 'model', text: string, isFinal?: boolean) => void;
  onInterrupted?: () => void;
  onTurnComplete?: () => void;
  onMemorySaved?: (memory: Memory) => void;
  onMemoryDeleted?: (key: string) => void;
  onToolExecuted?: (action: string, details: string) => void;
  onError?: (error: string) => void;
}

export class GeminiLiveService {
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private callbacks: GeminiLiveCallbacks = {};
  private selectedVoice = 'Zephyr';
  private selectedLanguage: MyraaLanguage = 'Telugu + English';
  private customApiKey?: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimeout: number | null = null;
  private intentionallyClosed = false;
  private pendingTextQueue: string[] = [];

  constructor(callbacks: GeminiLiveCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: GeminiLiveCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public connect(
    voice = 'Zephyr',
    language: MyraaLanguage = 'Telugu + English',
    customApiKey?: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // If already connected, resolve immediately
      if (this.ws && this.ws.readyState === WebSocket.OPEN && this.status === 'connected') {
        resolve();
        return;
      }

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      // Close previous instance if still hanging
      if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
        try {
          this.ws.close();
        } catch {
          // ignore
        }
      }

      this.selectedVoice = voice;
      this.selectedLanguage = language;
      if (customApiKey !== undefined) {
        this.customApiKey = customApiKey;
      }

      this.intentionallyClosed = false;
      this.updateStatus('connecting');

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[GeminiLiveService] WebSocket connected to server');
          this.reconnectAttempts = 0;

          // Send initialization message to start Gemini Live session with voice & language
          const initPayload: Record<string, unknown> = {
            type: 'init',
            voice: this.selectedVoice,
            language: this.selectedLanguage,
          };
          if (this.customApiKey) {
            initPayload.apiKey = this.customApiKey;
          }
          this.ws?.send(JSON.stringify(initPayload));
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            switch (data.type) {
              case 'session_ready':
                console.log('[GeminiLiveService] Gemini Live session ready');
                this.updateStatus('connected');
                if (this.pendingTextQueue.length > 0) {
                  const queued = [...this.pendingTextQueue];
                  this.pendingTextQueue = [];
                  setTimeout(() => {
                    for (const prompt of queued) {
                      this.sendText(prompt);
                    }
                  }, 200);
                }
                resolve();
                break;
              case 'audio':
                if (data.pcm && this.callbacks.onAudioChunk) {
                  this.callbacks.onAudioChunk(data.pcm);
                }
                break;
              case 'transcription':
                if (this.callbacks.onTranscription) {
                  this.callbacks.onTranscription(data.role, data.text, data.isFinal);
                }
                break;
              case 'interrupted':
                console.log('[GeminiLiveService] Interrupted signal received');
                if (this.callbacks.onInterrupted) {
                  this.callbacks.onInterrupted();
                }
                break;
              case 'turn_complete':
                if (this.callbacks.onTurnComplete) {
                  this.callbacks.onTurnComplete();
                }
                break;
              case 'memory_saved':
                console.log('[GeminiLiveService] Memory saved:', data.memory);
                if (this.callbacks.onMemorySaved) {
                  this.callbacks.onMemorySaved(data.memory);
                }
                break;
              case 'memory_deleted':
                console.log('[GeminiLiveService] Memory deleted:', data.key);
                if (this.callbacks.onMemoryDeleted) {
                  this.callbacks.onMemoryDeleted(data.key);
                }
                break;
              case 'tool_executed':
                console.log('[GeminiLiveService] Tool executed:', data.action, data.details);
                if (this.callbacks.onToolExecuted) {
                  this.callbacks.onToolExecuted(data.action, data.details);
                }
                break;
              case 'error':
                console.warn('[GeminiLiveService] Notice from server:', data.message);
                if (this.callbacks.onError) {
                  this.callbacks.onError(data.message);
                }
                break;
              default:
                break;
            }
          } catch (err) {
            console.warn('[GeminiLiveService] Notice parsing message:', err);
          }
        };

        this.ws.onerror = () => {
          console.warn('[GeminiLiveService] WebSocket connection notice (readyState:', this.ws?.readyState, ')');
          if (this.status !== 'connected' && this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.updateStatus('error');
            if (this.callbacks.onError) {
              this.callbacks.onError('Unable to establish real-time audio connection');
            }
            reject(new Error('Unable to establish real-time audio connection'));
          }
        };

        this.ws.onclose = (event) => {
          console.log('[GeminiLiveService] WebSocket connection closed (code:', event.code, ')');
          if (!this.intentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.updateStatus('reconnecting');
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 5000);
            this.reconnectTimeout = window.setTimeout(() => {
              this.connect(this.selectedVoice, this.selectedLanguage).catch(() => {});
            }, delay);
          } else if (!this.intentionallyClosed) {
            this.updateStatus('error');
            if (this.callbacks.onError) {
              this.callbacks.onError('Connection closed. Tap Reconnect to resume.');
            }
          } else {
            this.updateStatus('disconnected');
          }
        };
      } catch (err) {
        this.updateStatus('error');
        reject(err);
      }
    });
  }

  public setLanguage(language: MyraaLanguage): void {
    this.selectedLanguage = language;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'change_language',
          language,
        })
      );
    }
  }

  public setVoice(voice: string): void {
    this.selectedVoice = voice;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'change_voice',
          voice,
        })
      );
    }
  }

  public getLanguage(): MyraaLanguage {
    return this.selectedLanguage;
  }

  public getVoice(): string {
    return this.selectedVoice;
  }

  private sendSafe(payload: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
        this.ws.send(text);
      } catch (err) {
        console.warn('[GeminiLiveService] Failed to send over websocket:', err);
      }
    }
  }

  public sendAudio(base64Pcm: string): void {
    if (this.status === 'connected') {
      this.sendSafe({
        type: 'audio',
        pcm: base64Pcm,
      });
    }
  }

  public sendText(text: string): void {
    if (this.status === 'connected' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendSafe({
        type: 'text',
        text,
      });
    } else {
      this.pendingTextQueue.push(text);
    }
  }

  public sendEmotionUpdate(blend: EmotionBlend): void {
    this.sendSafe({
      type: 'emotion_update',
      blend,
    });
  }

  public setApiKey(apiKey: string): void {
    this.customApiKey = apiKey;
    this.sendSafe({
      type: 'set_api_key',
      apiKey,
    });
  }

  public interrupt(): void {
    this.sendSafe({
      type: 'interrupt',
    });
  }

  public disconnect(): void {
    this.intentionallyClosed = true;
    this.pendingTextQueue = [];
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateStatus('disconnected');
  }

  private updateStatus(newStatus: ConnectionStatus): void {
    this.status = newStatus;
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange(newStatus);
    }
  }
}
