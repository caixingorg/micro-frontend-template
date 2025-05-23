#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始部署企业级微前端应用...\n');

// 部署配置
const config = {
  environments: {
    staging: {
      name: '测试环境',
      host: 'staging.example.com',
      path: '/var/www/micro-frontend',
      branch: 'develop',
    },
    production: {
      name: '生产环境',
      host: 'production.example.com',
      path: '/var/www/micro-frontend',
      branch: 'main',
    },
  },
  apps: [
    { name: 'main-app', source: 'apps/main-app/dist', target: '.' },
    { name: 'react-micro-app', source: 'apps/react-micro-app/dist', target: 'react-micro-app' },
    { name: 'vue3-micro-app', source: 'apps/vue3-micro-app/dist', target: 'vue3-micro-app' },
  ],
};

// 获取当前Git分支
function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error('❌ 无法获取当前Git分支:', error.message);
    process.exit(1);
  }
}

// 获取Git提交信息
function getCommitInfo() {
  try {
    const hash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 7);
    const message = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
    const author = execSync('git log -1 --pretty=%an', { encoding: 'utf8' }).trim();
    const date = execSync('git log -1 --pretty=%ad --date=iso', { encoding: 'utf8' }).trim();
    
    return { hash, message, author, date };
  } catch (error) {
    console.error('❌ 无法获取Git提交信息:', error.message);
    return null;
  }
}

// 检查构建产物
function checkBuildArtifacts() {
  console.log('🔍 检查构建产物...');
  
  const requiredFiles = [
    'apps/main-app/dist/index.html',
    'apps/react-micro-app/dist/index.html',
    'apps/vue3-micro-app/dist/index.html',
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ 缺少构建产物: ${file}`);
      console.log('💡 请先运行构建命令: pnpm build');
      process.exit(1);
    }
  }
  
  console.log('✅ 构建产物检查通过\n');
}

// 创建部署包
function createDeploymentPackage(environment) {
  console.log('📦 创建部署包...');
  
  const deployDir = 'deploy';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const packageName = `micro-frontend-${environment}-${timestamp}`;
  const packagePath = path.join(deployDir, packageName);
  
  // 创建部署目录
  if (fs.existsSync(deployDir)) {
    execSync(`rm -rf ${deployDir}`);
  }
  fs.mkdirSync(deployDir, { recursive: true });
  fs.mkdirSync(packagePath, { recursive: true });
  
  // 复制构建产物
  for (const app of config.apps) {
    const sourcePath = app.source;
    const targetPath = path.join(packagePath, app.target);
    
    if (fs.existsSync(sourcePath)) {
      console.log(`   复制 ${app.name}...`);
      execSync(`cp -r ${sourcePath}/* ${targetPath}/`, { shell: true });
    } else {
      console.warn(`⚠️  跳过 ${app.name} (构建产物不存在)`);
    }
  }
  
  // 创建部署信息文件
  const deployInfo = {
    environment,
    timestamp: new Date().toISOString(),
    commit: getCommitInfo(),
    version: require('../package.json').version,
    apps: config.apps.map(app => ({
      name: app.name,
      target: app.target,
      exists: fs.existsSync(app.source),
    })),
  };
  
  fs.writeFileSync(
    path.join(packagePath, 'deploy-info.json'),
    JSON.stringify(deployInfo, null, 2)
  );
  
  // 创建压缩包
  const archiveName = `${packageName}.tar.gz`;
  execSync(`cd ${deployDir} && tar -czf ${archiveName} ${packageName}/`);
  
  console.log(`✅ 部署包创建完成: ${deployDir}/${archiveName}\n`);
  
  return {
    packagePath,
    archivePath: path.join(deployDir, archiveName),
    deployInfo,
  };
}

// Docker 部署
function deployWithDocker(environment) {
  console.log('🐳 使用 Docker 部署...');
  
  try {
    // 构建 Docker 镜像
    const imageName = `micro-frontend:${environment}`;
    console.log(`   构建镜像: ${imageName}`);
    execSync(`docker build -t ${imageName} .`, { stdio: 'inherit' });
    
    // 停止旧容器
    try {
      execSync(`docker stop micro-frontend-${environment}`, { stdio: 'ignore' });
      execSync(`docker rm micro-frontend-${environment}`, { stdio: 'ignore' });
    } catch (error) {
      // 忽略容器不存在的错误
    }
    
    // 启动新容器
    const port = environment === 'production' ? '80:80' : '8080:80';
    console.log(`   启动容器: 端口 ${port}`);
    execSync(`docker run -d --name micro-frontend-${environment} -p ${port} ${imageName}`, {
      stdio: 'inherit',
    });
    
    console.log('✅ Docker 部署完成\n');
    
  } catch (error) {
    console.error('❌ Docker 部署失败:', error.message);
    process.exit(1);
  }
}

// SSH 部署
function deployWithSSH(environment, packageInfo) {
  console.log('🌐 使用 SSH 部署...');
  
  const envConfig = config.environments[environment];
  if (!envConfig) {
    console.error(`❌ 未知的部署环境: ${environment}`);
    process.exit(1);
  }
  
  try {
    // 上传部署包
    console.log(`   上传到 ${envConfig.host}...`);
    execSync(`scp ${packageInfo.archivePath} ${envConfig.host}:/tmp/`, { stdio: 'inherit' });
    
    // 远程部署脚本
    const remoteScript = `
      cd /tmp
      tar -xzf ${path.basename(packageInfo.archivePath)}
      sudo rm -rf ${envConfig.path}/*
      sudo cp -r ${path.basename(packageInfo.packagePath)}/* ${envConfig.path}/
      sudo systemctl reload nginx
      rm -rf /tmp/${path.basename(packageInfo.packagePath)}*
    `;
    
    console.log(`   在远程服务器执行部署...`);
    execSync(`ssh ${envConfig.host} "${remoteScript}"`, { stdio: 'inherit' });
    
    console.log('✅ SSH 部署完成\n');
    
  } catch (error) {
    console.error('❌ SSH 部署失败:', error.message);
    process.exit(1);
  }
}

// 部署后验证
function verifyDeployment(environment) {
  console.log('🔍 验证部署...');
  
  const envConfig = config.environments[environment];
  const urls = [
    `http://${envConfig.host}`,
    `http://${envConfig.host}/react-micro-app`,
    `http://${envConfig.host}/vue3-micro-app`,
  ];
  
  for (const url of urls) {
    try {
      console.log(`   检查 ${url}...`);
      execSync(`curl -f -s -o /dev/null ${url}`, { stdio: 'ignore' });
      console.log(`   ✅ ${url} 可访问`);
    } catch (error) {
      console.warn(`   ⚠️  ${url} 无法访问`);
    }
  }
  
  console.log('✅ 部署验证完成\n');
}

// 发送部署通知
function sendDeploymentNotification(environment, deployInfo, success = true) {
  console.log('📢 发送部署通知...');
  
  const status = success ? '成功' : '失败';
  const emoji = success ? '🎉' : '❌';
  
  const message = `
${emoji} 微前端应用部署${status}

环境: ${config.environments[environment]?.name || environment}
版本: ${deployInfo.version}
提交: ${deployInfo.commit?.hash} - ${deployInfo.commit?.message}
作者: ${deployInfo.commit?.author}
时间: ${deployInfo.timestamp}
  `.trim();
  
  console.log(message);
  
  // 这里可以集成 Slack、钉钉、企业微信等通知服务
  // 例如：
  // if (process.env.SLACK_WEBHOOK_URL) {
  //   // 发送 Slack 通知
  // }
  
  console.log('✅ 通知发送完成\n');
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'staging';
  const deployMethod = args.includes('--docker') ? 'docker' : 'ssh';
  const skipBuild = args.includes('--skip-build');
  const skipVerify = args.includes('--skip-verify');
  
  console.log(`📋 部署配置:`);
  console.log(`   环境: ${environment}`);
  console.log(`   方式: ${deployMethod}`);
  console.log(`   分支: ${getCurrentBranch()}\n`);
  
  try {
    // 检查构建产物
    if (!skipBuild) {
      checkBuildArtifacts();
    }
    
    // 创建部署包
    const packageInfo = createDeploymentPackage(environment);
    
    // 执行部署
    if (deployMethod === 'docker') {
      deployWithDocker(environment);
    } else {
      deployWithSSH(environment, packageInfo);
    }
    
    // 验证部署
    if (!skipVerify) {
      verifyDeployment(environment);
    }
    
    // 发送通知
    sendDeploymentNotification(environment, packageInfo.deployInfo, true);
    
    console.log('🎉 部署完成!');
    
  } catch (error) {
    console.error('❌ 部署失败:', error.message);
    
    // 发送失败通知
    try {
      const deployInfo = { version: require('../package.json').version, timestamp: new Date().toISOString() };
      sendDeploymentNotification(environment, deployInfo, false);
    } catch (notifyError) {
      console.error('❌ 发送失败通知时出错:', notifyError.message);
    }
    
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  createDeploymentPackage,
  deployWithDocker,
  deployWithSSH,
  verifyDeployment,
};
