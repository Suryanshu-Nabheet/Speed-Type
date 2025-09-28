import React from 'react';
import { Box, Text } from 'ink';
import { TestMetrics } from '../../core/types';
import { useTheme } from './ThemeProvider';

interface Props {
  metrics: TestMetrics;
}

export const MetricsDisplay: React.FC<Props> = ({ metrics }) => {
  const theme = useTheme();

  return (
    <Box flexDirection="row" justifyContent="space-around">
      <Box flexDirection="column" alignItems="center">
        <Text color="green" bold>{Math.round(metrics.wpm)}</Text>
        <Text color="gray">WPM</Text>
      </Box>
      
      <Box flexDirection="column" alignItems="center">
        <Text color="blue" bold>{Math.round(metrics.accuracy)}%</Text>
        <Text color="gray">Accuracy</Text>
      </Box>
      
      <Box flexDirection="column" alignItems="center">
        <Text color="yellow" bold>{Math.round(metrics.cpm)}</Text>
        <Text color="gray">CPM</Text>
      </Box>
      
      <Box flexDirection="column" alignItems="center">
        <Text color="magenta" bold>{metrics.streak}</Text>
        <Text color="gray">Streak</Text>
      </Box>
      
      <Box flexDirection="column" alignItems="center">
        <Text color="cyan" bold>{Math.round(metrics.consistency)}%</Text>
        <Text color="gray">Consistency</Text>
      </Box>
    </Box>
  );
};