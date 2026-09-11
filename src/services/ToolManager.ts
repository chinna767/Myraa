/**
 * ToolManager & SafetyManager
 * Provides modular tools for MYRAA with approval and safety checks.
 */

import {
  getCurrentIndiaTime,
  getCurrentIndiaDate,
} from './IndiaTimeAndFestivalService';

export interface ToolResult {
  success: boolean;
  message: string;
  data?: unknown;
}

export class ToolManager {
  private notes: Array<{ id: string; text: string; time: string }> = [];
  private reminders: Array<{ id: string; text: string; dueTime: string }> = [];

  public onConfirmationRequired: ((toolName: string, description: string, onConfirm: () => void) => void) | null = null;
  public onToolNotification: ((title: string, message: string) => void) | null = null;
  public onOpenCalendar: (() => void) | null = null;

  public async executeTool(action: string, details: string): Promise<ToolResult> {
    console.log('[ToolManager] Executing tool:', action, details);

    switch (action) {
      case 'show_calendar': {
        if (this.onOpenCalendar) {
          this.onOpenCalendar();
        }
        this.notify('Indian Calendar Opened', 'Viewing Indian Standard Time & Festivals');
        return {
          success: true,
          message: 'Opened Calendar and Indian Festival guide',
        };
      }

      case 'get_time':
      case 'get_current_india_time_and_date': {
        const time = getCurrentIndiaTime();
        const date = getCurrentIndiaDate();
        return {
          success: true,
          message: `Current IST time is ${time.formatted12}, ${date.formattedFull}`,
          data: { time, date },
        };
      }
      case 'take_note': {
        const note = {
          id: `note_${Date.now()}`,
          text: details,
          time: new Date().toLocaleTimeString(),
        };
        this.notes.unshift(note);
        this.notify('Note Saved', details);
        return {
          success: true,
          message: `Note saved: "${details}"`,
          data: note,
        };
      }

      case 'set_reminder': {
        const reminder = {
          id: `rem_${Date.now()}`,
          text: details,
          dueTime: new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString(),
        };
        this.reminders.unshift(reminder);
        this.notify('Reminder Set', details);
        return {
          success: true,
          message: `Reminder set for ${reminder.dueTime}: "${details}"`,
          data: reminder,
        };
      }

      case 'open_url': {
        // Safe check for valid URL or predefined apps
        let targetUrl = details;
        if (!details.startsWith('http')) {
          if (details.toLowerCase().includes('github')) {
            targetUrl = 'https://github.com';
          } else if (details.toLowerCase().includes('vscode') || details.toLowerCase().includes('code')) {
            targetUrl = 'https://vscode.dev';
          } else {
            targetUrl = `https://www.google.com/search?q=${encodeURIComponent(details)}`;
          }
        }

        // Require confirmation if opening an arbitrary link
        return new Promise((resolve) => {
          if (this.onConfirmationRequired) {
            this.onConfirmationRequired('Open Web Link', `Open ${targetUrl} in a new tab?`, () => {
              window.open(targetUrl, '_blank', 'noopener,noreferrer');
              resolve({
                success: true,
                message: `Opened ${targetUrl}`,
              });
            });
          } else {
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
            resolve({
              success: true,
              message: `Opened ${targetUrl}`,
            });
          }
        });
      }

      case 'check_status': {
        let batteryInfo = 'Unknown';
        try {
          if ('getBattery' in navigator) {
            const battery: any = await (navigator as any).getBattery();
            batteryInfo = `${Math.round(battery.level * 100)}% (${battery.charging ? 'Charging' : 'Discharging'})`;
          }
        } catch {
          // ignore
        }

        const info = {
          currentTime: new Date().toLocaleTimeString(),
          currentDate: new Date().toLocaleDateString(),
          online: navigator.onLine,
          battery: batteryInfo,
        };

        return {
          success: true,
          message: `Time: ${info.currentTime}, Battery: ${info.battery}, Online: ${info.online}`,
          data: info,
        };
      }

      default:
        return {
          success: false,
          message: `Unknown companion action: ${action}`,
        };
    }
  }

  public getNotes() {
    return [...this.notes];
  }

  public getReminders() {
    return [...this.reminders];
  }

  private notify(title: string, message: string): void {
    if (this.onToolNotification) {
      this.onToolNotification(title, message);
    }
  }
}
