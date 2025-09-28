import { LeaderboardEntry } from '../core/types';
export interface LeaderboardOptions {
    mode?: string;
    type: 'local' | 'global';
    limit?: number;
    timeframe?: 'all' | 'today' | 'week' | 'month';
}
export declare class LeaderboardManager {
    private db;
    getLeaderboard(options: LeaderboardOptions): Promise<LeaderboardEntry[]>;
    private getLocalLeaderboard;
    getPersonalBest(profileId: string, mode?: string): Promise<LeaderboardEntry | null>;
    getRanking(profileId: string, mode?: string): Promise<{
        rank: number;
        total: number;
        percentile: number;
    }>;
    private getTimeframeClause;
}
//# sourceMappingURL=LeaderboardManager.d.ts.map