const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
let messages = {};

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    console.log('Number of connected clients:', io.sockets.connected);
    socket.broadcast.emit('message', 'Hello everyone except the sender!');
    console.log('Broadcasted a message');

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

    socket.on('typing', (username) => {
        console.log('typing server', username);
        socket.broadcast.emit('TYPE', username); // broadcasting to all other clients
    });

    socket.on('stop typing', (username) => {
        console.log('typing server', username);
        socket.broadcast.emit('stop typing', username);
    });

    // Handle joining a room
    socket.on('joinRoom', (roomName) => {
        socket.join(roomName);
        console.log(`${socket.id} joined ${roomName}`);
    });
 
    // Handle leaving a room
    socket.on('leaveRoom', (roomName) => {
        socket.leave(roomName);
        console.log(`${socket.id} left ${roomName}`);
    });

    // Send a message to a specific room
    socket.on('sendMessageToRoom', ({ roomName, message }) => {
        io.to(roomName).emit('newMessage', `${socket.id}: ${message}`);
    });


    socket.on('joinRoom1', (data) => {
        socket.join(data.roomName);
        
        // Send existing messages to the user that just joined
        socket.emit('loadMessages1', messages[data.roomName] || []);
    });

    socket.on('sendMessageToRoom1', ({ roomName, message }) => {
        const newMessage = {
            userId: socket.id,
            message: message,
            timestamp: new Date()
        };

        if (!messages[roomName]) {
            messages[roomName] = [];
        }
        messages[roomName].push(newMessage);

        io.to(roomName).emit('newMessage', newMessage);
    });

    socket.on('disconnect', (reason) => {
        console.log(`socket ${socket.id} disconnected due to ${reason}`);
    });    
});

io.use((socket, next) => {
    socket.use((packet, nextPacket) => {
        console.log('Emitted event:', packet[0], 'with data:', packet[1]);
        nextPacket();
    });
    next();
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/chat.html');
});

app.get('/room', (req, res) => {
    res.sendFile(__dirname + '/room.html');
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
