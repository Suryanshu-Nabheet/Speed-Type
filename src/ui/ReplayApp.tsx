import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { StatsManager } from '../data/StatsManager';
import { TestResult, Keystroke } from '../core/types';
import { ThemeProvider } from './components/ThemeProvider';

interface Props {
  code: string;
  options?: {
    share?: boolean;
  };
}

export const ReplayApp: React.FC<Props> = ({ code, options }) => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replayPosition, setReplayPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const statsManager = new StatsManager();

  useEffect(() => {
    loadReplay();
  }, []);

  const loadReplay = async (): Promise<void> => {
    try {
      const result = await statsManager.getReplayByShareCode(code);
      if (!result) {
        setError('Replay not found');
        return;
      }

      if (!result.replayData) {
        setError('Replay data not available');
        return;
      }

      setTestResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load replay');
    } finally {
      setLoading(false);
    }
  };

  const startReplay = (): void => {
    if (!testResult?.replayData) return;
    
    setIsPlaying(true);
    setReplayPosition(0);
    
    const keystrokes = testResult.replayData.keystrokes;
    const startTime = testResult.replayData.startTime;
    
    let currentIndex = 0;
    
    const playNextKeystroke = (): void => {
      if (currentIndex >= keystrokes.length) {
        setIsPlaying(false);
        return;
      }
      
      const keystroke = keystrokes[currentIndex];
      const delay = currentIndex === 0 
        ? 0 
        : (keystrokes[currentIndex].timestamp - keystrokes[currentIndex - 1].timestamp) / playbackSpeed;
      
      setTimeout(() => {
        setReplayPosition(keystroke.position);
        currentIndex++;
        
        if (currentIndex < keystrokes.length) {
          playNextKeystroke();
        } else {
          setIsPlaying(false);
        }
      }, delay);
    };
    
    playNextKeystroke();
  };

  const generateShareCode = async (): Promise<void> => {
    if (!testResult) return;
    
    try {
      const shareCode = await statsManager.createReplayShare(testResult.id);
      console.log(`Share code: ${shareCode}`);
    } catch (err) {
      setError('Failed to generate share code');
    }
  };

  useInput((input, key) => {
    if (input === 'q') {
      process.exit(0);
    }
    
    if (input === ' ' && !isPlaying) {
      startReplay();
    }
    
    if (input === 's' && options?.share) {
      generateShareCode();
    }
    
    if (key.upArrow) {
      setPlaybackSpeed(Math.min(5, playbackSpeed + 0.25));
    }
    
    if (key.downArrow) {
      setPlaybackSpeed(Math.max(0.25, playbackSpeed - 0.25));
    }
  });

  if (loading) {
    return (
      <ThemeProvider theme="dark">
        <Box justifyContent="center" alignItems="center" height={10}>
          <Text color="cyan">Loading replay...</Text>
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme="dark">
        <Box flexDirection="column" alignItems="center" padding={2}>
          <Text color="red" bold>Error: {error}</Text>
          <Text color="gray" marginTop={1}>Press 'q' to exit</Text>
        </Box>
      </ThemeProvider>
    );
  }

  if (!testResult) {
    return (
      <ThemeProvider theme="dark">
        <Box justifyContent="center" alignItems="center" height={10}>
          <Text color="red">No replay data available</Text>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme="dark">
      <Box flexDirection="column" padding={2}>
        {/* Header */}
        <Box justifyContent="center" marginBottom={1}>
          <Text color="cyan" bold>📹 Replay Viewer</Text>
        </Box>

        {/* Test Info */}
        <Box flexDirection="row" justifyContent="space-around" marginBottom={2}>
          <Text color="green">WPM: {Math.round(testResult.wpm)}</Text>
          <Text color="blue">Accuracy: {Math.round(testResult.accuracy)}%</Text>
          <Text color="yellow">Mode: {testResult.mode}</Text>
          <Text color="magenta">Speed: {playbackSpeed}x</Text>
        </Box>

        {/* Text Display with Progress */}
        <Box 
          flexDirection="column" 
          borderStyle="single" 
          borderColor="gray" 
          padding={1} 
          minHeight={8}
          marginBottom={2}
        >
          {testResult.text.split('').map((char, index) => {
            let color = 'gray';
            
            if (index < replayPosition) {
              // Find the keystroke for this position
              const keystroke = testResult.replayData?.keystrokes.find(k => k.position === index);
              color = keystroke?.correct ? 'green' : 'red';
            } else if (index === replayPosition) {
              color = 'yellow';
            }
            
            return (
              <Text key={index} color={color}>
                {char === ' ' ? '·' : char}
              </Text>
            );
          })}
        </Box>

        {/* Controls */}
        <Box flexDirection="column" alignItems="center">
          <Text color="gray" marginBottom={1}>
            {isPlaying ? '▶️ Playing...' : '⏸️ Paused'}
          </Text>
          
          <Text color="gray" marginBottom={1}>
            Progress: {Math.round((replayPosition / testResult.text.length) * 100)}%
          </Text>
          
          <Box flexDirection="column" alignItems="center" marginTop={1}>
            <Text color="gray">Controls:</Text>
            <Text color="gray">Space - Play/Pause</Text>
            <Text color="gray">↑/↓ - Adjust speed</Text>
            {options?.share && <Text color="gray">S - Generate share code</Text>}
            <Text color="gray">Q - Exit</Text>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};