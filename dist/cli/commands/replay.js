import React from 'react';
import { render } from 'ink';
import { ReplayApp } from '../../src/ui/ReplayApp';
import chalk from 'chalk';
export async function replayCommand(code, options) {
    try {
        console.log(chalk.blue('📹 Loading replay...'));
        // Clear screen and render the replay interface
        console.clear();
        const { unmount } = render(React.createElement(ReplayApp, { code, options }));
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
        console.error(chalk.red('Failed to load replay:'), error);
        process.exit(1);
    }
}
