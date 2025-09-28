import { DatabaseManager } from '../data/Database';
export class LeaderboardManager {
    constructor() {
        this.db = DatabaseManager.getInstance().getDatabase();
    }
    async getLeaderboard(options) {
        if (options.type === 'global') {
            // For now, return empty array - would connect to global server
            return [];
        }
        return this.getLocalLeaderboard(options);
    }
    async getLocalLeaderboard(options) {
        let whereClause = '';
        const params = [];
        // Filter by mode
        if (options.mode) {
            whereClause += 'WHERE tr.mode = ?';
            params.push(options.mode);
        }
        // Filter by timeframe
        if (options.timeframe && options.timeframe !== 'all') {
            const timeClause = this.getTimeframeClause(options.timeframe);
            whereClause += whereClause ? ` AND ${timeClause}` : `WHERE ${timeClause}`;
        }
        const limit = options.limit || 10;
        const query = `
      SELECT 
        p.name as profileName,
        tr.wpm,
        tr.accuracy,
        tr.completed_at as achievedAt,
        tr.mode
      FROM test_results tr
      JOIN profiles p ON tr.profile_id = p.id
      ${whereClause}
      ORDER BY tr.wpm DESC, tr.accuracy DESC
      LIMIT ?
    `;
        params.push(limit);
        const rows = this.db.prepare(query).all(...params);
        return rows.map(row => ({
            profileName: row.profileName,
            wpm: row.wpm,
            accuracy: row.accuracy,
            achievedAt: new Date(row.achievedAt),
            mode: row.mode,
        }));
    }
    async getPersonalBest(profileId, mode) {
        let whereClause = 'WHERE tr.profile_id = ?';
        const params = [profileId];
        if (mode) {
            whereClause += ' AND tr.mode = ?';
            params.push(mode);
        }
        const query = `
      SELECT 
        p.name as profileName,
        tr.wpm,
        tr.accuracy,
        tr.completed_at as achievedAt,
        tr.mode
      FROM test_results tr
      JOIN profiles p ON tr.profile_id = p.id
      ${whereClause}
      ORDER BY tr.wpm DESC
      LIMIT 1
    `;
        const row = this.db.prepare(query).get(...params);
        if (!row)
            return null;
        return {
            profileName: row.profileName,
            wpm: row.wpm,
            accuracy: row.accuracy,
            achievedAt: new Date(row.achievedAt),
            mode: row.mode,
        };
    }
    async getRanking(profileId, mode) {
        const personalBest = await this.getPersonalBest(profileId, mode);
        if (!personalBest) {
            return { rank: 0, total: 0, percentile: 0 };
        }
        let whereClause = '';
        const params = [];
        if (mode) {
            whereClause = 'WHERE mode = ?';
            params.push(mode);
        }
        // Count total unique profiles with results
        const totalQuery = `
      SELECT COUNT(DISTINCT profile_id) as total
      FROM test_results
      ${whereClause}
    `;
        const totalResult = this.db.prepare(totalQuery).get(...params);
        // Count profiles with better WPM
        const betterWpmQuery = `
      SELECT COUNT(DISTINCT profile_id) as count
      FROM test_results
      ${whereClause ? `${whereClause} AND` : 'WHERE'} wpm > ?
    `;
        params.push(personalBest.wpm);
        const betterResult = this.db.prepare(betterWpmQuery).get(...params);
        const rank = betterResult.count + 1;
        const total = totalResult.total;
        const percentile = total > 0 ? Math.round(((total - rank) / total) * 100) : 0;
        return { rank, total, percentile };
    }
    getTimeframeClause(timeframe) {
        const now = new Date();
        let startDate;
        switch (timeframe) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                return '';
        }
        return `tr.completed_at >= '${startDate.toISOString()}'`;
    }
}
