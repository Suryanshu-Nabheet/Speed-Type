import { nanoid } from 'nanoid';
import { DatabaseManager } from './Database';
export class StatsManager {
    constructor() {
        this.db = DatabaseManager.getInstance().getDatabase();
    }
    async saveTestResult(profileId, result) {
        const id = nanoid();
        const completedAt = new Date();
        const testResult = {
            id,
            profileId,
            completedAt,
            ...result,
        };
        this.db.prepare(`
      INSERT INTO test_results (
        id, profile_id, mode, wpm, cpm, accuracy, consistency,
        time_elapsed, errors_count, longest_streak, completed_at,
        text, replay_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, profileId, result.mode, result.wpm, result.cpm, result.accuracy, result.consistency, result.timeElapsed, result.errorsCount, result.longestStreak, completedAt.toISOString(), result.text, result.replayData ? JSON.stringify(result.replayData) : null);
        return testResult;
    }
    async getTestResult(id) {
        const row = this.db.prepare(`
      SELECT * FROM test_results WHERE id = ?
    `).get(id);
        if (!row)
            return null;
        return this.mapRowToTestResult(row);
    }
    async getProfileStats(profileId) {
        const stats = this.db.prepare(`
      SELECT 
        COUNT(*) as tests_completed,
        MAX(wpm) as best_wpm,
        AVG(wpm) as average_wpm,
        MAX(accuracy) as best_accuracy,
        AVG(accuracy) as average_accuracy,
        MAX(cpm) as best_cpm,
        SUM(time_elapsed) as total_time_typed,
        SUM(LENGTH(text) - errors_count) as total_characters,
        MAX(longest_streak) as longest_streak
      FROM test_results 
      WHERE profile_id = ?
    `).get(profileId);
        return {
            testsCompleted: stats.tests_completed || 0,
            bestWpm: stats.best_wpm || 0,
            averageWpm: stats.average_wpm || 0,
            bestAccuracy: stats.best_accuracy || 0,
            averageAccuracy: stats.average_accuracy || 0,
            bestCpm: stats.best_cpm || 0,
            totalTimeTyped: stats.total_time_typed || 0,
            totalCharacters: stats.total_characters || 0,
            longestStreak: stats.longest_streak || 0,
        };
    }
    async getRecentTests(profileId, limit = 10) {
        const rows = this.db.prepare(`
      SELECT * FROM test_results 
      WHERE profile_id = ? 
      ORDER BY completed_at DESC 
      LIMIT ?
    `).all(profileId, limit);
        return rows.map(row => this.mapRowToTestResult(row));
    }
    async getTestsByMode(profileId, mode) {
        const rows = this.db.prepare(`
      SELECT * FROM test_results 
      WHERE profile_id = ? AND mode = ?
      ORDER BY completed_at DESC
    `).all(profileId, mode);
        return rows.map(row => this.mapRowToTestResult(row));
    }
    async getBestResults(profileId, mode) {
        const whereClause = mode ? 'WHERE profile_id = ? AND mode = ?' : 'WHERE profile_id = ?';
        const params = mode ? [profileId, mode] : [profileId];
        const bestWpmRow = this.db.prepare(`
      SELECT * FROM test_results 
      ${whereClause}
      ORDER BY wpm DESC 
      LIMIT 1
    `).get(...params);
        const bestAccuracyRow = this.db.prepare(`
      SELECT * FROM test_results 
      ${whereClause}
      ORDER BY accuracy DESC 
      LIMIT 1
    `).get(...params);
        const mostConsistentRow = this.db.prepare(`
      SELECT * FROM test_results 
      ${whereClause}
      ORDER BY consistency DESC 
      LIMIT 1
    `).get(...params);
        return {
            bestWpm: bestWpmRow ? this.mapRowToTestResult(bestWpmRow) : null,
            bestAccuracy: bestAccuracyRow ? this.mapRowToTestResult(bestAccuracyRow) : null,
            mostConsistent: mostConsistentRow ? this.mapRowToTestResult(mostConsistentRow) : null,
        };
    }
    async createReplayShare(testResultId) {
        const shareCode = nanoid(12);
        this.db.prepare(`
      INSERT INTO replay_shares (share_code, test_result_id)
      VALUES (?, ?)
    `).run(shareCode, testResultId);
        return shareCode;
    }
    async getReplayByShareCode(shareCode) {
        const row = this.db.prepare(`
      SELECT tr.* FROM test_results tr
      JOIN replay_shares rs ON tr.id = rs.test_result_id
      WHERE rs.share_code = ?
    `).get(shareCode);
        if (!row)
            return null;
        return this.mapRowToTestResult(row);
    }
    mapRowToTestResult(row) {
        return {
            id: row.id,
            profileId: row.profile_id,
            mode: row.mode,
            wpm: row.wpm,
            cpm: row.cpm,
            accuracy: row.accuracy,
            consistency: row.consistency,
            timeElapsed: row.time_elapsed,
            errorsCount: row.errors_count,
            longestStreak: row.longest_streak,
            completedAt: new Date(row.completed_at),
            text: row.text,
            replayData: row.replay_data ? JSON.parse(row.replay_data) : undefined,
        };
    }
}
