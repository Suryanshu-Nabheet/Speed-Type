import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from './ThemeProvider';

interface Props {
  progress: number;
  width?: number;
}

export const ProgressBar: React.FC<Props> = ({ progress, width = 50 }) => {
  const theme = useTheme();
  const filledWidth = Math.round((progress / 100) * width);
  const emptyWidth = width - filledWidth;

  const filledBar = '█'.repeat(filledWidth);
  const emptyBar = '░'.repeat(emptyWidth);

  return (
    <Box flexDirection="column">
      <Box>
        <Text color="green">{filledBar}</Text>
        <Text color="gray">{emptyBar}</Text>
      </Box>
      <Box justifyContent="center" marginTop={1}>
        <Text color="cyan">{Math.round(progress)}% Complete</Text>
      </Box>
    </Box>
  );
};