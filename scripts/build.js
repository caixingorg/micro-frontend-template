#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建企业级微前端应用...\n');

// 构建配置
const apps = [
  { name: 'shared-types', path: 'packages/shared-types' },
  { name: 'shared-utils', path: 'packages/shared-utils' },
  { name: 'micro-app-sdk', path: 'packages/micro-app-sdk' },
  { name: 'shared-components', path: 'packages/shared-components' },
  { name: 'monitoring-sdk', path: 'packages/monitoring-sdk' },
  { name: 'dev-tools', path: 'packages/dev-tools' },
  { name: 'main-app', path: 'apps/main-app' },
  { name: 'react-micro-app', path: 'apps/react-micro-app' },
  { name: 'vue3-micro-app', path: 'apps/vue3-micro-app' },
];

// 清理函数
function clean() {
  console.log('🧹 清理构建产物...');
  try {
    execSync('pnpm run clean', { stdio: 'inherit' });
    console.log('✅ 清理完成\n');
  } catch (error) {
    console.error('❌ 清理失败:', error.message);
    process.exit(1);
  }
}

// 构建单个应用
function buildApp(app) {
  console.log(`📦 构建 ${app.name}...`);

  const startTime = Date.now();

  try {
    // 检查是否存在构建脚本
    const packageJsonPath = path.join(app.path, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log(`⚠️  跳过 ${app.name} (package.json 不存在)`);
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.scripts || !packageJson.scripts.build) {
      console.log(`⚠️  跳过 ${app.name} (无构建脚本)`);
      return;
    }

    // 执行构建
    execSync(`pnpm --filter ${app.name} build`, { stdio: 'inherit' });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ ${app.name} 构建完成 (${duration}s)\n`);

  } catch (error) {
    console.error(`❌ ${app.name} 构建失败:`, error.message);
    process.exit(1);
  }
}

// 验证构建产物
function validateBuild() {
  console.log('🔍 验证构建产物...');

  const requiredFiles = [
    'apps/main-app/dist/index.html',
    'apps/react-micro-app/dist/index.html',
    'apps/vue3-micro-app/dist/index.html',
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ 缺少构建产物: ${file}`);
      process.exit(1);
    }
  }

  console.log('✅ 构建产物验证通过\n');
}

// 生成构建报告
function generateBuildReport() {
  console.log('📊 生成构建报告...');

  const report = {
    buildTime: new Date().toISOString(),
    apps: [],
    totalSize: 0,
  };

  for (const app of apps) {
    const distPath = path.join(app.path, 'dist');
    if (fs.existsSync(distPath)) {
      const size = getDirSize(distPath);
      report.apps.push({
        name: app.name,
        size: formatBytes(size),
        sizeBytes: size,
      });
      report.totalSize += size;
    }
  }

  report.totalSize = formatBytes(report.totalSize);

  // 保存报告
  fs.writeFileSync('build-report.json', JSON.stringify(report, null, 2));

  console.log('📋 构建报告:');
  console.log(`   总大小: ${report.totalSize}`);
  report.apps.forEach(app => {
    console.log(`   ${app.name}: ${app.size}`);
  });
  console.log('   详细报告已保存到 build-report.json\n');
}

// 获取目录大小
function getDirSize(dirPath) {
  let size = 0;

  function calculateSize(itemPath) {
    const stats = fs.statSync(itemPath);
    if (stats.isFile()) {
      size += stats.size;
    } else if (stats.isDirectory()) {
      const items = fs.readdirSync(itemPath);
      items.forEach(item => {
        calculateSize(path.join(itemPath, item));
      });
    }
  }

  if (fs.existsSync(dirPath)) {
    calculateSize(dirPath);
  }

  return size;
}

// 格式化字节数
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 主函数
function main() {
  const startTime = Date.now();

  try {
    // 解析命令行参数
    const args = process.argv.slice(2);
    const shouldClean = args.includes('--clean');
    const skipValidation = args.includes('--skip-validation');

    // 清理
    if (shouldClean) {
      clean();
    }

    // 构建所有应用
    console.log('📦 开始构建所有应用...\n');
    for (const app of apps) {
      buildApp(app);
    }

    // 验证构建产物
    if (!skipValidation) {
      validateBuild();
    }

    // 生成构建报告
    generateBuildReport();

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`🎉 构建完成! 总耗时: ${totalDuration}s`);

  } catch (error) {
    console.error('❌ 构建过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  buildApp,
  validateBuild,
  generateBuildReport,
};
