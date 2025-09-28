import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { RaceClient } from '../network/RaceClient';
import { Race, RaceParticipant } from '../core/types';
import { ThemeProvider } from './components/ThemeProvider';

interface Props {
  action: 'create' | 'join' | 'list';
  options?: {
    code?: string;
    mode?: string;
    private?: boolean;
  };
}

export const RaceApp: React.FC<Props> = ({ action, options }) => {
  const [raceClient] = useState(new RaceClient());
  const [race, setRace] = useState<Race | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [raceCode, setRaceCode] = useState<string | null>(null);

  useEffect(() => {
    initializeRace();
    
    // Cleanup on unmount
    return () => {
      raceClient.disconnect();
    };
  }, []);

  const initializeRace = async (): Promise<void> => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useInput((input) => {
    if (input === 'q') {
      process.exit(0);
    }
  });

  if (loading) {
    return (
      <ThemeProvider theme="dark">
        <Box justifyContent="center" alignItems="center" height={10}>
          <Text color="cyan">Loading race...</Text>
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme="dark">
        <Box flexDirection="column" alignItems="center" padding={2}>
          <Text color="red" bold>Error: {error}</Text>
          <Text color="gray" marginTop={1}>Press 'q' to exit</Text>
        </Box>
      </ThemeProvider>
    );
  }

  if (action === 'list') {
    return (
      <ThemeProvider theme="dark">
        <Box flexDirection="column" padding={2}>
          <Text color="cyan" bold>🏁 Available Races</Text>
          <Text color="gray">═══════════════════</Text>
          
          {races.length === 0 ? (
            <Text color="yellow" marginTop={1}>No races available</Text>
          ) : (
            races.map((race, index) => (
              <Box key={race.id} marginTop={1}>
                <Text color="green">{index + 1}. </Text>
                <Text>Race {race.id.substring(0, 8)} </Text>
                <Text color="blue">({race.participants.length} players) </Text>
                <Text color="gray">[{race.status}]</Text>
              </Box>
            ))
          )}
          
          <Text color="gray" marginTop={2}>Press 'q' to exit</Text>
        </Box>
      </ThemeProvider>
    );
  }

  if (!race) {
    return (
      <ThemeProvider theme="dark">
        <Box justifyContent="center" alignItems="center" height={10}>
          <Text color="red">Failed to load race</Text>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme="dark">
      <Box flexDirection="column" padding={2}>
        {/* Header */}
        <Box justifyContent="center" marginBottom={1}>
          <Text color="cyan" bold>🏁 Multiplayer Race</Text>
        </Box>

        {/* Race Code */}
        {raceCode && (
          <Box justifyContent="center" marginBottom={2}>
            <Text color="yellow">Race Code: </Text>
            <Text color="green" bold>{raceCode}</Text>
          </Box>
        )}

        {/* Race Status */}
        <Box justifyContent="center" marginBottom={2}>
          <Text color="blue">Status: {race.status.toUpperCase()}</Text>
        </Box>

        {/* Participants */}
        <Box flexDirection="column" marginBottom={2}>
          <Text color="cyan" bold>Participants:</Text>
          {race.participants.map((participant, index) => (
            <Box key={participant.id} marginTop={1}>
              <Text color="green">{index + 1}. </Text>
              <Text>{participant.name} </Text>
              <Text color="yellow">({Math.round(participant.progress)}% complete)</Text>
              {participant.finished && <Text color="green"> ✓ FINISHED</Text>}
            </Box>
          ))}
        </Box>

        {/* Instructions */}
        <Box justifyContent="center" marginTop={2}>
          {race.status === 'waiting' ? (
            <Text color="gray">Waiting for more players to join...</Text>
          ) : (
            <Text color="gray">Race in progress...</Text>
          )}
        </Box>

        <Box justifyContent="center" marginTop={1}>
          <Text color="gray">Press 'q' to exit</Text>
        </Box>
      </Box>
    </ThemeProvider>
  );
};