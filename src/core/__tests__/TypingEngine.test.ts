import { TypingEngine } from '../TypingEngine';

describe('TypingEngine', () => {
  let engine: TypingEngine;
  const testText = 'hello world';

  beforeEach(() => {
    engine = new TypingEngine(testText);
  });

  describe('initialization', () => {
    it('should initialize with correct text', () => {
      expect(engine.getText()).toBe(testText);
      expect(engine.getCurrentPosition()).toBe(0);
      expect(engine.isTestStarted()).toBe(false);
      expect(engine.isTestFinished()).toBe(false);
    });

    it('should have initial metrics', () => {
      const metrics = engine.getCurrentMetrics();
      expect(metrics.wpm).toBe(0);
      expect(metrics.accuracy).toBe(100);
      expect(metrics.streak).toBe(0);
    });
  });

  describe('keystroke processing', () => {
    it('should handle correct keystrokes', () => {
      const wasCorrect = engine.processKeystroke('h');
      expect(wasCorrect).toBe(true);
      expect(engine.getCurrentPosition()).toBe(1);
      expect(engine.isTestStarted()).toBe(true);
    });

    it('should handle incorrect keystrokes', () => {
      const wasCorrect = engine.processKeystroke('x');
      expect(wasCorrect).toBe(false);
      expect(engine.getCurrentPosition()).toBe(0);
    });

    it('should handle backspace', () => {
      engine.processKeystroke('h');
      engine.processKeystroke('e');
      expect(engine.getCurrentPosition()).toBe(2);
      
      engine.processKeystroke('Backspace');
      expect(engine.getCurrentPosition()).toBe(1);
    });

    it('should handle space key', () => {
      // Type 'hello'
      'hello'.split('').forEach(char => engine.processKeystroke(char));
      
      const wasCorrect = engine.processKeystroke('Space');
      expect(wasCorrect).toBe(true);
      expect(engine.getCurrentPosition()).toBe(6);
    });
  });

  describe('progress tracking', () => {
    it('should track progress correctly', () => {
      expect(engine.getProgress()).toBe(0);
      
      // Type half the text
      'hello '.split('').forEach(char => {
        if (char === ' ') {
          engine.processKeystroke('Space');
        } else {
          engine.processKeystroke(char);
        }
      });
      
      const progress = engine.getProgress();
      expect(progress).toBeCloseTo(54.5, 1); // 6 out of 11 characters
    });

    it('should finish test when complete', () => {
      testText.split('').forEach(char => {
        if (char === ' ') {
          engine.processKeystroke('Space');
        } else {
          engine.processKeystroke(char);
        }
      });
      
      expect(engine.isTestFinished()).toBe(true);
      expect(engine.getProgress()).toBe(100);
    });
  });

  describe('metrics calculation', () => {
    it('should calculate accuracy correctly', () => {
      // Type correct characters
      engine.processKeystroke('h');
      engine.processKeystroke('e');
      
      let metrics = engine.getCurrentMetrics();
      expect(metrics.accuracy).toBe(100);
      
      // Type incorrect character
      engine.processKeystroke('x'); // Should be 'l'
      
      metrics = engine.getCurrentMetrics();
      expect(metrics.accuracy).toBeCloseTo(66.67, 1);
    });

    it('should track streak correctly', () => {
      engine.processKeystroke('h');
      engine.processKeystroke('e');
      
      let metrics = engine.getCurrentMetrics();
      expect(metrics.streak).toBe(2);
      
      engine.processKeystroke('x'); // incorrect
      
      metrics = engine.getCurrentMetrics();
      expect(metrics.streak).toBe(0);
      expect(metrics.longestStreak).toBe(2);
    });
  });

  describe('character status', () => {
    it('should return correct character status', () => {
      const charData = engine.getCharacterAtPosition(0);
      expect(charData.char).toBe('h');
      expect(charData.status).toBe('cursor');
      
      engine.processKeystroke('h');
      
      const typedChar = engine.getCharacterAtPosition(0);
      expect(typedChar.status).toBe('correct');
      
      const nextChar = engine.getCharacterAtPosition(1);
      expect(nextChar.status).toBe('cursor');
    });
  });

  describe('replay data', () => {
    it('should generate replay data', () => {
      engine.processKeystroke('h');
      engine.processKeystroke('e');
      
      const replayData = engine.getReplayData();
      expect(replayData.keystrokes).toHaveLength(2);
      expect(replayData.text).toBe(testText);
      expect(replayData.startTime).toBeDefined();
    });
  });
});