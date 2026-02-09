FROM node:20-alpine

# Install dependencies needed for node-pty
RUN apk add --no-cache \
    bash \
    python3 \
    make \
    g++ \
    linux-headers

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install npm dependencies including node-pty
RUN npm install --production

# Copy application code
COPY . .

EXPOSE 3001

CMD ["npm", "start"]