import WebSocket from 'ws';
import { nanoid } from 'nanoid';
export class RaceClient {
    constructor() {
        this.ws = null;
        this.serverUrl = 'ws://localhost:3001';
        this.participantId = nanoid();
        this.callbacks = new Map();
    }
    async connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.serverUrl);
            this.ws.on('open', () => {
                resolve();
            });
            this.ws.on('error', (error) => {
                reject(error);
            });
            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleMessage(message);
                }
                catch (error) {
                    console.error('Failed to parse message:', error);
                }
            });
        });
    }
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
    async createRace(options) {
        return this.sendMessage('CREATE_RACE', {
            participantId: this.participantId,
            ...options,
        });
    }
    async joinRace(raceId) {
        return this.sendMessage('JOIN_RACE', {
            raceId,
            participantId: this.participantId,
        });
    }
    async listRaces() {
        return this.sendMessage('LIST_RACES', {});
    }
    async updateProgress(raceId, progress, wpm) {
        this.sendMessage('UPDATE_PROGRESS', {
            raceId,
            participantId: this.participantId,
            progress,
            wpm,
        });
    }
    async finishRace(raceId, finalTime) {
        this.sendMessage('FINISH_RACE', {
            raceId,
            participantId: this.participantId,
            finalTime,
        });
    }
    onRaceUpdate(callback) {
        this.callbacks.set('RACE_UPDATE', callback);
    }
    onRaceStart(callback) {
        this.callbacks.set('RACE_START', callback);
    }
    onRaceFinish(callback) {
        this.callbacks.set('RACE_FINISH', callback);
    }
    sendMessage(type, data) {
        return new Promise((resolve, reject) => {
            if (!this.ws) {
                reject(new Error('Not connected to server'));
                return;
            }
            const messageId = nanoid();
            const message = {
                id: messageId,
                type,
                data,
            };
            // Set up response handler
            const responseHandler = (responseData) => {
                if (responseData.success) {
                    resolve(responseData.data);
                }
                else {
                    reject(new Error(responseData.error || 'Unknown error'));
                }
                this.callbacks.delete(`response_${messageId}`);
            };
            this.callbacks.set(`response_${messageId}`, responseHandler);
            // Send message
            this.ws.send(JSON.stringify(message));
            // Set timeout for response
            setTimeout(() => {
                if (this.callbacks.has(`response_${messageId}`)) {
                    this.callbacks.delete(`response_${messageId}`);
                    reject(new Error('Request timeout'));
                }
            }, 10000);
        });
    }
    handleMessage(message) {
        const { id, type, data } = message;
        // Handle responses to requests
        if (id && this.callbacks.has(`response_${id}`)) {
            const callback = this.callbacks.get(`response_${id}`);
            if (callback) {
                callback(data);
            }
            return;
        }
        // Handle broadcast messages
        if (this.callbacks.has(type)) {
            const callback = this.callbacks.get(type);
            if (callback) {
                callback(data);
            }
        }
    }
}
