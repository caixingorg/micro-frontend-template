const concurrently = require('concurrently');
const path = require('path');

const apps = [
  {
    name: 'main-app',
    command: 'npm start',
    prefixColor: 'blue',
    cwd: path.join(__dirname, '../packages/main-app')
  },
  {
    name: 'react-app',
    command: 'npm start',
    prefixColor: 'green',
    cwd: path.join(__dirname, '../packages/react-app')
  },
  {
    name: 'vue3-micro-app',
    command: 'npm run dev',
    prefixColor: 'yellow',
    cwd: path.join(__dirname, '../packages/vue3-micro-app')
  }
];

try {
  const { result } = concurrently(apps, {
    prefix: 'name',
    killOthers: ['failure'],
    restartTries: 3,
    restartDelay: 1000,
    successCondition: 'all',
    cwd: path.resolve(__dirname, '..')
  });

  // 使用 result 属性来访问 Promise
  result.then(
    () => {
      console.log('All processes completed successfully');
      process.exit(0);
    },
    (err) => {
      console.error('Error occurred:', err);
      process.exit(1);
    }
  );
} catch (e) {
  console.error('Failed to start processes:', e);
  process.exit(1);
}

// 处理进程终止
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down...');
  process.exit(0);
});