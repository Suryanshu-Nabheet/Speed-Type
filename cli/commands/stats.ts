import chalk from 'chalk';
import { StatsManager } from '../../src/data/StatsManager';
import { ProfileManager } from '../../src/data/ProfileManager';

export async function showStats(options: {
  profile?: string;
  detailed?: boolean;
}): Promise<void> {
  try {
    const statsManager = new StatsManager();
    const profileManager = new ProfileManager();

    let profileName = options.profile;
    if (!profileName) {
      const currentProfile = await profileManager.getCurrentProfile();
      profileName = currentProfile?.name;
    }

    if (!profileName) {
      console.error(chalk.red('No profile specified and no current profile found'));
      return;
    }

    const profile = await profileManager.getProfileByName(profileName);
    if (!profile) {
      console.error(chalk.red(`Profile '${profileName}' not found`));
      return;
    }

    const stats = await statsManager.getProfileStats(profile.id);
    const recentTests = await statsManager.getRecentTests(profile.id, 10);

    console.log(chalk.cyan(`\n📊 Statistics for ${chalk.bold(profileName)}`));
    console.log('═'.repeat(50));

    // Overview stats
    console.log(chalk.green('\n🎯 Overview:'));
    console.log(`  Tests Completed: ${chalk.bold(stats.testsCompleted)}`);
    console.log(`  Best WPM: ${chalk.bold(stats.bestWpm)} words/min`);
    console.log(`  Average WPM: ${chalk.bold(Math.round(stats.averageWpm))} words/min`);
    console.log(`  Best Accuracy: ${chalk.bold(Math.round(stats.bestAccuracy))}%`);
    console.log(`  Average Accuracy: ${chalk.bold(Math.round(stats.averageAccuracy))}%`);

    if (options.detailed) {
      console.log(chalk.yellow('\n⚡ Detailed Stats:'));
      console.log(`  Total Time Typed: ${chalk.bold(Math.round(stats.totalTimeTyped / 60))} minutes`);
      console.log(`  Total Characters: ${chalk.bold(stats.totalCharacters)}`);
      console.log(`  Best CPM: ${chalk.bold(stats.bestCpm)} chars/min`);
      console.log(`  Longest Streak: ${chalk.bold(stats.longestStreak)} correct chars`);

      console.log(chalk.blue('\n📈 Recent Tests:'));
      recentTests.forEach((test, index) => {
        const date = new Date(test.completedAt).toLocaleDateString();
        console.log(`  ${index + 1}. ${date}: ${test.wpm} WPM, ${Math.round(test.accuracy)}% accuracy`);
      });
    }

    console.log('');
  } catch (error) {
    console.error(chalk.red('Failed to show statistics:'), error);
    process.exit(1);
  }
}