console.log('server started');

const express = require('express');
const app = express();
const http = require('http')
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
app.use(express.static('public'));


app.get('/', (req, res)=>{
    
})

io.on('connection', (socket) => {
    console.log('New connection: '+socket.id);

    socket.on('disconnect', () => {
        console.log('Disconnected: '+socket.id);
    });

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});