import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import { nanoid } from 'nanoid';
import { WordListManager } from '../data/WordListManager';
export class RaceServer {
    constructor() {
        this.fastify = Fastify({ logger: true });
        this.races = new Map();
        this.connections = new Map();
        this.wordListManager = new WordListManager();
        this.setupRoutes();
    }
    setupRoutes() {
        // Register WebSocket support
        this.fastify.register(websocket);
        this.fastify.register(cors);
        // WebSocket connection handler
        this.fastify.register(async (fastify) => {
            fastify.get('/ws', { websocket: true }, (connection, req) => {
                const connectionId = nanoid();
                this.connections.set(connectionId, connection);
                connection.on('message', (message) => {
                    this.handleMessage(connectionId, message.toString());
                });
                connection.on('close', () => {
                    this.connections.delete(connectionId);
                    this.handleDisconnection(connectionId);
                });
            });
        });
        // REST endpoints for server status
        this.fastify.get('/health', async () => {
            return { status: 'healthy', races: this.races.size };
        });
        this.fastify.get('/races', async () => {
            return Array.from(this.races.values()).filter(race => race.status !== 'finished');
        });
    }
    handleMessage(connectionId, message) {
        try {
            const { id, type, data } = JSON.parse(message);
            switch (type) {
                case 'CREATE_RACE':
                    this.handleCreateRace(connectionId, id, data);
                    break;
                case 'JOIN_RACE':
                    this.handleJoinRace(connectionId, id, data);
                    break;
                case 'LIST_RACES':
                    this.handleListRaces(connectionId, id, data);
                    break;
                case 'UPDATE_PROGRESS':
                    this.handleUpdateProgress(connectionId, id, data);
                    break;
                case 'FINISH_RACE':
                    this.handleFinishRace(connectionId, id, data);
                    break;
                default:
                    this.sendResponse(connectionId, id, false, `Unknown message type: ${type}`);
            }
        }
        catch (error) {
            console.error('Failed to handle message:', error);
        }
    }
    handleCreateRace(connectionId, messageId, data) {
        try {
            const raceId = nanoid(8);
            const text = this.wordListManager.generateText(data.mode || 'words', 'medium', 50);
            const race = {
                id: raceId,
                mode: data.mode || 'words',
                text,
                participants: [
                    {
                        id: data.participantId,
                        name: `Player ${data.participantId.substring(0, 6)}`,
                        progress: 0,
                        wpm: 0,
                        accuracy: 100,
                        finished: false,
                    }
                ],
                status: 'waiting',
                createdAt: new Date(),
            };
            this.races.set(raceId, race);
            this.sendResponse(connectionId, messageId, true, race);
        }
        catch (error) {
            this.sendResponse(connectionId, messageId, false, error instanceof Error ? error.message : 'Failed to create race');
        }
    }
    handleJoinRace(connectionId, messageId, data) {
        const race = this.races.get(data.raceId);
        if (!race) {
            this.sendResponse(connectionId, messageId, false, 'Race not found');
            return;
        }
        if (race.status !== 'waiting') {
            this.sendResponse(connectionId, messageId, false, 'Race has already started');
            return;
        }
        // Check if participant already in race
        const existingParticipant = race.participants.find(p => p.id === data.participantId);
        if (existingParticipant) {
            this.sendResponse(connectionId, messageId, true, race);
            return;
        }
        const participant = {
            id: data.participantId,
            name: `Player ${data.participantId.substring(0, 6)}`,
            progress: 0,
            wpm: 0,
            accuracy: 100,
            finished: false,
        };
        race.participants.push(participant);
        // Start race if we have enough participants
        if (race.participants.length >= 2) {
            race.status = 'starting';
            setTimeout(() => {
                race.status = 'active';
                race.startedAt = new Date();
                this.broadcastToRace(race.id, 'RACE_START', race);
            }, 3000);
        }
        this.sendResponse(connectionId, messageId, true, race);
        this.broadcastToRace(race.id, 'RACE_UPDATE', race);
    }
    handleListRaces(connectionId, messageId, data) {
        const availableRaces = Array.from(this.races.values()).filter(race => race.status === 'waiting' || race.status === 'starting');
        this.sendResponse(connectionId, messageId, true, availableRaces);
    }
    handleUpdateProgress(connectionId, messageId, data) {
        const race = this.races.get(data.raceId);
        if (!race) {
            this.sendResponse(connectionId, messageId, false, 'Race not found');
            return;
        }
        const participant = race.participants.find(p => p.id === data.participantId);
        if (!participant) {
            this.sendResponse(connectionId, messageId, false, 'Participant not found');
            return;
        }
        participant.progress = data.progress;
        participant.wpm = data.wpm;
        this.broadcastToRace(race.id, 'RACE_UPDATE', race);
    }
    handleFinishRace(connectionId, messageId, data) {
        const race = this.races.get(data.raceId);
        if (!race) {
            this.sendResponse(connectionId, messageId, false, 'Race not found');
            return;
        }
        const participant = race.participants.find(p => p.id === data.participantId);
        if (!participant) {
            this.sendResponse(connectionId, messageId, false, 'Participant not found');
            return;
        }
        participant.finished = true;
        participant.progress = 100;
        // Check if race is finished
        const allFinished = race.participants.every(p => p.finished);
        if (allFinished) {
            race.status = 'finished';
            race.finishedAt = new Date();
        }
        this.sendResponse(connectionId, messageId, true, { success: true });
        this.broadcastToRace(race.id, allFinished ? 'RACE_FINISH' : 'RACE_UPDATE', race);
        // Clean up finished race after some time
        if (allFinished) {
            setTimeout(() => {
                this.races.delete(race.id);
            }, 30000);
        }
    }
    handleDisconnection(connectionId) {
        // Handle participant disconnection
        // For now, we'll just log it - could implement reconnection logic
        console.log(`Connection ${connectionId} disconnected`);
    }
    sendResponse(connectionId, messageId, success, data) {
        const connection = this.connections.get(connectionId);
        if (connection) {
            const response = {
                id: messageId,
                success,
                data: success ? data : undefined,
                error: !success ? data : undefined,
            };
            connection.send(JSON.stringify(response));
        }
    }
    broadcastToRace(raceId, type, data) {
        const message = JSON.stringify({ type, data });
        // For simplicity, broadcast to all connections
        // In a real implementation, you'd track which connections are in which races
        this.connections.forEach(connection => {
            try {
                connection.send(message);
            }
            catch (error) {
                // Connection might be closed
            }
        });
    }
    async start(port = 3001) {
        try {
            await this.fastify.listen({ port, host: '0.0.0.0' });
            console.log(`Race server running on port ${port}`);
        }
        catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }
    async stop() {
        await this.fastify.close();
    }
}
