import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from './ThemeProvider';
export const TextDisplay = ({ engine, showCursor }) => {
    const theme = useTheme();
    const text = engine.getText();
    const currentPosition = engine.getCurrentPosition();
    // Split text into chunks for rendering
    const renderText = () => {
        const elements = [];
        const chunkSize = 80; // Characters per line
        for (let i = 0; i < text.length; i += chunkSize) {
            const chunk = text.substring(i, Math.min(i + chunkSize, text.length));
            const chunkElements = [];
            for (let j = 0; j < chunk.length; j++) {
                const globalPosition = i + j;
                const charData = engine.getCharacterAtPosition(globalPosition);
                let color = 'white';
                let backgroundColor = undefined;
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
                chunkElements.push(React.createElement(Text, { key: globalPosition, color: color, backgroundColor: backgroundColor }, charData.char === ' ' ? '·' : charData.char));
            }
            elements.push(React.createElement(Box, { key: i }, chunkElements));
        }
        return elements;
    };
    return (React.createElement(Box, { flexDirection: "column", borderStyle: "single", borderColor: "gray", padding: 1, minHeight: 8 }, renderText()));
};
