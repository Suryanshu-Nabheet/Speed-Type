import chalk from 'chalk';
import { LeaderboardManager } from '../../src/network/LeaderboardManager';

export async function showLeaderboard(options: {
  mode?: string;
  type?: 'local' | 'global';
}): Promise<void> {
  try {
    const leaderboardManager = new LeaderboardManager();
    
    console.log(chalk.cyan('\n🏆 Leaderboard'));
    console.log('═'.repeat(60));

    const leaderboard = await leaderboardManager.getLeaderboard({
      mode: options.mode,
      type: options.type || 'local',
      limit: 10
    });

    leaderboard.forEach((entry, index) => {
      const position = index + 1;
      const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`;
      
      console.log(
        `${medal} ${chalk.bold(entry.profileName)} - ` +
        `${chalk.green(entry.wpm)} WPM, ` +
        `${chalk.blue(Math.round(entry.accuracy))}% accuracy ` +
        chalk.gray(`(${new Date(entry.achievedAt).toLocaleDateString()})`)
      );
    });

    console.log('');
  } catch (error) {
    console.error(chalk.red('Failed to show leaderboard:'), error);
    process.exit(1);
  }
}