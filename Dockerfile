# 多阶段构建 Dockerfile
FROM node:18-alpine AS base

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json ./packages/*/
COPY apps/*/package.json ./apps/*/
COPY tools/*/package.json ./tools/*/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产阶段
FROM nginx:alpine AS production

# 复制 nginx 配置
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 复制构建产物
COPY --from=builder /app/apps/main-app/dist /usr/share/nginx/html
COPY --from=builder /app/apps/react-micro-app/dist /usr/share/nginx/html/react-micro-app
COPY --from=builder /app/apps/vue3-micro-app/dist /usr/share/nginx/html/vue3-micro-app

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
