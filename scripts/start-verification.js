#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 正在启动微前端系统验证...\n');

// 检查必要的文件是否存在
const requiredFiles = [
  'apps/main-app/src/App.tsx',
  'apps/main-app/src/config/microApps.ts',
  'apps/react-micro-app/src/index.tsx',
  'apps/vue3-micro-app/vite.config.ts',
  'apps/vue2-micro-app/webpack.config.js'
];

console.log('📋 检查必要文件...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ 部分必要文件缺失，请检查项目完整性');
  process.exit(1);
}

console.log('\n✅ 所有必要文件检查通过');

// 检查端口配置一致性
console.log('\n📋 检查端口配置一致性...');

const envConfig = fs.readFileSync('apps/main-app/src/config/env.ts', 'utf8');
const reactWebpackConfig = fs.readFileSync('apps/react-micro-app/webpack.config.js', 'utf8');
const vue3ViteConfig = fs.readFileSync('apps/vue3-micro-app/vite.config.ts', 'utf8');
const vue2WebpackConfig = fs.readFileSync('apps/vue2-micro-app/webpack.config.js', 'utf8');

const portChecks = [
  { name: 'React子应用端口', expected: '3001', found: reactWebpackConfig.includes('3001') },
  { name: 'Vue2子应用端口', expected: '3002', found: vue2WebpackConfig.includes('3002') },
  { name: 'Vue3子应用端口', expected: '3003', found: vue3ViteConfig.includes('3003') },
  { name: '主应用配置-React', expected: '3001', found: envConfig.includes('//localhost:3001') },
  { name: '主应用配置-Vue2', expected: '3002', found: envConfig.includes('//localhost:3002') },
  { name: '主应用配置-Vue3', expected: '3003', found: envConfig.includes('//localhost:3003') }
];

let portConfigCorrect = true;
portChecks.forEach(check => {
  if (check.found) {
    console.log(`✅ ${check.name}: ${check.expected}`);
  } else {
    console.log(`❌ ${check.name}: 端口配置不正确`);
    portConfigCorrect = false;
  }
});

if (!portConfigCorrect) {
  console.log('\n❌ 端口配置不一致，请检查配置文件');
  process.exit(1);
}

console.log('\n✅ 端口配置检查通过');

console.log('\n🎯 验证完成，系统配置正确！');
console.log('\n📝 启动说明：');
console.log('1. 运行 `pnpm install` 安装依赖');
console.log('2. 运行 `pnpm dev` 启动所有应用');
console.log('3. 访问 http://localhost:3000 查看主应用');
console.log('4. 点击左侧菜单中的微应用项目测试加载');

console.log('\n🔗 应用端口分配：');
console.log('- 主应用: http://localhost:3000');
console.log('- React子应用: http://localhost:3001');
console.log('- Vue2子应用: http://localhost:3002');
console.log('- Vue3子应用: http://localhost:3003');
