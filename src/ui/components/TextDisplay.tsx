import React from 'react';
import { Box, Text } from 'ink';
import { TypingEngine } from '../../core/TypingEngine';
import { useTheme } from './ThemeProvider';

interface Props {
  engine: TypingEngine;
  showCursor: boolean;
}

export const TextDisplay: React.FC<Props> = ({ engine, showCursor }) => {
  const theme = useTheme();
  const text = engine.getText();
  const currentPosition = engine.getCurrentPosition();
  
  // Split text into chunks for rendering
  const renderText = (): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    const chunkSize = 80; // Characters per line
    
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.substring(i, Math.min(i + chunkSize, text.length));
      const chunkElements: JSX.Element[] = [];
      
      for (let j = 0; j < chunk.length; j++) {
        const globalPosition = i + j;
        const charData = engine.getCharacterAtPosition(globalPosition);
        
        let color = 'white';
        let backgroundColor: string | undefined = undefined;
        
        switch (charData.status) {
          case 'correct':
            color = 'green';
            break;
          case 'incorrect':
            color = 'red';
            backgroundColor = 'redBright';
            break;
          case 'cursor':
            if (showCursor) {
              color = 'black';
              backgroundColor = 'yellow';
            }
            break;
          case 'untyped':
            color = 'gray';
            break;
        }
        
        chunkElements.push(
          <Text
            key={globalPosition}
            color={color}
            backgroundColor={backgroundColor}
          >
            {charData.char === ' ' ? '·' : charData.char}
          </Text>
        );
      }
      
      elements.push(
        <Box key={i}>
          {chunkElements}
        </Box>
      );
    }
    
    return elements;
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor="gray"
      padding={1}
      minHeight={8}
    >
      {renderText()}
    </Box>
  );
};