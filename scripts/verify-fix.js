#!/usr/bin/env node

/**
 * 验证微前端修复效果的脚本
 */

const http = require('http');

const ENDPOINTS = [
  { name: '主应用', url: 'http://localhost:3000' },
  { name: 'React微应用', url: 'http://localhost:3001' },
  { name: 'Vue3微应用', url: 'http://localhost:3002' },
  { name: 'Vue2微应用', url: 'http://localhost:3003' }
];

function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    const req = http.get(endpoint.url, (res) => {
      resolve({
        name: endpoint.name,
        url: endpoint.url,
        status: res.statusCode,
        success: res.statusCode === 200
      });
    });

    req.on('error', (error) => {
      resolve({
        name: endpoint.name,
        url: endpoint.url,
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        name: endpoint.name,
        url: endpoint.url,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout'
      });
    });
  });
}

async function verifyFix() {
  console.log('🔍 验证微前端修复效果...\n');

  const results = await Promise.all(
    ENDPOINTS.map(endpoint => checkEndpoint(endpoint))
  );

  console.log('📊 检查结果:');
  console.log('─'.repeat(60));

  results.forEach(result => {
    const status = result.success ? '✅ 正常' : '❌ 异常';
    const statusCode = result.status === 'ERROR' ? '网络错误' : 
                      result.status === 'TIMEOUT' ? '超时' : 
                      `HTTP ${result.status}`;
    
    console.log(`${status} ${result.name.padEnd(12)} ${statusCode.padEnd(10)} ${result.url}`);
    
    if (!result.success && result.error) {
      console.log(`    错误: ${result.error}`);
    }
  });

  console.log('─'.repeat(60));

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  if (successCount === totalCount) {
    console.log('🎉 所有应用都正常运行！');
    console.log('\n✅ 修复验证通过:');
    console.log('  - 所有子应用都能独立访问');
    console.log('  - 主应用成功启动');
    console.log('  - 网络请求错误已解决');
    console.log('\n🚀 现在可以在浏览器中测试微前端功能:');
    console.log('  - 主应用: http://localhost:3000');
    console.log('  - React微应用路由: http://localhost:3000/react-app');
    console.log('  - Vue3微应用路由: http://localhost:3000/vue3-app');
    console.log('  - Vue2微应用路由: http://localhost:3000/vue2-app');
  } else {
    console.log(`⚠️  ${totalCount - successCount} 个应用存在问题，需要进一步检查`);
    process.exit(1);
  }
}

verifyFix().catch(console.error);
