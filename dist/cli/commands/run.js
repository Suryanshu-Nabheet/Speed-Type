import React from 'react';
import { render } from 'ink';
import { TypingTestApp } from '../../src/ui/TypingTestApp';
import chalk from 'chalk';
export async function runTypingTest(options) {
    try {
        console.log(chalk.green('🚀 Starting Speed Type...'));
        const testOptions = {
            mode: options.mode,
            timeLimit: parseInt(options.time, 10),
            wordCount: parseInt(options.words, 10),
            difficulty: options.difficulty,
            theme: options.theme,
        };
        // Clear screen and render the typing test
        console.clear();
        const { unmount } = render(React.createElement(TypingTestApp, { options: testOptions }));
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
        console.error(chalk.red('Failed to start typing test:'), error);
        process.exit(1);
    }
}
