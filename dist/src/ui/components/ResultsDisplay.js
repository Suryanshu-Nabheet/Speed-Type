import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from './ThemeProvider';
export const ResultsDisplay = ({ metrics, mode, onRestart }) => {
    const theme = useTheme();
    // Celebrate based on performance
    const getCelebration = () => {
        if (metrics.wpm >= 80)
            return '🔥 BLAZING FAST! 🔥';
        if (metrics.wpm >= 60)
            return '⚡ EXCELLENT! ⚡';
        if (metrics.wpm >= 40)
            return '🎯 GREAT JOB! 🎯';
        if (metrics.wpm >= 20)
            return '👍 GOOD WORK! 👍';
        return '💪 KEEP PRACTICING! 💪';
    };
    const getGrade = () => {
        if (metrics.wpm >= 80 && metrics.accuracy >= 95)
            return 'A+';
        if (metrics.wpm >= 60 && metrics.accuracy >= 90)
            return 'A';
        if (metrics.wpm >= 40 && metrics.accuracy >= 85)
            return 'B';
        if (metrics.wpm >= 20 && metrics.accuracy >= 80)
            return 'C';
        return 'D';
    };
    return (React.createElement(Box, { flexDirection: "column", borderStyle: "double", borderColor: "green", padding: 2 },
        React.createElement(Box, { justifyContent: "center", marginBottom: 1 },
            React.createElement(Text, { color: "yellow", bold: true }, getCelebration())),
        React.createElement(Box, { justifyContent: "center", marginBottom: 2 },
            React.createElement(Text, { color: "green", bold: true },
                "Grade: ",
                getGrade())),
        React.createElement(Box, { flexDirection: "row", justifyContent: "space-around", marginBottom: 2 },
            React.createElement(Box, { flexDirection: "column", alignItems: "center" },
                React.createElement(Text, { color: "green", bold: true }, Math.round(metrics.wpm)),
                React.createElement(Text, { color: "gray" }, "Words/Min")),
            React.createElement(Box, { flexDirection: "column", alignItems: "center" },
                React.createElement(Text, { color: "blue", bold: true },
                    Math.round(metrics.accuracy),
                    "%"),
                React.createElement(Text, { color: "gray" }, "Accuracy")),
            React.createElement(Box, { flexDirection: "column", alignItems: "center" },
                React.createElement(Text, { color: "yellow", bold: true }, Math.round(metrics.cpm)),
                React.createElement(Text, { color: "gray" }, "Chars/Min")),
            React.createElement(Box, { flexDirection: "column", alignItems: "center" },
                React.createElement(Text, { color: "cyan", bold: true },
                    Math.round(metrics.consistency),
                    "%"),
                React.createElement(Text, { color: "gray" }, "Consistency"))),
        React.createElement(Box, { flexDirection: "row", justifyContent: "space-around", marginBottom: 2 },
            React.createElement(Text, { color: "magenta" },
                "Longest Streak: ",
                metrics.longestStreak),
            React.createElement(Text, { color: "red" },
                "Errors: ",
                metrics.errorsCount),
            React.createElement(Text, { color: "cyan" },
                "Time: ",
                Math.round(metrics.timeElapsed),
                "s")),
        React.createElement(Box, { justifyContent: "center", marginTop: 1 },
            React.createElement(Text, { color: "gray" }, "Press 'r' to restart or Ctrl+C to exit"))));
};
