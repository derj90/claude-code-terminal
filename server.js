const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const pty = require('node-pty');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'Claude Code Terminal',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

wss.on('connection', (ws) => {
  console.log('New terminal connection established');
  
  const shell = process.env.SHELL || '/bin/bash';
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 30,
    cwd: '/home/claude',
    env: {
      ...process.env,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
      HOME: '/home/claude',
      USER: 'claude',
      PATH: '/usr/local/bin:/usr/bin:/bin:/home/claude/.local/bin'
    }
  });

  ptyProcess.onData((data) => {
    try {
      ws.send(JSON.stringify({ type: 'output', data }));
    } catch (err) {
      console.error('Error sending data:', err);
    }
  });

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);
      
      switch(msg.type) {
        case 'input':
          ptyProcess.write(msg.data);
          break;
        case 'resize':
          ptyProcess.resize(msg.cols, msg.rows);
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
      }
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  ws.on('close', () => {
    console.log('Terminal connection closed');
    ptyProcess.kill();
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    ptyProcess.kill();
  });

  ptyProcess.write('source /app/init-claude.sh\n');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Claude Code Terminal running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});