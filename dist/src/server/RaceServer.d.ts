export declare class RaceServer {
    private fastify;
    private races;
    private connections;
    private wordListManager;
    constructor();
    private setupRoutes;
    private handleMessage;
    private handleCreateRace;
    private handleJoinRace;
    private handleListRaces;
    private handleUpdateProgress;
    private handleFinishRace;
    private handleDisconnection;
    private sendResponse;
    private broadcastToRace;
    start(port?: number): Promise<void>;
    stop(): Promise<void>;
}
//# sourceMappingURL=RaceServer.d.ts.map