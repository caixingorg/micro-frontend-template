# 微前端架构分析与演进规划报告

**角色**: 微前端技术专家 / 前端架构师
**目标**: 梳理当前项目现状，对标企业级微前端标准，分析现存问题与差距，并制定后续优化与演进计划。

---

## 1. 当前项目现状概述

经过对代码库的初步盘点，当前项目处于**极早期的原型/骨架阶段**，具体表现如下：

- **工程结构**: 采用了基于 Lerna/Yarn Workspaces 风格的 Monorepo 目录结构（`packages/*`）。
- **应用实体**:
  - `main-app` (主应用/基座): **空目录**。
  - `react-app` (React子应用): **空目录**。
  - `vue3-micro-app` (Vue3子应用): 已有初步代码，基于 Vite 构建，并引入了 `vite-plugin-qiankun` 插件，代码中包含了 qiankun 生命周期的暴露（`mount`, `bootstrap`, `unmount` 等）。另外还包含处理 webpack `public_path` 的残留文件（`public-path.ts`），这在纯 Vite 架构下可能存在冗余或混用情况。
- **脚手架与脚本**:
  - `scripts/start.js` 利用 `concurrently` 进行多进程启动，但实际上有应用是空的，会导致启动报错。
  - `scripts/build.js` 使用原生的 `child_process.execSync` 串行执行构建，效率低下。
  - `scripts/deploy.js` 仅包含构建和 `console.log` 的占位逻辑，缺乏真实的部署编排。

**结论**: 当前项目仅是一个“微前端想法”的占位符，确定了采用 **qiankun** 作为基础底座（从 Vue3 子应用的插件可推断），但在工程化、主子应用协同、运行期隔离等方面几乎处于零起点。

---

## 2. 对标企业级微前端架构的差距分析

要达到“企业级微前端应用”的标准，当前系统在以下几个核心维度存在巨大缺失和问题：

### 2.1 基础设施与运行底座 (基座应用)
- **缺失主基座**: 所有的子应用都需要一个宿主环境来协调。当前 `main-app` 为空，缺失了关键的 qiankun `registerMicroApps` 注册逻辑、全局错误捕获、以及主布局（Layout/Menu/Header）的承载。
- **微前端框架整合不完善**: `vue3-micro-app` 虽然配置了 `vite-plugin-qiankun`，但 `vite.config.js` 的 origin 写死为 `http://localhost:3001`，且缺少企业级应用应有的动态 publicPath 处理和跨域（CORS）配置规范。

### 2.2 隔离机制 (Sandbox Isolation)
- **样式隔离 (CSS Isolation)**: 当前暂未看到任何样式隔离方案。在真实的基座与多子应用场景中，极易出现全局 CSS 污染。缺少类似于 `strictStyleIsolation` 或 `experimentalStyleIsolation` 的规划，也未使用 CSS Modules 或 BEM 规范作为降级方案。
- **JS 沙箱机制**: 依赖 qiankun 默认沙箱，但在 Vite（ESM）模式下，qiankun 的传统 Proxy 沙箱运行存在天然冲突（这就是为什么要用 `vite-plugin-qiankun` 这种 hack 方案）。企业级方案需要明确 ESM 与微前端结合的沙箱边界，或是评估是否转向支持 ESM 更友好的方案（如 Wujie、Micro-app）或 Module Federation。

### 2.3 路由分发与控制 (Routing Distribution)
- **路由一致性**: 主应用（待建）与子应用之间的路由同步机制缺失。子应用（如 vue3 的 vue-router）如果使用 `history` 模式，需要与基座的 base 路由严密结合。目前子应用的 router 未根据 qiankun 的环境（`__POWERED_BY_QIANKUN__`）动态设置 `base`。

### 2.4 状态管理与应用通信 (State & Communication)
- **数据流转**: 没有任何主子应用之间的数据通信机制设计。企业级应用通常需要：
  - **Global State**: 比如当前登录用户信息、Token、全局权限点等（qiankun 的 `initGlobalState`）。
  - **Event Bus / PubSub**: 处理跨应用的松耦合事件交互。

### 2.5 依赖共享与公共库管理
- **重复打包**: 目前 `package.json` 没有统一管理共用依赖（如 Vue, React, UI 组件库）。每个应用完全独立打包，导致最终页面加载时重复加载大量相同的底层库，违背了微前端优化性能的初衷。

### 2.6 工程化与构建部署 (Build & Deployment)
- **Monorepo 管理粗糙**: 虽然有 `packages` 目录，但没有使用真正的 Monorepo 工具链的威力（目前 `lerna.json` 为空且未实际使用）。
- **构建效率低**: `build.js` 中使用串行构建，如果项目变大会非常缓慢。缺少如 Nx、Turborepo、Lerna 等工具来提供基于拓扑依赖图的并发构建和缓存机制。
- **部署割裂**: 没考虑微前端的独立部署特性。企业级微前端的一大优势是“独立部署”。目前的脚本将其强绑定在了一起，缺少静态资源的 CDN 规划和 Nginx 动态代理/HTML Entry 缓存清理策略。

---

## 3. 后续演进与优化规划 (Action Plan)

为了将此项目打造为合格的企业级微前端架构，建议按以下阶段进行重构和演进。

### 阶段一：基座搭建与核心链路打通（MVP）
1. **初始化 Main App**: 使用 Vue3 或 React 创建基座应用。
2. **集成 Qiankun**: 在基座中注册现有的 `vue3-micro-app` 以及未来即将创建的 `react-app`。
3. **路由和导航**: 在基座中实现基础的侧边栏菜单（Menu）和页面容器，验证点击菜单能否正确加载 Vue3 子应用。
4. **Vite 兼容性处理**: 完善 `vue3-micro-app` 中 `vite-plugin-qiankun` 的配置，修复可能存在的热更新（HMR）及静态资源加载路径问题。

### 阶段二：建立企业级规范与隔离机制
1. **应用间通信规范**: 接入 `initGlobalState`，实现用户登录状态（Token）从主应用下发到子应用的闭环。
2. **样式隔离策略**: 确立各应用的 CSS 命名空间（或启用严格隔离机制），防止由于类名冲突导致的 UI 样式崩坏。
3. **路由拦截与权限**: 基座接管权限控制（RBAC），子应用按需获取当前用户的权限字典，实现路由守卫。
4. **清理冗余代码**: 清除旧有的 Webpack 遗留代码（如 `public-path.ts` 等），确保体系纯粹。

### 阶段三：全面工程化与性能调优
1. **升级 Monorepo 工具链**: 废弃手写的 `scripts/build.js`，引入 **Turborepo** 或 **pnpm workspaces**。利用其构建缓存和并行任务管理能力极大提升开发体验。
2. **依赖共享 (依赖联邦)**: 探索 Vite 下共享底层依赖（如 Vue/React 等 vendor 包）的方案（例如 ESM 外部化 `external` + Import Maps 或 Vite Module Federation）。
3. **标准化 CI/CD**: 设计支持“主子应用解耦”的 CI 流水线。允许任意子应用修改后，单独触发构建并部署自己的产物，而无需重新打包基座。
4. **规范化工具**: 配置根目录的 ESLint, Prettier, Husky (已在依赖中，但需完善 Git Hooks)，统一全栈的代码风格。

---

**请确认以上分析与规划。确认后，我们可以开始执行“阶段一”的任务，例如为您初始化完善主基座（main-app）。**
