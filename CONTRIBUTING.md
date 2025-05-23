# 贡献指南

感谢您对企业级微前端模版项目的关注！我们欢迎所有形式的贡献。

## 🤝 贡献方式

### 1. 代码贡献

#### 准备工作

1. **Fork 项目**
   ```bash
   # 在GitHub上Fork项目到你的账户
   # 然后克隆到本地
   git clone https://github.com/YOUR_USERNAME/micro-frontend-template.git
   cd micro-frontend-template
   ```

2. **安装依赖**
   ```bash
   # 安装pnpm (如果还没有安装)
   npm install -g pnpm
   
   # 安装项目依赖
   pnpm install
   ```

3. **设置开发环境**
   ```bash
   # 复制环境配置
   cp .env.example .env.local
   
   # 启动开发环境
   pnpm dev
   ```

#### 开发流程

1. **创建分支**
   ```bash
   # 从main分支创建新分支
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **开发和测试**
   ```bash
   # 进行开发
   # ...
   
   # 运行测试
   pnpm test
   
   # 检查代码规范
   pnpm lint
   
   # 类型检查
   pnpm type-check
   ```

3. **提交代码**
   ```bash
   # 添加文件
   git add .
   
   # 提交 (遵循Conventional Commits规范)
   git commit -m "feat: 添加新功能描述"
   
   # 推送到远程分支
   git push origin feature/your-feature-name
   ```

4. **创建Pull Request**
   - 在GitHub上创建Pull Request
   - 填写详细的描述
   - 等待代码审查

### 2. 文档贡献

#### 文档类型

- **API文档**: 更新`docs/api.md`
- **开发指南**: 更新`docs/development.md`
- **架构文档**: 更新`docs/architecture.md`
- **快速开始**: 更新`docs/quick-start.md`
- **README**: 更新`README.md`

#### 文档规范

- 使用清晰的标题结构
- 提供代码示例
- 包含必要的截图
- 保持内容简洁明了

### 3. 问题反馈

#### 报告Bug

使用[Bug报告模板](https://github.com/caixingorg/micro-frontend-template/issues/new?template=bug_report.md)：

- 详细描述问题
- 提供复现步骤
- 包含环境信息
- 附上错误截图或日志

#### 功能建议

使用[功能请求模板](https://github.com/caixingorg/micro-frontend-template/issues/new?template=feature_request.md)：

- 描述功能需求
- 说明使用场景
- 提供设计建议
- 考虑实现难度

## 📝 开发规范

### 代码规范

#### 1. 提交信息规范

遵循[Conventional Commits](https://www.conventionalcommits.org/)规范：

```bash
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**类型 (type):**
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构代码
- `test`: 添加测试
- `chore`: 构建过程或辅助工具的变动
- `perf`: 性能优化
- `ci`: CI配置文件和脚本的变动

**示例:**
```bash
feat(monitoring): 添加错误监控功能
fix(micro-app): 修复微应用加载失败问题
docs(api): 更新API文档
```

#### 2. 代码风格

- 使用TypeScript进行开发
- 遵循ESLint配置
- 使用Prettier格式化代码
- 保持代码简洁和可读性

#### 3. 命名规范

**文件命名:**
- 组件文件: `PascalCase.tsx`
- 工具文件: `camelCase.ts`
- 常量文件: `UPPER_SNAKE_CASE.ts`

**变量命名:**
- 变量和函数: `camelCase`
- 常量: `UPPER_SNAKE_CASE`
- 组件: `PascalCase`
- 类型: `PascalCase`

#### 4. 目录结构

```
src/
├── components/          # 组件
│   └── ComponentName/
│       ├── index.tsx
│       ├── ComponentName.tsx
│       ├── ComponentName.test.tsx
│       └── ComponentName.stories.tsx
├── pages/              # 页面
├── hooks/              # 自定义Hooks
├── utils/              # 工具函数
├── types/              # 类型定义
└── constants/          # 常量
```

### 测试规范

#### 1. 单元测试

- 使用Jest和React Testing Library
- 测试覆盖率要求 >= 80%
- 为核心功能编写测试

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

#### 2. 集成测试

- 测试微应用间的交互
- 验证状态管理
- 测试路由功能

#### 3. E2E测试

- 使用Cypress或Playwright
- 测试关键用户流程
- 验证跨浏览器兼容性

### 文档规范

#### 1. 代码注释

```typescript
/**
 * 用户信息接口
 */
interface UserInfo {
  /** 用户ID */
  id: string;
  /** 用户名 */
  name: string;
  /** 邮箱地址 */
  email: string;
}

/**
 * 获取用户信息
 * @param userId 用户ID
 * @returns 用户信息
 */
async function getUserInfo(userId: string): Promise<UserInfo> {
  // 实现逻辑
}
```

#### 2. README更新

- 保持README信息最新
- 添加新功能说明
- 更新使用示例

#### 3. API文档

- 使用JSDoc注释
- 提供完整的参数说明
- 包含使用示例

## 🔍 代码审查

### 审查清单

#### 功能性
- [ ] 功能是否按预期工作
- [ ] 是否有边界情况处理
- [ ] 错误处理是否完善
- [ ] 性能是否可接受

#### 代码质量
- [ ] 代码是否清晰易读
- [ ] 是否遵循项目规范
- [ ] 是否有重复代码
- [ ] 是否有安全问题

#### 测试
- [ ] 是否有足够的测试覆盖
- [ ] 测试是否有意义
- [ ] 是否通过所有测试

#### 文档
- [ ] 是否更新相关文档
- [ ] 代码注释是否充分
- [ ] API变更是否记录

### 审查流程

1. **自我审查**: 提交前自己检查代码
2. **同行审查**: 至少一个维护者审查
3. **自动检查**: CI/CD流程验证
4. **合并**: 审查通过后合并

## 🚀 发布流程

### 版本管理

使用[语义化版本](https://semver.org/)：

- `MAJOR`: 不兼容的API修改
- `MINOR`: 向下兼容的功能性新增
- `PATCH`: 向下兼容的问题修正

### 发布步骤

1. **更新版本号**
   ```bash
   # 更新package.json中的版本号
   pnpm version patch|minor|major
   ```

2. **生成变更日志**
   ```bash
   # 更新CHANGELOG.md
   pnpm changelog
   ```

3. **创建发布标签**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. **GitHub Release**
   - 在GitHub上创建Release
   - 填写发布说明
   - 附上构建产物

## 💬 社区

### 沟通渠道

- **GitHub Issues**: 问题报告和功能请求
- **GitHub Discussions**: 社区讨论
- **Pull Requests**: 代码贡献

### 行为准则

- 保持友善和尊重
- 建设性的反馈
- 帮助新贡献者
- 遵循开源精神

## 🙏 致谢

感谢所有为项目做出贡献的开发者！

### 贡献者

<!-- 这里会自动生成贡献者列表 -->

### 特别感谢

- 核心维护团队
- 文档贡献者
- 测试贡献者
- 社区支持者

---

再次感谢您的贡献！如果有任何问题，请随时在Issues中提出。
