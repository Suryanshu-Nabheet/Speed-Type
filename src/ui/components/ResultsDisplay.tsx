import React from 'react';
import { Box, Text } from 'ink';
import { TestMetrics } from '../../core/types';
import { useTheme } from './ThemeProvider';

interface Props {
  metrics: TestMetrics;
  mode: string;
  onRestart: () => void;
}

export const ResultsDisplay: React.FC<Props> = ({ metrics, mode, onRestart }) => {
  const theme = useTheme();

  // Celebrate based on performance
  const getCelebration = (): string => {
    if (metrics.wpm >= 80) return '🔥 BLAZING FAST! 🔥';
    if (metrics.wpm >= 60) return '⚡ EXCELLENT! ⚡';
    if (metrics.wpm >= 40) return '🎯 GREAT JOB! 🎯';
    if (metrics.wpm >= 20) return '👍 GOOD WORK! 👍';
    return '💪 KEEP PRACTICING! 💪';
  };

  const getGrade = (): string => {
    if (metrics.wpm >= 80 && metrics.accuracy >= 95) return 'A+';
    if (metrics.wpm >= 60 && metrics.accuracy >= 90) return 'A';
    if (metrics.wpm >= 40 && metrics.accuracy >= 85) return 'B';
    if (metrics.wpm >= 20 && metrics.accuracy >= 80) return 'C';
    return 'D';
  };

  return (
    <Box flexDirection="column" borderStyle="double" borderColor="green" padding={2}>
      {/* Celebration */}
      <Box justifyContent="center" marginBottom={1}>
        <Text color="yellow" bold>
          {getCelebration()}
        </Text>
      </Box>

      {/* Grade */}
      <Box justifyContent="center" marginBottom={2}>
        <Text color="green" bold>
          Grade: {getGrade()}
        </Text>
      </Box>

      {/* Detailed Results */}
      <Box flexDirection="row" justifyContent="space-around" marginBottom={2}>
        <Box flexDirection="column" alignItems="center">
          <Text color="green" bold>{Math.round(metrics.wpm)}</Text>
          <Text color="gray">Words/Min</Text>
        </Box>
        
        <Box flexDirection="column" alignItems="center">
          <Text color="blue" bold>{Math.round(metrics.accuracy)}%</Text>
          <Text color="gray">Accuracy</Text>
        </Box>
        
        <Box flexDirection="column" alignItems="center">
          <Text color="yellow" bold>{Math.round(metrics.cpm)}</Text>
          <Text color="gray">Chars/Min</Text>
        </Box>
        
        <Box flexDirection="column" alignItems="center">
          <Text color="cyan" bold>{Math.round(metrics.consistency)}%</Text>
          <Text color="gray">Consistency</Text>
        </Box>
      </Box>

      {/* Additional Stats */}
      <Box flexDirection="row" justifyContent="space-around" marginBottom={2}>
        <Text color="magenta">Longest Streak: {metrics.longestStreak}</Text>
        <Text color="red">Errors: {metrics.errorsCount}</Text>
        <Text color="cyan">Time: {Math.round(metrics.timeElapsed)}s</Text>
      </Box>

      {/* Actions */}
      <Box justifyContent="center" marginTop={1}>
        <Text color="gray">
          Press 'r' to restart or Ctrl+C to exit
        </Text>
      </Box>
    </Box>
  );
};