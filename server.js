const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    // User joins a room
    socket.on('join', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    // User sends a message in a room
    socket.on('chat message', (data) => {
        const { room, msg } = data;
        io.to(room).emit('chat message', msg); // Send message only to users in this room
    });

    socket.on('disconnect', (reason) => {
        console.log(`socket ${socket.id} disconnected due to ${reason}`);
    });    
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
