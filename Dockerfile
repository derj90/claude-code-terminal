FROM node:20-alpine

RUN apk add --no-cache \
    bash \
    curl \
    git \
    openssh-client \
    python3 \
    make \
    g++ \
    linux-headers \
    udev

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

CMD ["npm", "start"]