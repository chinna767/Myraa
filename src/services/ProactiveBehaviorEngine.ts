/**
 * ProactiveBehaviorEngine
 * Evaluates session context, idle duration, and work intervals
 * to gently initiate meaningful, warm check-ins with Chinna.
 */

export class ProactiveBehaviorEngine {
  private enabled = true;
  private intervalMinutes = 25; // Pomodoro style or work interval
  private lastInteractionTime = Date.now();
  private lastProactiveTime = 0;
  private timer: number | null = null;

  public onProactiveInitiate: ((message: string) => void) | null = null;

  constructor(enabled = true, intervalMinutes = 25) {
    this.enabled = enabled;
    this.intervalMinutes = intervalMinutes;
    this.startMonitor();
  }

  public registerUserActivity(): void {
    this.lastInteractionTime = Date.now();
  }

  public setConfig(enabled: boolean, intervalMinutes: number): void {
    this.enabled = enabled;
    this.intervalMinutes = intervalMinutes;
  }

  private startMonitor(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    // Check every 60 seconds
    this.timer = window.setInterval(() => {
      if (!this.enabled) return;

      const now = Date.now();
      const minutesSinceInteraction = (now - this.lastInteractionTime) / (1000 * 60);
      const minutesSinceLastProactive = (now - this.lastProactiveTime) / (1000 * 60);

      // Require at least intervalMinutes of continuous presence and cooldown
      if (
        minutesSinceInteraction >= this.intervalMinutes &&
        minutesSinceLastProactive >= this.intervalMinutes
      ) {
        this.triggerContextualCheckIn();
      }
    }, 60000);
  }

  private triggerContextualCheckIn(): void {
    this.lastProactiveTime = Date.now();
    const prompts = [
      "Chinna, you've been at this for a while. Take five minutes before your brain files a complaint.",
      "Still fighting that code, Chinna? Remember to grab some water and stretch.",
      "You've been focused for quite a bit. Don't forget to take a breather, Chinna.",
    ];
    const message = prompts[Math.floor(Math.random() * prompts.length)];
    if (this.onProactiveInitiate) {
      this.onProactiveInitiate(message);
    }
  }

  public destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
