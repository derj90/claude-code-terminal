FROM node:20-alpine

# Install dependencies needed for node-pty and Claude Code
RUN apk add --no-cache \
    bash \
    python3 \
    make \
    g++ \
    linux-headers \
    curl \
    git \
    openssh-client

# Install Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install npm dependencies including node-pty
RUN npm install --production

# Copy application code
COPY . .

# Make init script executable
RUN chmod +x /app/init-claude.sh

# Create user for Claude Code
RUN adduser -D -s /bin/bash claude

# Set up Claude Code environment for the claude user
USER claude
WORKDIR /home/claude

# Switch back to root to expose port and start service
USER root
WORKDIR /app

EXPOSE 3001

CMD ["npm", "start"]