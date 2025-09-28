import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from './ThemeProvider';
export const MetricsDisplay = ({ metrics }) => {
    const theme = useTheme();
    return (React.createElement(Box, { flexDirection: "row", justifyContent: "space-around" },
        React.createElement(Box, { flexDirection: "column", alignItems: "center" },
            React.createElement(Text, { color: "green", bold: true }, Math.round(metrics.wpm)),
            React.createElement(Text, { color: "gray" }, "WPM")),
        React.createElement(Box, { flexDirection: "column", alignItems: "center" },
            React.createElement(Text, { color: "blue", bold: true },
                Math.round(metrics.accuracy),
                "%"),
            React.createElement(Text, { color: "gray" }, "Accuracy")),
        React.createElement(Box, { flexDirection: "column", alignItems: "center" },
            React.createElement(Text, { color: "yellow", bold: true }, Math.round(metrics.cpm)),
            React.createElement(Text, { color: "gray" }, "CPM")),
        React.createElement(Box, { flexDirection: "column", alignItems: "center" },
            React.createElement(Text, { color: "magenta", bold: true }, metrics.streak),
            React.createElement(Text, { color: "gray" }, "Streak")),
        React.createElement(Box, { flexDirection: "column", alignItems: "center" },
            React.createElement(Text, { color: "cyan", bold: true },
                Math.round(metrics.consistency),
                "%"),
            React.createElement(Text, { color: "gray" }, "Consistency"))));
};
