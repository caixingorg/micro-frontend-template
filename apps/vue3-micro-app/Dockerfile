# Build Stage
FROM node:18-alpine as builder
WORKDIR /app
RUN npm install -g pnpm

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy packages
COPY packages ./packages
COPY apps/vue3-micro-app ./apps/vue3-micro-app

# Install dependencies
RUN pnpm install --filter vue3-micro-app...

# Build
RUN pnpm --filter vue3-micro-app build

# Production Stage
FROM nginx:alpine
COPY apps/vue3-micro-app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/vue3-micro-app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
