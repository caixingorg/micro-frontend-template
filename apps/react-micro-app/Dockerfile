# Build Stage
FROM node:18-alpine as builder
WORKDIR /app
RUN npm install -g pnpm

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy packages
COPY packages ./packages
COPY apps/react-micro-app ./apps/react-micro-app

# Install dependencies
RUN pnpm install --filter react-micro-app...

# Build
RUN pnpm --filter react-micro-app build

# Production Stage
FROM nginx:alpine
COPY apps/react-micro-app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/react-micro-app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
