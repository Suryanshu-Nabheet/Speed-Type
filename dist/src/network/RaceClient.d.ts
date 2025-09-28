import { Race } from '../core/types';
export interface RaceOptions {
    mode: string;
    isPrivate: boolean;
}
export declare class RaceClient {
    private ws;
    private serverUrl;
    private participantId;
    private callbacks;
    connect(): Promise<void>;
    disconnect(): void;
    createRace(options: RaceOptions): Promise<Race>;
    joinRace(raceId: string): Promise<Race>;
    listRaces(): Promise<Race[]>;
    updateProgress(raceId: string, progress: number, wpm: number): Promise<void>;
    finishRace(raceId: string, finalTime: number): Promise<void>;
    onRaceUpdate(callback: (race: Race) => void): void;
    onRaceStart(callback: (race: Race) => void): void;
    onRaceFinish(callback: (race: Race) => void): void;
    private sendMessage;
    private handleMessage;
}
//# sourceMappingURL=RaceClient.d.ts.map