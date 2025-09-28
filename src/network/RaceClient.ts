import WebSocket from 'ws';
import { nanoid } from 'nanoid';
import { Race, RaceParticipant } from '../core/types';

export interface RaceOptions {
  mode: string;
  isPrivate: boolean;
}

export class RaceClient {
  private ws: WebSocket | null = null;
  private serverUrl = 'ws://localhost:3001';
  private participantId = nanoid();
  private callbacks = new Map<string, (data: any) => void>();

  async connect(): Promise<void> {
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
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      });
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  async createRace(options: RaceOptions): Promise<Race> {
    return this.sendMessage('CREATE_RACE', {
      participantId: this.participantId,
      ...options,
    });
  }

  async joinRace(raceId: string): Promise<Race> {
    return this.sendMessage('JOIN_RACE', {
      raceId,
      participantId: this.participantId,
    });
  }

  async listRaces(): Promise<Race[]> {
    return this.sendMessage('LIST_RACES', {});
  }

  async updateProgress(raceId: string, progress: number, wpm: number): Promise<void> {
    this.sendMessage('UPDATE_PROGRESS', {
      raceId,
      participantId: this.participantId,
      progress,
      wpm,
    });
  }

  async finishRace(raceId: string, finalTime: number): Promise<void> {
    this.sendMessage('FINISH_RACE', {
      raceId,
      participantId: this.participantId,
      finalTime,
    });
  }

  onRaceUpdate(callback: (race: Race) => void): void {
    this.callbacks.set('RACE_UPDATE', callback);
  }

  onRaceStart(callback: (race: Race) => void): void {
    this.callbacks.set('RACE_START', callback);
  }

  onRaceFinish(callback: (race: Race) => void): void {
    this.callbacks.set('RACE_FINISH', callback);
  }

  private sendMessage(type: string, data: any): Promise<any> {
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
      const responseHandler = (responseData: any): void => {
        if (responseData.success) {
          resolve(responseData.data);
        } else {
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

  private handleMessage(message: any): void {
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