# 企业级微前端模版

基于 qiankun 的企业级微前端解决方案，支持 React、Vue3 等多种技术栈。

## ✨ 特性

- 🚀 **开箱即用** - 完整的项目结构和配置
- 🏗️ **企业级架构** - 基于 qiankun 的成熟微前端方案
- 🔧 **优秀的开发体验** - 热更新、TypeScript、ESLint
- 📈 **高可扩展性** - 支持多种前端框架
- 🛡️ **生产就绪** - 完善的测试、CI/CD 流程
- 🎨 **统一设计语言** - 基于 Ant Design 的一致性体验

## 🏗️ 架构设计

```
micro-frontend-template/
├── apps/                          # 应用目录
│   ├── main-app/                  # 主应用 (React + TypeScript)
│   ├── react-micro-app/           # React 微应用
│   └── vue3-micro-app/            # Vue3 微应用
├── packages/                      # 共享包目录
│   ├── shared-components/         # 共享组件库
│   ├── shared-utils/             # 共享工具库
│   ├── shared-types/             # 共享类型定义
│   └── micro-app-sdk/            # 微应用SDK
├── tools/                        # 工具目录
├── docs/                         # 文档目录
└── .github/                      # GitHub Actions
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
# 安装 pnpm (如果还没有安装)
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 启动开发环境

```bash
# 启动所有应用
pnpm dev

# 或者分别启动
pnpm --filter main-app dev          # 主应用 (端口: 3000)
pnpm --filter react-micro-app dev   # React微应用 (端口: 3001)
pnpm --filter vue3-micro-app dev    # Vue3微应用 (端口: 3002)
```

### 构建生产版本

```bash
# 构建所有应用
pnpm build

# 构建特定应用
pnpm --filter main-app build
```

## 📦 技术栈

### 主应用
- **框架**: React 18 + TypeScript
- **状态管理**: Redux Toolkit
- **路由**: React Router v6
- **UI组件**: Ant Design
- **构建工具**: Webpack 5

### React 微应用
- **框架**: React 18 + TypeScript
- **UI组件**: Ant Design
- **路由**: React Router v6
- **构建工具**: Webpack 5

### Vue3 微应用
- **框架**: Vue 3 + TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router v4
- **UI组件**: Ant Design Vue
- **构建工具**: Vite

### 共享包
- **微前端框架**: qiankun
- **HTTP客户端**: Axios
- **工具库**: 自定义工具函数
- **类型定义**: TypeScript 类型

## 🔧 开发指南

### 添加新的微应用

1. 在 `apps/` 目录下创建新应用
2. 配置 `package.json` 和构建工具
3. 实现 qiankun 生命周期函数
4. 在主应用中注册微应用

```typescript
// apps/main-app/src/config/microApps.ts
export const microApps: MicroAppConfig[] = [
  {
    name: 'new-micro-app',
    entry: '//localhost:3003',
    container: '#new-micro-app-container',
    activeRule: '/new-app',
  },
];
```

### 应用间通信

```typescript
// 发送消息
import { globalEventBus } from '@enterprise/micro-app-sdk';

globalEventBus.emit('user:login', userInfo);

// 监听消息
globalEventBus.on('user:login', (userInfo) => {
  console.log('用户登录:', userInfo);
});
```

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 运行测试覆盖率
pnpm test:coverage

# 运行特定应用的测试
pnpm --filter main-app test
```

## 📝 代码规范

### ESLint 配置
项目使用统一的 ESLint 配置，支持 React、Vue、TypeScript。

```bash
# 检查代码规范
pnpm lint

# 自动修复
pnpm lint:fix
```

### 提交规范
使用 Conventional Commits 规范：

```bash
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 重构代码
test: 添加测试
chore: 构建过程或辅助工具的变动
```

## 📚 文档

### 📖 完整文档

- 🚀 [快速开始](./docs/quick-start.md) - 5分钟快速体验
- 📖 [开发指南](./docs/development.md) - 详细的开发文档
- 🏗️ [架构设计](./docs/architecture.md) - 了解系统架构
- 📚 [API文档](./docs/api.md) - 查看API参考

### 🎯 核心特性文档

#### 🔍 监控和分析
- **错误监控**: 自动捕获JavaScript错误、Promise rejection、资源加载错误
- **性能监控**: 收集LCP、FID、CLS等核心性能指标
- **用户分析**: 跟踪页面访问、用户行为、热力图数据
- **实时监控**: 开发者工具面板实时显示监控数据

#### 🛠️ 开发体验
- **可视化工具**: 微应用状态监控面板
- **热重载**: 支持微应用热重载，提升开发效率
- **API Mock**: 强大的API拦截和Mock系统
- **组件文档**: Storybook组件库文档

#### 🎮 快捷键支持
- `Ctrl/Cmd + Shift + D`: 切换开发者工具面板
- `Ctrl/Cmd + Shift + M`: 切换API Mock
- `Ctrl/Cmd + Shift + H`: 切换热重载
- `Ctrl/Cmd + Shift + R`: 刷新微应用

### 🧩 共享包生态

| 包名 | 描述 | 版本 |
|------|------|------|
| `@enterprise/shared-types` | 统一类型定义 | ![npm](https://img.shields.io/badge/npm-1.0.0-blue) |
| `@enterprise/shared-utils` | 通用工具函数 | ![npm](https://img.shields.io/badge/npm-1.0.0-blue) |
| `@enterprise/micro-app-sdk` | 微应用管理SDK | ![npm](https://img.shields.io/badge/npm-1.0.0-blue) |
| `@enterprise/shared-components` | 共享UI组件库 | ![npm](https://img.shields.io/badge/npm-1.0.0-blue) |
| `@enterprise/monitoring-sdk` | 监控分析SDK | ![npm](https://img.shields.io/badge/npm-1.0.0-blue) |
| `@enterprise/dev-tools` | 开发工具包 | ![npm](https://img.shields.io/badge/npm-1.0.0-blue) |
| `@enterprise/webpack-config` | Webpack配置包 | ![npm](https://img.shields.io/badge/npm-1.0.0-blue) |
| `@enterprise/eslint-config` | ESLint配置包 | ![npm](https://img.shields.io/badge/npm-1.0.0-blue) |

## 🎯 下一步

### 学习更多

- 🚀 [快速开始](./docs/quick-start.md) - 5分钟快速体验
- 📖 [开发指南](./docs/development.md) - 详细的开发文档
- 🏗️ [架构设计](./docs/architecture.md) - 了解系统架构
- 📚 [API文档](./docs/api.md) - 查看API参考

### 扩展功能

- 🔍 配置错误监控服务 (如Sentry)
- 📊 集成用户分析服务 (如Google Analytics)
- 🎨 自定义主题和样式
- 🌐 添加国际化支持
- 🔐 集成身份认证系统
- 📱 响应式设计优化

### 社区支持

- 🐛 [报告问题](https://github.com/caixingorg/micro-frontend-template/issues)
- 💡 [功能建议](https://github.com/caixingorg/micro-frontend-template/discussions)
- 📖 [贡献指南](./CONTRIBUTING.md)
- 💬 [社区讨论](https://github.com/caixingorg/micro-frontend-template/discussions)

## 🤝 贡献

我们欢迎所有形式的贡献！

### 贡献方式

1. **代码贡献**
   - Fork 项目
   - 创建特性分支 (`git checkout -b feature/AmazingFeature`)
   - 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
   - 推送到分支 (`git push origin feature/AmazingFeature`)
   - 打开 Pull Request

2. **文档贡献**
   - 改进现有文档
   - 添加使用示例
   - 翻译文档

3. **问题反馈**
   - 报告Bug
   - 提出功能建议
   - 分享使用经验

### 开发规范

- 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 提交规范
- 使用 TypeScript 进行类型安全开发
- 编写单元测试覆盖新功能
- 更新相关文档

## 📊 项目统计

![GitHub stars](https://img.shields.io/github/stars/caixingorg/micro-frontend-template?style=social)
![GitHub forks](https://img.shields.io/github/forks/caixingorg/micro-frontend-template?style=social)
![GitHub issues](https://img.shields.io/github/issues/caixingorg/micro-frontend-template)
![GitHub license](https://img.shields.io/github/license/caixingorg/micro-frontend-template)

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](./LICENSE) 文件。

## 🙏 致谢

感谢以下开源项目和社区：

- [qiankun](https://qiankun.umijs.org/) - 微前端框架
- [React](https://reactjs.org/) - 用户界面库
- [Vue.js](https://vuejs.org/) - 渐进式框架
- [Ant Design](https://ant.design/) - 企业级UI设计语言
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的JavaScript
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [pnpm](https://pnpm.io/) - 快速、节省磁盘空间的包管理器

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=caixingorg/micro-frontend-template&type=Date)](https://star-history.com/#caixingorg/micro-frontend-template&Date)

---

<div align="center">

**[⬆ 回到顶部](#企业级微前端模版)**

Made with ❤️ by [Enterprise Team](https://github.com/caixingorg)

</div>
