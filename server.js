const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder 
app.use(express.static(path.join(__dirname, 'public')));

//bot name
const botName = 'Admin bot';

// Run when client connect
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to SpireChat'));

        //Broadcast when user connects 
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, 'A user has joined the chat'));
    });

    //Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        io.emit('message', formatMessage('User',msg));
    });

    //Runs when client disconnects
    socket.on('disconnect', () => {
        io.emit('message',formatMessage(botName ,'A user has left a chat'));
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));