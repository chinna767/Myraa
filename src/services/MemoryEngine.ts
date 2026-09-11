/**
 * MemoryEngine
 * Persistent memory client for PROJECT MYRAA.
 * Interfaces with the backend persistent storage (/api/memories)
 * and maintains long-term contextual recall for Chinna.
 */

import { Memory, MemoryCategory } from '../types';

export class MemoryEngine {
  private memories: Memory[] = [];
  public onMemoriesUpdated: ((memories: Memory[]) => void) | null = null;

  constructor() {
    this.refreshMemories();
  }

  public async refreshMemories(): Promise<Memory[]> {
    try {
      const res = await fetch('/api/memories');
      if (res.ok) {
        const data = await res.json();
        this.memories = data.memories || [];
        if (this.onMemoriesUpdated) {
          this.onMemoriesUpdated(this.memories);
        }
      }
    } catch (err) {
      console.error('[MemoryEngine] Failed to load persistent memories:', err);
    }
    return this.memories;
  }

  public getMemories(): Memory[] {
    return [...this.memories];
  }

  public async saveExplicitMemory(data: {
    key: string;
    value: string;
    category?: MemoryCategory;
    importance?: number;
    source?: string;
  }): Promise<{ success: boolean; memory?: Memory; error?: string }> {
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: data.key,
          value: data.value,
          category: data.category || 'Important Fact',
          importance: data.importance ?? 9,
          source: data.source || 'Voice Command',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.error || 'Server error' };
      }

      const responseData = await res.json();
      await this.refreshMemories();
      return { success: true, memory: responseData.memory };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Storage write failed';
      return { success: false, error: message };
    }
  }

  public async deleteMemory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/memories/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await this.refreshMemories();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[MemoryEngine] Failed to delete memory:', err);
      return false;
    }
  }

  public search(query: string): Memory[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.memories;
    return this.memories.filter(
      (m) =>
        m.key.toLowerCase().includes(q) ||
        m.value.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  }

  public addDirectMemoryLocally(memory: Memory): void {
    const idx = this.memories.findIndex((m) => m.id === memory.id || m.key.toLowerCase() === memory.key.toLowerCase());
    if (idx >= 0) {
      this.memories[idx] = memory;
    } else {
      this.memories.unshift(memory);
    }
    if (this.onMemoriesUpdated) {
      this.onMemoriesUpdated(this.memories);
    }
  }

  public removeDirectMemoryLocally(keyOrId: string): void {
    this.memories = this.memories.filter(
      (m) => m.id !== keyOrId && m.key.toLowerCase() !== keyOrId.toLowerCase()
    );
    if (this.onMemoriesUpdated) {
      this.onMemoriesUpdated(this.memories);
    }
  }
}
