# Build Stage
FROM node:18-alpine as builder
WORKDIR /app
# Install pnpm
RUN npm install -g pnpm

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy packages
COPY packages ./packages
COPY apps/main-app ./apps/main-app

# Install dependencies (filter for main-app)
RUN pnpm install --filter main-app...

# Build
RUN pnpm --filter main-app build

# Production Stage
FROM nginx:alpine
COPY apps/main-app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/main-app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
