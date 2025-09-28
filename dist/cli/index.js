#!/usr/bin/env node
import { Command } from 'commander';
import { runTypingTest } from './commands/run';
import { manageProfile } from './commands/profile';
import { showStats } from './commands/stats';
import { showLeaderboard } from './commands/leaderboard';
import { raceCommand } from './commands/race';
import { replayCommand } from './commands/replay';
import { configCommand } from './commands/config';
import { version } from '../package.json';
import chalk from 'chalk';
import figlet from 'figlet';
const program = new Command();
// ASCII Art Header
console.log(chalk.cyan(figlet.textSync('Speed Type', {
    font: 'Speed',
    horizontalLayout: 'default',
    verticalLayout: 'default',
})));
program
    .name('speed-type')
    .description('A free, customizable typing test and practice tool')
    .version(version);
// Main typing test command
program
    .command('run')
    .description('Start a typing test')
    .option('-m, --mode <mode>', 'Test mode: words, sentences, paragraphs, quotes, code', 'words')
    .option('-t, --time <time>', 'Test duration in seconds', '60')
    .option('-w, --words <count>', 'Number of words for words mode', '50')
    .option('-d, --difficulty <level>', 'Difficulty: easy, medium, hard', 'medium')
    .option('--theme <theme>', 'Theme: dark, light, high-contrast', 'dark')
    .action(runTypingTest);
// Profile management
const profileCmd = program
    .command('profile')
    .description('Manage user profiles');
profileCmd
    .command('create <name>')
    .description('Create a new profile')
    .action((name) => manageProfile('create', name));
profileCmd
    .command('list')
    .description('List all profiles')
    .action(() => manageProfile('list'));
profileCmd
    .command('switch <name>')
    .description('Switch to a profile')
    .action((name) => manageProfile('switch', name));
profileCmd
    .command('delete <name>')
    .description('Delete a profile')
    .action((name) => manageProfile('delete', name));
// Statistics
program
    .command('stats')
    .description('Show typing statistics')
    .option('-p, --profile <name>', 'Show stats for specific profile')
    .option('--detailed', 'Show detailed statistics')
    .action(showStats);
// Leaderboard
program
    .command('leaderboard')
    .description('Show leaderboards')
    .option('-m, --mode <mode>', 'Filter by mode')
    .option('-t, --type <type>', 'Leaderboard type: local, global', 'local')
    .action(showLeaderboard);
// Racing
const raceCmd = program
    .command('race')
    .description('Multiplayer racing');
raceCmd
    .command('create')
    .description('Create a new race')
    .option('-m, --mode <mode>', 'Race mode', 'words')
    .option('-p, --private', 'Create private race')
    .action((options) => raceCommand('create', options));
raceCmd
    .command('join <code>')
    .description('Join a race by code')
    .action((code) => raceCommand('join', { code }));
raceCmd
    .command('list')
    .description('List available races')
    .action(() => raceCommand('list'));
// Replay system
program
    .command('replay <code>')
    .description('Watch or share a replay')
    .option('--share', 'Generate share code for current session')
    .action(replayCommand);
// Configuration
const configCmd = program
    .command('config')
    .description('Manage configuration');
configCmd
    .command('set <key> <value>')
    .description('Set a configuration value')
    .action((key, value) => configCommand('set', key, value));
configCmd
    .command('get <key>')
    .description('Get a configuration value')
    .action((key) => configCommand('get', key));
configCmd
    .command('list')
    .description('List all configuration')
    .action(() => configCommand('list'));
// Error handling
program.exitOverride((err) => {
    if (err.code === 'commander.version') {
        console.log(version);
        process.exit(0);
    }
    if (err.code === 'commander.helpDisplayed') {
        process.exit(0);
    }
    console.error(chalk.red('Error:'), err.message);
    process.exit(1);
});
// Parse command line arguments
program.parse();
