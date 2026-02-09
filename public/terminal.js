const Terminal = window.Terminal;
const FitAddon = window.FitAddon.FitAddon;
const WebLinksAddon = window.WebLinksAddon.WebLinksAddon;

let term;
let ws;
let fitAddon;
let outputBuffer = '';

function initTerminal() {
    term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
            background: '#000000',
            foreground: '#e0e0e0',
            cursor: '#667eea',
            cursorAccent: '#000000',
            selection: 'rgba(102, 126, 234, 0.3)',
            black: '#000000',
            red: '#ff5555',
            green: '#50fa7b',
            yellow: '#f1fa8c',
            blue: '#667eea',
            magenta: '#bd93f9',
            cyan: '#8be9fd',
            white: '#e0e0e0',
            brightBlack: '#6272a4',
            brightRed: '#ff6e6e',
            brightGreen: '#69ff94',
            brightYellow: '#ffffa5',
            brightBlue: '#8b9bea',
            brightMagenta: '#d6acff',
            brightCyan: '#a4ffff',
            brightWhite: '#ffffff'
        },
        scrollback: 10000,
        convertEol: true
    });

    fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(webLinksAddon);
    
    term.open(document.getElementById('terminal'));
    fitAddon.fit();
    
    window.addEventListener('resize', () => {
        fitAddon.fit();
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'resize',
                cols: term.cols,
                rows: term.rows
            }));
        }
    });
    
    connectWebSocket();
}

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('WebSocket connected');
        updateStatus(true);
        
        ws.send(JSON.stringify({
            type: 'resize',
            cols: term.cols,
            rows: term.rows
        }));
        
        term.onData((data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'input',
                    data: data
                }));
            }
        });
        
        setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000);
    };
    
    ws.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'output') {
                term.write(msg.data);
                outputBuffer += msg.data;
                
                if (outputBuffer.length > 100000) {
                    outputBuffer = outputBuffer.slice(-50000);
                }
            }
        } catch (err) {
            console.error('Error processing message:', err);
        }
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateStatus(false);
    };
    
    ws.onclose = () => {
        console.log('WebSocket disconnected');
        updateStatus(false);
        term.write('\r\n\x1b[31mConnection lost. Click "Reconnect" to retry.\x1b[0m\r\n');
    };
}

function updateStatus(connected) {
    const statusElement = document.getElementById('status');
    const statusText = document.getElementById('status-text');
    
    if (connected) {
        statusElement.classList.remove('disconnected');
        statusText.textContent = 'Connected';
    } else {
        statusElement.classList.add('disconnected');
        statusText.textContent = 'Disconnected';
    }
}

function clearTerminal() {
    term.clear();
    outputBuffer = '';
}

function reconnect() {
    if (ws) {
        ws.close();
    }
    term.clear();
    term.write('Reconnecting...\r\n');
    setTimeout(connectWebSocket, 500);
}

function copyOutput() {
    const textToCopy = outputBuffer || term.buffer.active.getLine(0)?.translateToString() || '';
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = document.querySelector('.controls button:last-child').textContent;
        document.querySelector('.controls button:last-child').textContent = 'Copied!';
        setTimeout(() => {
            document.querySelector('.controls button:last-child').textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

document.addEventListener('DOMContentLoaded', initTerminal);