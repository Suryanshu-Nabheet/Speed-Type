import { DatabaseManager } from './Database';
export class ConfigManager {
    constructor() {
        this.db = DatabaseManager.getInstance().getDatabase();
        this.cache = new Map();
        this.loadCache();
    }
    async get(key, defaultValue) {
        if (this.cache.has(key)) {
            const value = this.cache.get(key);
            return this.deserializeValue(value, defaultValue);
        }
        const row = this.db.prepare(`
      SELECT value FROM config WHERE key = ?
    `).get(key);
        if (row) {
            this.cache.set(key, row.value);
            return this.deserializeValue(row.value, defaultValue);
        }
        return defaultValue;
    }
    async set(key, value) {
        const serializedValue = this.serializeValue(value);
        this.db.prepare(`
      INSERT OR REPLACE INTO config (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(key, serializedValue);
        this.cache.set(key, serializedValue);
    }
    async delete(key) {
        this.db.prepare(`
      DELETE FROM config WHERE key = ?
    `).run(key);
        this.cache.delete(key);
    }
    async getAll() {
        const rows = this.db.prepare(`
      SELECT key, value FROM config
    `).all();
        const result = {};
        rows.forEach(row => {
            result[row.key] = this.deserializeValue(row.value);
        });
        return result;
    }
    async getConfig() {
        const config = {};
        config.theme = await this.get('theme', 'dark');
        config.soundEnabled = await this.get('soundEnabled', true);
        config.keyboardLayout = await this.get('keyboardLayout', 'qwerty');
        config.showWpmInRealTime = await this.get('showWpmInRealTime', true);
        config.highlightErrors = await this.get('highlightErrors', true);
        config.autoSave = await this.get('autoSave', true);
        config.cloudSyncEnabled = await this.get('cloudSyncEnabled', false);
        return config;
    }
    async updateConfig(updates) {
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                await this.set(key, value);
            }
        }
    }
    loadCache() {
        const rows = this.db.prepare(`
      SELECT key, value FROM config
    `).all();
        rows.forEach(row => {
            this.cache.set(row.key, row.value);
        });
    }
    serializeValue(value) {
        if (typeof value === 'string') {
            return value;
        }
        return JSON.stringify(value);
    }
    deserializeValue(value, defaultValue) {
        // Try to parse as JSON first
        try {
            return JSON.parse(value);
        }
        catch {
            // If parsing fails, return as string
            return value;
        }
    }
}
