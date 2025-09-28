import React from 'react';
import { render } from 'ink';
import { TypingTestApp } from '../../src/ui/TypingTestApp';
import { TestOptions } from '../../src/core/types';
import chalk from 'chalk';

export async function runTypingTest(options: {
  mode: string;
  time: string;
  words: string;
  difficulty: string;
  theme: string;
}): Promise<void> {
  try {
    console.log(chalk.green('🚀 Starting Speed Type...'));
    
    const testOptions: TestOptions = {
      mode: options.mode as 'words' | 'sentences' | 'paragraphs' | 'quotes' | 'code',
      timeLimit: parseInt(options.time, 10),
      wordCount: parseInt(options.words, 10),
      difficulty: options.difficulty as 'easy' | 'medium' | 'hard',
      theme: options.theme as 'dark' | 'light' | 'high-contrast',
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

  } catch (error) {
    console.error(chalk.red('Failed to start typing test:'), error);
    process.exit(1);
  }
}