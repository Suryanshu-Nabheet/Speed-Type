import chalk from 'chalk';
import { ConfigManager } from '../../src/data/ConfigManager';
export async function configCommand(action, key, value) {
    try {
        const configManager = new ConfigManager();
        switch (action) {
            case 'set':
                if (!key || !value) {
                    console.error(chalk.red('Both key and value are required for set operation'));
                    return;
                }
                await configManager.set(key, value);
                console.log(chalk.green(`✅ Set ${key} = ${value}`));
                break;
            case 'get':
                if (!key) {
                    console.error(chalk.red('Key is required for get operation'));
                    return;
                }
                const configValue = await configManager.get(key);
                console.log(`${key}: ${chalk.bold(configValue || 'undefined')}`);
                break;
            case 'list':
                const allConfig = await configManager.getAll();
                console.log(chalk.cyan('\n⚙️ Configuration:'));
                Object.entries(allConfig).forEach(([k, v]) => {
                    console.log(`  ${k}: ${chalk.bold(String(v))}`);
                });
                console.log('');
                break;
        }
    }
    catch (error) {
        console.error(chalk.red('Configuration operation failed:'), error);
        process.exit(1);
    }
}
