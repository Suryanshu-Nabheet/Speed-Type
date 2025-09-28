import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { RaceClient } from '../network/RaceClient';
import { ThemeProvider } from './components/ThemeProvider';
export const RaceApp = ({ action, options }) => {
    const [raceClient] = useState(new RaceClient());
    const [race, setRace] = useState(null);
    const [races, setRaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [raceCode, setRaceCode] = useState(null);
    useEffect(() => {
        initializeRace();
        // Cleanup on unmount
        return () => {
            raceClient.disconnect();
        };
    }, []);
    const initializeRace = async () => {
        try {
            await raceClient.connect();
            switch (action) {
                case 'create':
                    const newRace = await raceClient.createRace({
                        mode: options?.mode || 'words',
                        isPrivate: options?.private || false,
                    });
                    setRace(newRace);
                    setRaceCode(newRace.id);
                    break;
                case 'join':
                    if (!options?.code) {
                        setError('Race code is required');
                        return;
                    }
                    const joinedRace = await raceClient.joinRace(options.code);
                    setRace(joinedRace);
                    break;
                case 'list':
                    const availableRaces = await raceClient.listRaces();
                    setRaces(availableRaces);
                    break;
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        }
        finally {
            setLoading(false);
        }
    };
    useInput((input) => {
        if (input === 'q') {
            process.exit(0);
        }
    });
    if (loading) {
        return (React.createElement(ThemeProvider, { theme: "dark" },
            React.createElement(Box, { justifyContent: "center", alignItems: "center", height: 10 },
                React.createElement(Text, { color: "cyan" }, "Loading race..."))));
    }
    if (error) {
        return (React.createElement(ThemeProvider, { theme: "dark" },
            React.createElement(Box, { flexDirection: "column", alignItems: "center", padding: 2 },
                React.createElement(Text, { color: "red", bold: true },
                    "Error: ",
                    error),
                React.createElement(Text, { color: "gray", marginTop: 1 }, "Press 'q' to exit"))));
    }
    if (action === 'list') {
        return (React.createElement(ThemeProvider, { theme: "dark" },
            React.createElement(Box, { flexDirection: "column", padding: 2 },
                React.createElement(Text, { color: "cyan", bold: true }, "\uD83C\uDFC1 Available Races"),
                React.createElement(Text, { color: "gray" }, "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550"),
                races.length === 0 ? (React.createElement(Text, { color: "yellow", marginTop: 1 }, "No races available")) : (races.map((race, index) => (React.createElement(Box, { key: race.id, marginTop: 1 },
                    React.createElement(Text, { color: "green" },
                        index + 1,
                        ". "),
                    React.createElement(Text, null,
                        "Race ",
                        race.id.substring(0, 8),
                        " "),
                    React.createElement(Text, { color: "blue" },
                        "(",
                        race.participants.length,
                        " players) "),
                    React.createElement(Text, { color: "gray" },
                        "[",
                        race.status,
                        "]"))))),
                React.createElement(Text, { color: "gray", marginTop: 2 }, "Press 'q' to exit"))));
    }
    if (!race) {
        return (React.createElement(ThemeProvider, { theme: "dark" },
            React.createElement(Box, { justifyContent: "center", alignItems: "center", height: 10 },
                React.createElement(Text, { color: "red" }, "Failed to load race"))));
    }
    return (React.createElement(ThemeProvider, { theme: "dark" },
        React.createElement(Box, { flexDirection: "column", padding: 2 },
            React.createElement(Box, { justifyContent: "center", marginBottom: 1 },
                React.createElement(Text, { color: "cyan", bold: true }, "\uD83C\uDFC1 Multiplayer Race")),
            raceCode && (React.createElement(Box, { justifyContent: "center", marginBottom: 2 },
                React.createElement(Text, { color: "yellow" }, "Race Code: "),
                React.createElement(Text, { color: "green", bold: true }, raceCode))),
            React.createElement(Box, { justifyContent: "center", marginBottom: 2 },
                React.createElement(Text, { color: "blue" },
                    "Status: ",
                    race.status.toUpperCase())),
            React.createElement(Box, { flexDirection: "column", marginBottom: 2 },
                React.createElement(Text, { color: "cyan", bold: true }, "Participants:"),
                race.participants.map((participant, index) => (React.createElement(Box, { key: participant.id, marginTop: 1 },
                    React.createElement(Text, { color: "green" },
                        index + 1,
                        ". "),
                    React.createElement(Text, null,
                        participant.name,
                        " "),
                    React.createElement(Text, { color: "yellow" },
                        "(",
                        Math.round(participant.progress),
                        "% complete)"),
                    participant.finished && React.createElement(Text, { color: "green" }, " \u2713 FINISHED"))))),
            React.createElement(Box, { justifyContent: "center", marginTop: 2 }, race.status === 'waiting' ? (React.createElement(Text, { color: "gray" }, "Waiting for more players to join...")) : (React.createElement(Text, { color: "gray" }, "Race in progress..."))),
            React.createElement(Box, { justifyContent: "center", marginTop: 1 },
                React.createElement(Text, { color: "gray" }, "Press 'q' to exit")))));
};
