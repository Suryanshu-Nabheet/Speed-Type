import React from 'react';
import { render } from 'ink';
import { RaceApp } from '../../src/ui/RaceApp';
import chalk from 'chalk';
export async function raceCommand(action, options) {
    try {
        console.log(chalk.magenta('🏁 Starting multiplayer race...'));
        // Clear screen and render the race interface
        console.clear();
        const { unmount } = render(React.createElement(RaceApp, { action, options }));
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            unmount();
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            unmount();
            process.exit(0);
        });
    }
    catch (error) {
        console.error(chalk.red('Failed to start race:'), error);
        process.exit(1);
    }
}
