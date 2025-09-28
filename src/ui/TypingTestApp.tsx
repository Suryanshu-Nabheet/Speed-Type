import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import { TypingEngine } from '../core/TypingEngine';
import { WordListManager } from '../data/WordListManager';
import { ProfileManager } from '../data/ProfileManager';
import { StatsManager } from '../data/StatsManager';
import { TestOptions, TestMetrics } from '../core/types';
import { ProgressBar } from './components/ProgressBar';
import { MetricsDisplay } from './components/MetricsDisplay';
import { TextDisplay } from './components/TextDisplay';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ThemeProvider } from './components/ThemeProvider';

interface Props {
  options: TestOptions;
}

export const TypingTestApp: React.FC<Props> = ({ options }) => {
  const [engine, setEngine] = useState<TypingEngine | null>(null);
  const [metrics, setMetrics] = useState<TestMetrics | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [testText, setTestText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(options.timeLimit);
  
  const profileManager = new ProfileManager();
  const statsManager = new StatsManager();
  const wordListManager = new WordListManager();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize test
  useEffect(() => {
    initializeTest();
  }, []);

  // Timer effect
  useEffect(() => {
    if (startTime && !isFinished) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, options.timeLimit - elapsed);
        setTimeLeft(remaining);

        if (remaining === 0) {
          finishTest();
        }
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime, isFinished]);

  // Update metrics periodically
  useEffect(() => {
    if (engine && startTime && !isFinished) {
      const interval = setInterval(() => {
        setMetrics(engine.getCurrentMetrics());
      }, 100);

      return () => clearInterval(interval);
    }
  }, [engine, startTime, isFinished]);

  const initializeTest = async (): Promise<void> => {
    try {
      const text = wordListManager.generateText(
        options.mode,
        options.difficulty,
        options.wordCount
      );
      
      setTestText(text);
      const typingEngine = new TypingEngine(text);
      setEngine(typingEngine);
      setMetrics(typingEngine.getCurrentMetrics());
    } catch (error) {
      console.error('Failed to initialize test:', error);
    }
  };

  const finishTest = async (): Promise<void> => {
    if (!engine || isFinished) return;

    setIsFinished(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const finalMetrics = engine.getCurrentMetrics();
    setMetrics(finalMetrics);

    // Save results
    try {
      const currentProfile = await profileManager.getCurrentProfile();
      if (currentProfile) {
        const testResult = await statsManager.saveTestResult(currentProfile.id, {
          mode: options.mode,
          wpm: finalMetrics.wpm,
          cpm: finalMetrics.cpm,
          accuracy: finalMetrics.accuracy,
          consistency: finalMetrics.consistency,
          timeElapsed: finalMetrics.timeElapsed,
          errorsCount: finalMetrics.errorsCount,
          longestStreak: finalMetrics.longestStreak,
          text: testText,
          replayData: engine.getReplayData(),
        });

        // Update profile stats
        await profileManager.updateProfileStats(currentProfile.id, {
          wpm: finalMetrics.wpm,
          accuracy: finalMetrics.accuracy,
          testsCompleted: 1,
          totalTimeTyped: finalMetrics.timeElapsed,
        });
      }
    } catch (error) {
      console.error('Failed to save test results:', error);
    }
  };

  useInput((input, key) => {
    if (!engine || isFinished) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    let keyPressed = input;
    
    // Handle special keys
    if (key.backspace) keyPressed = 'Backspace';
    else if (key.return) keyPressed = 'Enter';
    else if (input === ' ') keyPressed = 'Space';

    const wasCorrect = engine.processKeystroke(keyPressed);
    
    // Update metrics
    setMetrics(engine.getCurrentMetrics());

    // Check if test is finished by completion
    if (engine.isTestFinished()) {
      finishTest();
    }
  });

  if (!engine || !metrics) {
    return (
      <ThemeProvider theme={options.theme}>
        <Box justifyContent="center" alignItems="center" height={10}>
          <Text color="cyan">Loading Speed Type...</Text>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={options.theme}>
      <Box flexDirection="column" padding={2}>
        {/* Header */}
        <Box justifyContent="center" marginBottom={1}>
          <Text bold color="cyan">⚡ Speed Type</Text>
        </Box>

        {/* Timer and Progress */}
        <Box justifyContent="space-between" marginBottom={1}>
          <Text color="yellow">Time: {timeLeft}s</Text>
          <Text color="green">Mode: {options.mode}</Text>
        </Box>

        <Box marginBottom={2}>
          <ProgressBar progress={engine.getProgress()} />
        </Box>

        {/* Metrics */}
        <Box marginBottom={2}>
          <MetricsDisplay metrics={metrics} />
        </Box>

        {/* Text Display */}
        <Box marginBottom={2}>
          <TextDisplay
            engine={engine}
            showCursor={!isFinished}
          />
        </Box>

        {/* Results (if finished) */}
        {isFinished && (
          <ResultsDisplay
            metrics={metrics}
            mode={options.mode}
            onRestart={() => {
              setIsFinished(false);
              setStartTime(null);
              setTimeLeft(options.timeLimit);
              initializeTest();
            }}
          />
        )}

        {/* Instructions */}
        {!startTime && (
          <Box justifyContent="center" marginTop={1}>
            <Text color="gray">Start typing to begin the test...</Text>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};