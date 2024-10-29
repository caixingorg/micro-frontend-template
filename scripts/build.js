const { execSync } = require('child_process');

const apps = ['main-app', 'react-app', 'vue3-app'];

async function build() {
  try {
    // 清理旧的构建文件
    execSync('rm -rf dist');
    
    // 串行构建所有应用
    for (const app of apps) {
      console.log(`Building ${app}...`);
      execSync(`cd packages/${app} && npm run build`, { 
        stdio: 'inherit'
      });
    }

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();