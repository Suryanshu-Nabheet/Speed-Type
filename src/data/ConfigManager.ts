import { DatabaseManager } from './Database';
import { Config } from '../core/types';

export class ConfigManager {
  private db = DatabaseManager.getInstance().getDatabase();
  private cache: Map<string, string> = new Map();

  constructor() {
    this.loadCache();
  }

  async get<T = string>(key: string, defaultValue?: T): Promise<T | undefined> {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      return this.deserializeValue(value, defaultValue);
    }

    const row = this.db.prepare(`
      SELECT value FROM config WHERE key = ?
    `).get(key) as { value: string } | undefined;

    if (row) {
      this.cache.set(key, row.value);
      return this.deserializeValue(row.value, defaultValue);
    }

    return defaultValue;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const serializedValue = this.serializeValue(value);
    
    this.db.prepare(`
      INSERT OR REPLACE INTO config (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(key, serializedValue);

    this.cache.set(key, serializedValue);
  }

  async delete(key: string): Promise<void> {
    this.db.prepare(`
      DELETE FROM config WHERE key = ?
    `).run(key);

    this.cache.delete(key);
  }

  async getAll(): Promise<Record<string, any>> {
    const rows = this.db.prepare(`
      SELECT key, value FROM config
    `).all() as { key: string; value: string }[];

    const result: Record<string, any> = {};
    rows.forEach(row => {
      result[row.key] = this.deserializeValue(row.value);
    });

    return result;
  }

  async getConfig(): Promise<Partial<Config>> {
    const config: Partial<Config> = {};
    
    config.theme = await this.get('theme', 'dark');
    config.soundEnabled = await this.get('soundEnabled', true);
    config.keyboardLayout = await this.get('keyboardLayout', 'qwerty');
    config.showWpmInRealTime = await this.get('showWpmInRealTime', true);
    config.highlightErrors = await this.get('highlightErrors', true);
    config.autoSave = await this.get('autoSave', true);
    config.cloudSyncEnabled = await this.get('cloudSyncEnabled', false);

    return config;
  }

  async updateConfig(updates: Partial<Config>): Promise<void> {
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        await this.set(key, value);
      }
    }
  }

  private loadCache(): void {
    const rows = this.db.prepare(`
      SELECT key, value FROM config
    `).all() as { key: string; value: string }[];

    rows.forEach(row => {
      this.cache.set(row.key, row.value);
    });
  }

  private serializeValue<T>(value: T): string {
    if (typeof value === 'string') {
      return value;
    }
    return JSON.stringify(value);
  }

  private deserializeValue<T>(value: string, defaultValue?: T): any {
    // Try to parse as JSON first
    try {
      return JSON.parse(value);
    } catch {
      // If parsing fails, return as string
      return value;
    }
  }
}