import chalk from 'chalk';
import { ProfileManager } from '../../src/data/ProfileManager';
export async function manageProfile(action, name) {
    const profileManager = new ProfileManager();
    try {
        switch (action) {
            case 'create':
                if (!name) {
                    console.error(chalk.red('Profile name is required'));
                    return;
                }
                const profile = await profileManager.createProfile(name);
                console.log(chalk.green(`✅ Profile '${profile.name}' created successfully`));
                break;
            case 'list':
                const profiles = await profileManager.getAllProfiles();
                const current = await profileManager.getCurrentProfile();
                console.log(chalk.cyan('\n📋 Profiles:'));
                profiles.forEach(profile => {
                    const marker = current?.id === profile.id ? chalk.green('→ ') : '  ';
                    const stats = `WPM: ${profile.bestWpm || 0} | Tests: ${profile.testsCompleted || 0}`;
                    console.log(`${marker}${chalk.bold(profile.name)} (${stats})`);
                });
                console.log('');
                break;
            case 'switch':
                if (!name) {
                    console.error(chalk.red('Profile name is required'));
                    return;
                }
                await profileManager.switchProfile(name);
                console.log(chalk.green(`✅ Switched to profile '${name}'`));
                break;
            case 'delete':
                if (!name) {
                    console.error(chalk.red('Profile name is required'));
                    return;
                }
                await profileManager.deleteProfile(name);
                console.log(chalk.yellow(`🗑️ Profile '${name}' deleted`));
                break;
        }
    }
    catch (error) {
        console.error(chalk.red('Profile operation failed:'), error);
        process.exit(1);
    }
}
