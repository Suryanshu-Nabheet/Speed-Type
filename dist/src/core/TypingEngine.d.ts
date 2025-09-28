import { TestMetrics, ReplayData } from './types';
export declare class TypingEngine {
    private text;
    private currentPosition;
    private startTime;
    private keystrokes;
    private errors;
    private currentStreak;
    private longestStreak;
    private isStarted;
    private isFinished;
    constructor(text: string);
    reset(): void;
    processKeystroke(key: string): boolean;
    getCurrentMetrics(): TestMetrics;
    private calculateConsistency;
    getProgress(): number;
    getCurrentPosition(): number;
    getText(): string;
    getTypedText(): string;
    getRemainingText(): string;
    isTestFinished(): boolean;
    isTestStarted(): boolean;
    getReplayData(): ReplayData;
    getCharacterAtPosition(position: number): {
        char: string;
        status: 'untyped' | 'correct' | 'incorrect' | 'cursor';
    };
}
//# sourceMappingURL=TypingEngine.d.ts.map