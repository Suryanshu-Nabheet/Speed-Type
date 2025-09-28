import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import { TypingEngine } from '../core/TypingEngine';
import { WordListManager } from '../data/WordListManager';
import { ProfileManager } from '../data/ProfileManager';
import { StatsManager } from '../data/StatsManager';
import { ProgressBar } from './components/ProgressBar';
import { MetricsDisplay } from './components/MetricsDisplay';
import { TextDisplay } from './components/TextDisplay';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ThemeProvider } from './components/ThemeProvider';
export const TypingTestApp = ({ options }) => {
    const [engine, setEngine] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [testText, setTestText] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(options.timeLimit);
    const profileManager = new ProfileManager();
    const statsManager = new StatsManager();
    const wordListManager = new WordListManager();
    const timerRef = useRef(null);
    // Initialize test
    useEffect(() => {
        initializeTest();
    }, []);
    // Timer effect
    useEffect(() => {
        if (startTime && !isFinished) {
            timerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const remaining = Math.max(0, options.timeLimit - elapsed);
                setTimeLeft(remaining);
                if (remaining === 0) {
                    finishTest();
                }
            }, 100);
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [startTime, isFinished]);
    // Update metrics periodically
    useEffect(() => {
        if (engine && startTime && !isFinished) {
            const interval = setInterval(() => {
                setMetrics(engine.getCurrentMetrics());
            }, 100);
            return () => clearInterval(interval);
        }
    }, [engine, startTime, isFinished]);
    const initializeTest = async () => {
        try {
            const text = wordListManager.generateText(options.mode, options.difficulty, options.wordCount);
            setTestText(text);
            const typingEngine = new TypingEngine(text);
            setEngine(typingEngine);
            setMetrics(typingEngine.getCurrentMetrics());
        }
        catch (error) {
            console.error('Failed to initialize test:', error);
        }
    };
    const finishTest = async () => {
        if (!engine || isFinished)
            return;
        setIsFinished(true);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        const finalMetrics = engine.getCurrentMetrics();
        setMetrics(finalMetrics);
        // Save results
        try {
            const currentProfile = await profileManager.getCurrentProfile();
            if (currentProfile) {
                const testResult = await statsManager.saveTestResult(currentProfile.id, {
                    mode: options.mode,
                    wpm: finalMetrics.wpm,
                    cpm: finalMetrics.cpm,
                    accuracy: finalMetrics.accuracy,
                    consistency: finalMetrics.consistency,
                    timeElapsed: finalMetrics.timeElapsed,
                    errorsCount: finalMetrics.errorsCount,
                    longestStreak: finalMetrics.longestStreak,
                    text: testText,
                    replayData: engine.getReplayData(),
                });
                // Update profile stats
                await profileManager.updateProfileStats(currentProfile.id, {
                    wpm: finalMetrics.wpm,
                    accuracy: finalMetrics.accuracy,
                    testsCompleted: 1,
                    totalTimeTyped: finalMetrics.timeElapsed,
                });
            }
        }
        catch (error) {
            console.error('Failed to save test results:', error);
        }
    };
    useInput((input, key) => {
        if (!engine || isFinished)
            return;
        if (!startTime) {
            setStartTime(Date.now());
        }
        let keyPressed = input;
        // Handle special keys
        if (key.backspace)
            keyPressed = 'Backspace';
        else if (key.return)
            keyPressed = 'Enter';
        else if (input === ' ')
            keyPressed = 'Space';
        const wasCorrect = engine.processKeystroke(keyPressed);
        // Update metrics
        setMetrics(engine.getCurrentMetrics());
        // Check if test is finished by completion
        if (engine.isTestFinished()) {
            finishTest();
        }
    });
    if (!engine || !metrics) {
        return (React.createElement(ThemeProvider, { theme: options.theme },
            React.createElement(Box, { justifyContent: "center", alignItems: "center", height: 10 },
                React.createElement(Text, { color: "cyan" }, "Loading Speed Type..."))));
    }
    return (React.createElement(ThemeProvider, { theme: options.theme },
        React.createElement(Box, { flexDirection: "column", padding: 2 },
            React.createElement(Box, { justifyContent: "center", marginBottom: 1 },
                React.createElement(Text, { bold: true, color: "cyan" }, "\u26A1 Speed Type")),
            React.createElement(Box, { justifyContent: "space-between", marginBottom: 1 },
                React.createElement(Text, { color: "yellow" },
                    "Time: ",
                    timeLeft,
                    "s"),
                React.createElement(Text, { color: "green" },
                    "Mode: ",
                    options.mode)),
            React.createElement(Box, { marginBottom: 2 },
                React.createElement(ProgressBar, { progress: engine.getProgress() })),
            React.createElement(Box, { marginBottom: 2 },
                React.createElement(MetricsDisplay, { metrics: metrics })),
            React.createElement(Box, { marginBottom: 2 },
                React.createElement(TextDisplay, { engine: engine, showCursor: !isFinished })),
            isFinished && (React.createElement(ResultsDisplay, { metrics: metrics, mode: options.mode, onRestart: () => {
                    setIsFinished(false);
                    setStartTime(null);
                    setTimeLeft(options.timeLimit);
                    initializeTest();
                } })),
            !startTime && (React.createElement(Box, { justifyContent: "center", marginTop: 1 },
                React.createElement(Text, { color: "gray" }, "Start typing to begin the test..."))))));
};
