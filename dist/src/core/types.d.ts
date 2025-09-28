export interface TestOptions {
    mode: 'words' | 'sentences' | 'paragraphs' | 'quotes' | 'code';
    timeLimit: number;
    wordCount: number;
    difficulty: 'easy' | 'medium' | 'hard';
    theme: 'dark' | 'light' | 'high-contrast';
}
export interface TestMetrics {
    wpm: number;
    cpm: number;
    accuracy: number;
    consistency: number;
    streak: number;
    longestStreak: number;
    errorsCount: number;
    timeElapsed: number;
}
export interface Profile {
    id: string;
    name: string;
    createdAt: Date;
    bestWpm: number;
    bestAccuracy: number;
    testsCompleted: number;
    totalTimeTyped: number;
}
export interface TestResult {
    id: string;
    profileId: string;
    mode: string;
    wpm: number;
    cpm: number;
    accuracy: number;
    consistency: number;
    timeElapsed: number;
    errorsCount: number;
    longestStreak: number;
    completedAt: Date;
    text: string;
    replayData?: ReplayData;
}
export interface ReplayData {
    keystrokes: Keystroke[];
    text: string;
    startTime: number;
    endTime: number;
}
export interface Keystroke {
    key: string;
    timestamp: number;
    correct: boolean;
    position: number;
}
export interface RaceParticipant {
    id: string;
    name: string;
    progress: number;
    wpm: number;
    accuracy: number;
    finished: boolean;
}
export interface Race {
    id: string;
    mode: string;
    text: string;
    participants: RaceParticipant[];
    status: 'waiting' | 'starting' | 'active' | 'finished';
    createdAt: Date;
    startedAt?: Date;
    finishedAt?: Date;
}
export interface LeaderboardEntry {
    profileName: string;
    wpm: number;
    accuracy: number;
    achievedAt: Date;
    mode: string;
}
export interface Theme {
    name: string;
    colors: {
        background: string;
        text: string;
        correct: string;
        incorrect: string;
        cursor: string;
        accent: string;
        border: string;
        dim: string;
    };
}
export interface Config {
    theme: string;
    soundEnabled: boolean;
    keyboardLayout: string;
    showWpmInRealTime: boolean;
    highlightErrors: boolean;
    autoSave: boolean;
    cloudSyncEnabled: boolean;
}
//# sourceMappingURL=types.d.ts.map