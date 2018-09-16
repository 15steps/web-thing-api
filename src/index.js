const WebSocket = require('ws');
const express = require('express');
const handleRequest = require('./handler');
const path = require('path');

// Express
const app = express();

// Serving static files on root
app.use('/', express.static(path.join(__dirname + '/../public')));
app.listen(3000, () => { console.log('Express server started on port 3000'); });

// WebSocket
const WebSocketServer = WebSocket.Server;
const wss = new WebSocketServer({port: 8080, path: '/pi'});

// Extending WebSocket to send json object mor easily
WebSocket.prototype.json = function(data) {
    if (typeof data === 'object') {
        this.send(JSON.stringify(data));
        // WebSocket.prototype.send(JSON.stringify(data));
    } else {
        throw Error("Parameter is not an object!");
    }
}

// Setting up WebSocket handler
wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        handleRequest(ws, data);
    });
});