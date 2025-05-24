#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { URL } = require('url');

console.log('🔍 微前端调试工具');
console.log('=====================================');

// 测试URL列表
const testUrls = [
  'http://localhost:3000',      // 主应用
  'http://localhost:3001',      // React微应用
  'http://localhost:3002',      // Vue3微应用
  'http://localhost:3003',      // Vue2微应用
];

// 测试单个URL
function testUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 5000,
      headers: {
        'User-Agent': 'MicroApp-Debug-Tool/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          contentLength: data.length,
          hasQiankunLifecycle: data.includes('bootstrap') && data.includes('mount'),
          hasUMDExport: data.includes('umd') || data.includes('webpackJsonp'),
          error: null
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        status: 0,
        headers: {},
        contentLength: 0,
        hasQiankunLifecycle: false,
        hasUMDExport: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 0,
        headers: {},
        contentLength: 0,
        hasQiankunLifecycle: false,
        hasUMDExport: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

// 检查CORS配置
function checkCors(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'OPTIONS',
      timeout: 3000,
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
      }
    }, (res) => {
      resolve({
        url,
        corsEnabled: res.headers['access-control-allow-origin'] === '*' || 
                    res.headers['access-control-allow-origin'] === 'http://localhost:3000',
        allowOrigin: res.headers['access-control-allow-origin'],
        allowMethods: res.headers['access-control-allow-methods'],
        allowHeaders: res.headers['access-control-allow-headers'],
      });
    });

    req.on('error', () => {
      resolve({
        url,
        corsEnabled: false,
        allowOrigin: null,
        allowMethods: null,
        allowHeaders: null,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        corsEnabled: false,
        allowOrigin: null,
        allowMethods: null,
        allowHeaders: null,
      });
    });

    req.end();
  });
}

// 主测试函数
async function runTests() {
  console.log('📊 测试应用可访问性...\n');
  
  // 基础连接测试
  const results = await Promise.all(testUrls.map(testUrl));
  
  results.forEach(result => {
    const status = result.error ? '❌ 错误' : 
                  result.status === 200 ? '✅ 正常' : 
                  `⚠️  HTTP ${result.status}`;
    
    console.log(`${status} ${getAppName(result.url)}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   状态: ${result.status || '连接失败'}`);
    console.log(`   内容长度: ${result.contentLength} bytes`);
    
    if (result.url !== 'http://localhost:3000') {
      console.log(`   qiankun生命周期: ${result.hasQiankunLifecycle ? '✅' : '❌'}`);
      console.log(`   UMD导出: ${result.hasUMDExport ? '✅' : '❌'}`);
    }
    
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
    console.log('');
  });

  // CORS测试
  console.log('🌐 测试CORS配置...\n');
  const corsResults = await Promise.all(testUrls.slice(1).map(checkCors)); // 跳过主应用
  
  corsResults.forEach(result => {
    const status = result.corsEnabled ? '✅ 已启用' : '❌ 未启用';
    console.log(`${status} ${getAppName(result.url)} CORS`);
    console.log(`   Allow-Origin: ${result.allowOrigin || '未设置'}`);
    console.log(`   Allow-Methods: ${result.allowMethods || '未设置'}`);
    console.log('');
  });

  // 总结
  const allHealthy = results.every(r => r.status === 200 && !r.error);
  const allCorsEnabled = corsResults.every(r => r.corsEnabled);
  
  console.log('📋 诊断总结:');
  console.log('=====================================');
  console.log(`应用连接状态: ${allHealthy ? '✅ 全部正常' : '❌ 存在问题'}`);
  console.log(`CORS配置状态: ${allCorsEnabled ? '✅ 全部正确' : '❌ 需要修复'}`);
  
  if (!allHealthy || !allCorsEnabled) {
    console.log('\n🔧 建议修复步骤:');
    if (!allHealthy) {
      console.log('1. 确保所有开发服务器都在运行: pnpm dev');
      console.log('2. 检查端口是否被占用: lsof -ti:3000,3001,3002,3003');
    }
    if (!allCorsEnabled) {
      console.log('3. 检查webpack/vite配置中的CORS设置');
      console.log('4. 确保Access-Control-Allow-Origin设置为 "*"');
    }
  } else {
    console.log('\n🎉 所有检查通过！微前端应该可以正常工作。');
    console.log('\n🚀 测试地址:');
    console.log('   主应用: http://localhost:3000');
    console.log('   React微应用: http://localhost:3000/react-app');
    console.log('   Vue3微应用: http://localhost:3000/vue3-app');
    console.log('   Vue2微应用: http://localhost:3000/vue2-app');
  }
}

function getAppName(url) {
  const port = new URL(url).port;
  switch (port) {
    case '3000': return '主应用';
    case '3001': return 'React微应用';
    case '3002': return 'Vue3微应用';
    case '3003': return 'Vue2微应用';
    default: return '未知应用';
  }
}

// 运行测试
runTests().catch(console.error);
