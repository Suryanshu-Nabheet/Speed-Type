import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from './ThemeProvider';
export const ProgressBar = ({ progress, width = 50 }) => {
    const theme = useTheme();
    const filledWidth = Math.round((progress / 100) * width);
    const emptyWidth = width - filledWidth;
    const filledBar = '█'.repeat(filledWidth);
    const emptyBar = '░'.repeat(emptyWidth);
    return (React.createElement(Box, { flexDirection: "column" },
        React.createElement(Box, null,
            React.createElement(Text, { color: "green" }, filledBar),
            React.createElement(Text, { color: "gray" }, emptyBar)),
        React.createElement(Box, { justifyContent: "center", marginTop: 1 },
            React.createElement(Text, { color: "cyan" },
                Math.round(progress),
                "% Complete"))));
};
