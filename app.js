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

let users = [];

io.on('connection', (socket) => {
    socket.on('join_server', (un)=>{
        const user = { username: un, id: socket.id };
        users.push(user);
        console.log('Joined', users);
        io.emit('new user', users);
        if(users.length > 1){
            let roomname = users[0].id + 'vs' + users[1].id;
            console.log('Started new room: ' + roomname)
            for(let i = 0; i < 2; i++ ){
                io.to(users[0].id).emit('found', roomname)
                users = users.filter(u => u.id !== users[0].id);
            }
            console.log(users);
        }
    })

    socket.on('join_room', (rn)=>{
        socket.join(rn);
    })

    socket.on('unjoin', () => {
        users = users.filter(u => u.id !== socket.id);
        console.log('Unjoined', users);
    });

    socket.on('disconnect', () => {
        users = users.filter(u => u.id !== socket.id);
        console.log('Disconnent', users);
    });
    socket.on('message', (room, msg) => {
        socket.to(room).emit('msg', msg);
    });

});

server.listen(3000, () => {
    console.log('listening on *:3000');
});