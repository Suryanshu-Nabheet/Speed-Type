import { TestResult } from '../core/types';
export declare class StatsManager {
    private db;
    saveTestResult(profileId: string, result: Omit<TestResult, 'id' | 'profileId' | 'completedAt'>): Promise<TestResult>;
    getTestResult(id: string): Promise<TestResult | null>;
    getProfileStats(profileId: string): Promise<{
        testsCompleted: number;
        bestWpm: number;
        averageWpm: number;
        bestAccuracy: number;
        averageAccuracy: number;
        bestCpm: number;
        totalTimeTyped: number;
        totalCharacters: number;
        longestStreak: number;
    }>;
    getRecentTests(profileId: string, limit?: number): Promise<TestResult[]>;
    getTestsByMode(profileId: string, mode: string): Promise<TestResult[]>;
    getBestResults(profileId: string, mode?: string): Promise<{
        bestWpm: TestResult | null;
        bestAccuracy: TestResult | null;
        mostConsistent: TestResult | null;
    }>;
    createReplayShare(testResultId: string): Promise<string>;
    getReplayByShareCode(shareCode: string): Promise<TestResult | null>;
    private mapRowToTestResult;
}
//# sourceMappingURL=StatsManager.d.ts.map