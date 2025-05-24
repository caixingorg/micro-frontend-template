#!/usr/bin/env node

/**
 * 微前端应用测试脚本
 * 用于验证主应用能否正确加载子应用
 */

const puppeteer = require('puppeteer');
const chalk = require('chalk');

const MAIN_APP_URL = 'http://localhost:3000';
const MICRO_APPS = [
  { name: 'React微应用', path: '/react-app', containerId: 'react-micro-app-container' },
  { name: 'Vue3微应用', path: '/vue3-app', containerId: 'vue3-micro-app-container' },
  { name: 'Vue2微应用', path: '/vue2-app', containerId: 'vue2-micro-app-container' }
];

async function testMicroApp(page, app) {
  console.log(chalk.blue(`\n🧪 测试 ${app.name}...`));
  
  try {
    // 导航到微应用路由
    await page.goto(`${MAIN_APP_URL}${app.path}`, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // 等待容器出现
    await page.waitForSelector(`#${app.containerId}`, { timeout: 10000 });
    console.log(chalk.green(`✅ ${app.name} 容器已创建`));
    
    // 检查容器是否有内容
    const hasContent = await page.evaluate((containerId) => {
      const container = document.getElementById(containerId);
      return container && container.children.length > 0;
    }, app.containerId);
    
    if (hasContent) {
      console.log(chalk.green(`✅ ${app.name} 已成功加载内容`));
    } else {
      console.log(chalk.yellow(`⚠️  ${app.name} 容器存在但内容为空`));
    }
    
    // 检查控制台错误
    const logs = await page.evaluate(() => {
      return window.__microAppLogs || [];
    });
    
    if (logs.length > 0) {
      console.log(chalk.cyan(`📝 ${app.name} 日志:`), logs);
    }
    
    return { success: true, hasContent };
    
  } catch (error) {
    console.log(chalk.red(`❌ ${app.name} 加载失败: ${error.message}`));
    return { success: false, error: error.message };
  }
}

async function measurePerformance(page) {
  console.log(chalk.blue('\n⚡ 测试性能指标...'));
  
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
    };
  });
  
  console.log(chalk.cyan('📊 性能指标:'));
  console.log(`  DOM内容加载: ${metrics.domContentLoaded.toFixed(2)}ms`);
  console.log(`  页面完全加载: ${metrics.loadComplete.toFixed(2)}ms`);
  console.log(`  首次绘制: ${metrics.firstPaint.toFixed(2)}ms`);
  console.log(`  首次内容绘制: ${metrics.firstContentfulPaint.toFixed(2)}ms`);
  
  return metrics;
}

async function runTests() {
  console.log(chalk.bold.blue('🚀 开始微前端应用测试\n'));
  
  const browser = await puppeteer.launch({ 
    headless: false, // 设置为false以便观察测试过程
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // 监听控制台消息
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(chalk.red(`🔴 控制台错误: ${msg.text()}`));
    }
  });
  
  // 监听页面错误
  page.on('pageerror', error => {
    console.log(chalk.red(`🔴 页面错误: ${error.message}`));
  });
  
  try {
    // 测试主应用加载
    console.log(chalk.blue('🏠 测试主应用加载...'));
    await page.goto(MAIN_APP_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log(chalk.green('✅ 主应用加载成功'));
    
    // 测试性能
    const mainAppMetrics = await measurePerformance(page);
    
    // 测试每个微应用
    const results = [];
    for (const app of MICRO_APPS) {
      const result = await testMicroApp(page, app);
      results.push({ app: app.name, ...result });
    }
    
    // 输出测试结果摘要
    console.log(chalk.bold.blue('\n📋 测试结果摘要:'));
    results.forEach(result => {
      const status = result.success ? 
        (result.hasContent ? '✅ 成功' : '⚠️  部分成功') : 
        '❌ 失败';
      console.log(`  ${result.app}: ${status}`);
    });
    
    const successCount = results.filter(r => r.success).length;
    console.log(chalk.bold.green(`\n🎉 测试完成: ${successCount}/${results.length} 个微应用测试通过`));
    
    if (mainAppMetrics.domContentLoaded > 3000) {
      console.log(chalk.yellow('⚠️  主应用加载时间较长，建议优化性能'));
    }
    
  } catch (error) {
    console.log(chalk.red(`❌ 测试过程中发生错误: ${error.message}`));
  } finally {
    await browser.close();
  }
}

// 检查依赖
try {
  require('puppeteer');
  require('chalk');
} catch (error) {
  console.error('❌ 缺少依赖，请运行: npm install puppeteer chalk');
  process.exit(1);
}

runTests().catch(console.error);
