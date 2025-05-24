# 微前端 "Failed to fetch" 错误综合修复方案

## 问题描述

在qiankun微前端架构中，主应用加载子应用时出现 "Failed to fetch" 错误，导致所有子应用无法正常加载。

## 错误原因分析

1. **CORS配置问题**: 子应用的CORS设置过于严格，阻止了主应用的跨域请求
2. **网络超时**: 默认的fetch请求没有超时控制，可能导致请求挂起
3. **错误处理不足**: 缺乏重试机制和详细的错误信息
4. **开发环境特殊性**: localhost环境下的网络请求可能需要特殊处理

## 修复方案

### 1. 增强MicroAppManager的fetch功能

**文件**: `packages/micro-app-sdk/src/MicroAppManager.ts`

**主要改进**:
- 添加自定义fetch函数，增强错误处理
- 实现超时控制（10秒）
- 添加重试机制（针对localhost）
- 优化CORS和请求头配置
- 添加详细的日志记录

**关键代码**:
```typescript
const customFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  console.log(`[MicroApp] Fetching: ${url}`);
  
  try {
    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        ...options?.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    // 重试逻辑...
    throw error;
  }
};
```

### 2. 优化子应用CORS配置

#### React微应用 (webpack.config.js)
```javascript
devServer: {
  headers: {
    'Access-Control-Allow-Origin': '*',  // 改为允许所有来源
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    'Access-Control-Allow-Credentials': 'false',
  },
  client: {
    webSocketURL: 'ws://localhost:3001/ws',  // 明确指定WebSocket URL
  },
}
```

#### Vue3微应用 (vite.config.ts)
```typescript
server: {
  cors: {
    origin: '*',  // 改为允许所有来源
    credentials: false,
  },
  headers: {
    'Access-Control-Allow-Origin': '*',
    // ... 其他头部配置
  },
}
```

#### Vue2微应用 (webpack.config.js)
```javascript
devServer: {
  headers: {
    'Access-Control-Allow-Origin': '*',  // 改为允许所有来源
    // ... 其他配置
  },
  client: {
    webSocketURL: 'ws://localhost:3003/ws',
  },
}
```

### 3. 添加调试工具

**文件**: `scripts/debug-micro-apps.js`

提供全面的诊断功能:
- 检查所有应用的连接状态
- 验证CORS配置
- 检测qiankun生命周期函数
- 验证UMD导出格式

**使用方法**:
```bash
node scripts/debug-micro-apps.js
```

## 验证步骤

### 1. 重新构建并启动所有应用
```bash
# 清理并重新安装依赖
pnpm install

# 启动所有应用
pnpm dev
```

### 2. 运行调试工具
```bash
node scripts/debug-micro-apps.js
```

### 3. 检查浏览器控制台
打开 http://localhost:3000，查看控制台日志：
- 应该看到 `[MicroApp] Started successfully with enhanced fetch`
- 导航到子应用路由时，应该看到详细的加载日志
- 不应该再出现 "Failed to fetch" 错误

### 4. 测试所有路由
- 主应用: http://localhost:3000
- React微应用: http://localhost:3000/react-app
- Vue3微应用: http://localhost:3000/vue3-app
- Vue2微应用: http://localhost:3000/vue2-app

## 预期效果

修复后应该看到：
1. ✅ 所有子应用能够正常加载
2. ✅ 控制台显示详细的加载日志
3. ✅ 网络请求成功，无CORS错误
4. ✅ 子应用路由正常工作
5. ✅ 应用间通信正常

## 故障排除

如果仍然遇到问题：

1. **检查端口占用**:
   ```bash
   lsof -ti:3000,3001,3002,3003
   ```

2. **清理缓存**:
   ```bash
   # 清理浏览器缓存
   # 重启开发服务器
   ```

3. **检查防火墙设置**:
   确保localhost端口没有被防火墙阻止

4. **查看详细错误**:
   打开浏览器开发者工具的Network标签，查看具体的请求失败信息

## 技术要点

1. **超时控制**: 防止请求无限挂起
2. **重试机制**: 提高开发环境的稳定性
3. **CORS优化**: 确保跨域请求正常
4. **错误日志**: 便于问题诊断和调试
5. **兼容性**: 支持不同框架和构建工具

这个综合修复方案解决了微前端架构中常见的网络请求问题，提供了更稳定和可靠的开发体验。
