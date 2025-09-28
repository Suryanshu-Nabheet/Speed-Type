import { nanoid } from 'nanoid';
import { DatabaseManager } from './Database';
import { Profile } from '../core/types';

export class ProfileManager {
  private db = DatabaseManager.getInstance().getDatabase();

  async createProfile(name: string): Promise<Profile> {
    const id = nanoid();
    const createdAt = new Date();

    try {
      this.db.prepare(`
        INSERT INTO profiles (id, name, created_at)
        VALUES (?, ?, ?)
      `).run(id, name, createdAt.toISOString());

      // Set as current profile if it's the first one
      const profileCount = this.db.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number };
      if (profileCount.count === 1) {
        await this.setCurrentProfile(id);
      }

      return {
        id,
        name,
        createdAt,
        bestWpm: 0,
        bestAccuracy: 0,
        testsCompleted: 0,
        totalTimeTyped: 0,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('UNIQUE')) {
        throw new Error(`Profile '${name}' already exists`);
      }
      throw error;
    }
  }

  async getProfileByName(name: string): Promise<Profile | null> {
    const row = this.db.prepare(`
      SELECT * FROM profiles WHERE name = ?
    `).get(name) as any;

    if (!row) return null;

    return this.mapRowToProfile(row);
  }

  async getProfileById(id: string): Promise<Profile | null> {
    const row = this.db.prepare(`
      SELECT * FROM profiles WHERE id = ?
    `).get(id) as any;

    if (!row) return null;

    return this.mapRowToProfile(row);
  }

  async getAllProfiles(): Promise<Profile[]> {
    const rows = this.db.prepare(`
      SELECT * FROM profiles ORDER BY created_at ASC
    `).all() as any[];

    return rows.map(row => this.mapRowToProfile(row));
  }

  async deleteProfile(name: string): Promise<void> {
    const profile = await this.getProfileByName(name);
    if (!profile) {
      throw new Error(`Profile '${name}' not found`);
    }

    // Check if this is the current profile
    const currentProfile = await this.getCurrentProfile();
    const isCurrentProfile = currentProfile?.id === profile.id;

    this.db.prepare(`
      DELETE FROM profiles WHERE id = ?
    `).run(profile.id);

    // If we deleted the current profile, clear the current session
    if (isCurrentProfile) {
      this.db.prepare(`
        DELETE FROM current_session WHERE key = 'current_profile_id'
      `).run();
    }
  }

  async switchProfile(name: string): Promise<void> {
    const profile = await this.getProfileByName(name);
    if (!profile) {
      throw new Error(`Profile '${name}' not found`);
    }

    await this.setCurrentProfile(profile.id);
  }

  async getCurrentProfile(): Promise<Profile | null> {
    const row = this.db.prepare(`
      SELECT value FROM current_session WHERE key = 'current_profile_id'
    `).get() as { value: string } | undefined;

    if (!row) return null;

    return this.getProfileById(row.value);
  }

  async updateProfileStats(profileId: string, stats: {
    wpm?: number;
    accuracy?: number;
    testsCompleted?: number;
    totalTimeTyped?: number;
  }): Promise<void> {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (stats.wpm !== undefined) {
      updateFields.push('best_wpm = MAX(best_wpm, ?)');
      values.push(stats.wpm);
    }

    if (stats.accuracy !== undefined) {
      updateFields.push('best_accuracy = MAX(best_accuracy, ?)');
      values.push(stats.accuracy);
    }

    if (stats.testsCompleted !== undefined) {
      updateFields.push('tests_completed = tests_completed + ?');
      values.push(stats.testsCompleted);
    }

    if (stats.totalTimeTyped !== undefined) {
      updateFields.push('total_time_typed = total_time_typed + ?');
      values.push(stats.totalTimeTyped);
    }

    if (updateFields.length === 0) return;

    values.push(profileId);

    this.db.prepare(`
      UPDATE profiles SET ${updateFields.join(', ')} WHERE id = ?
    `).run(...values);
  }

  private async setCurrentProfile(profileId: string): Promise<void> {
    this.db.prepare(`
      INSERT OR REPLACE INTO current_session (key, value)
      VALUES ('current_profile_id', ?)
    `).run(profileId);
  }

  private mapRowToProfile(row: any): Profile {
    return {
      id: row.id,
      name: row.name,
      createdAt: new Date(row.created_at),
      bestWpm: row.best_wpm || 0,
      bestAccuracy: row.best_accuracy || 0,
      testsCompleted: row.tests_completed || 0,
      totalTimeTyped: row.total_time_typed || 0,
    };
  }
}