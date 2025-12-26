const inquirer = require('inquirer');
const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');

const APPS = [
    { name: 'Main App (Base)', value: 'main-app', checked: true },
    { name: 'Vue3 Micro App', value: 'vue3-micro-app' },
    { name: 'React Micro App', value: 'react-micro-app' },
    { name: 'Vue2 Micro App', value: 'vue2-micro-app' }
];

async function main() {
    console.log(chalk.cyan.bold('\n🚀 Micro Frontend Interactive Dev Runner\n'));

    try {
        const answers = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'selectedApps',
                message: 'Select applications to start:',
                choices: APPS,
                validate: (answer) => {
                    if (answer.length < 1) {
                        return 'You must choose at least one application.';
                    }
                    return true;
                }
            }
        ]);

        const { selectedApps } = answers;
        const filters = selectedApps.map(app => `--filter ${app}`).join(' ');

        // Always include main-app if a micro-app is selected? 
        // Ideally yes, but let's trust the user or force it?
        // For now, respect user choice.

        console.log(chalk.green(`\nStarting selected apps: ${selectedApps.join(', ')}...\n`));

        const command = 'pnpm';
        const args = [...filters.split(' '), 'dev'];

        // Using concurrently logic via pnpm filter which handles parallelism
        // pnpm --filter app1 --filter app2 dev

        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            env: process.env
        });

        child.on('close', (code) => {
            console.log(chalk.yellow(`Process exited with code ${code}`));
        });

    } catch (error) {
        console.error(chalk.red('Error:'), error);
    }
}

main();
