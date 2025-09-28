import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { StatsManager } from '../data/StatsManager';
import { ThemeProvider } from './components/ThemeProvider';
export const ReplayApp = ({ code, options }) => {
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [replayPosition, setReplayPosition] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const statsManager = new StatsManager();
    useEffect(() => {
        loadReplay();
    }, []);
    const loadReplay = async () => {
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
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load replay');
        }
        finally {
            setLoading(false);
        }
    };
    const startReplay = () => {
        if (!testResult?.replayData)
            return;
        setIsPlaying(true);
        setReplayPosition(0);
        const keystrokes = testResult.replayData.keystrokes;
        const startTime = testResult.replayData.startTime;
        let currentIndex = 0;
        const playNextKeystroke = () => {
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
                }
                else {
                    setIsPlaying(false);
                }
            }, delay);
        };
        playNextKeystroke();
    };
    const generateShareCode = async () => {
        if (!testResult)
            return;
        try {
            const shareCode = await statsManager.createReplayShare(testResult.id);
            console.log(`Share code: ${shareCode}`);
        }
        catch (err) {
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
        return (React.createElement(ThemeProvider, { theme: "dark" },
            React.createElement(Box, { justifyContent: "center", alignItems: "center", height: 10 },
                React.createElement(Text, { color: "cyan" }, "Loading replay..."))));
    }
    if (error) {
        return (React.createElement(ThemeProvider, { theme: "dark" },
            React.createElement(Box, { flexDirection: "column", alignItems: "center", padding: 2 },
                React.createElement(Text, { color: "red", bold: true },
                    "Error: ",
                    error),
                React.createElement(Text, { color: "gray", marginTop: 1 }, "Press 'q' to exit"))));
    }
    if (!testResult) {
        return (React.createElement(ThemeProvider, { theme: "dark" },
            React.createElement(Box, { justifyContent: "center", alignItems: "center", height: 10 },
                React.createElement(Text, { color: "red" }, "No replay data available"))));
    }
    return (React.createElement(ThemeProvider, { theme: "dark" },
        React.createElement(Box, { flexDirection: "column", padding: 2 },
            React.createElement(Box, { justifyContent: "center", marginBottom: 1 },
                React.createElement(Text, { color: "cyan", bold: true }, "\uD83D\uDCF9 Replay Viewer")),
            React.createElement(Box, { flexDirection: "row", justifyContent: "space-around", marginBottom: 2 },
                React.createElement(Text, { color: "green" },
                    "WPM: ",
                    Math.round(testResult.wpm)),
                React.createElement(Text, { color: "blue" },
                    "Accuracy: ",
                    Math.round(testResult.accuracy),
                    "%"),
                React.createElement(Text, { color: "yellow" },
                    "Mode: ",
                    testResult.mode),
                React.createElement(Text, { color: "magenta" },
                    "Speed: ",
                    playbackSpeed,
                    "x")),
            React.createElement(Box, { flexDirection: "column", borderStyle: "single", borderColor: "gray", padding: 1, minHeight: 8, marginBottom: 2 }, testResult.text.split('').map((char, index) => {
                let color = 'gray';
                if (index < replayPosition) {
                    // Find the keystroke for this position
                    const keystroke = testResult.replayData?.keystrokes.find(k => k.position === index);
                    color = keystroke?.correct ? 'green' : 'red';
                }
                else if (index === replayPosition) {
                    color = 'yellow';
                }
                return (React.createElement(Text, { key: index, color: color }, char === ' ' ? '·' : char));
            })),
            React.createElement(Box, { flexDirection: "column", alignItems: "center" },
                React.createElement(Text, { color: "gray", marginBottom: 1 }, isPlaying ? '▶️ Playing...' : '⏸️ Paused'),
                React.createElement(Text, { color: "gray", marginBottom: 1 },
                    "Progress: ",
                    Math.round((replayPosition / testResult.text.length) * 100),
                    "%"),
                React.createElement(Box, { flexDirection: "column", alignItems: "center", marginTop: 1 },
                    React.createElement(Text, { color: "gray" }, "Controls:"),
                    React.createElement(Text, { color: "gray" }, "Space - Play/Pause"),
                    React.createElement(Text, { color: "gray" }, "\u2191/\u2193 - Adjust speed"),
                    options?.share && React.createElement(Text, { color: "gray" }, "S - Generate share code"),
                    React.createElement(Text, { color: "gray" }, "Q - Exit"))))));
};
