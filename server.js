const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io');
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


io.on('connection',socket=>{
    socket.on('joinRoom',({username,room})=>{
        const user = userJoin(socket.id,username,room);
        socket.join(user.room)
        const usersInRoom = getRoomUsers(room);
        console.log(usersInRoom.length);
        if(usersInRoom.length==1){
            io.to(room).emit('firstPlayer',user.username);
        }else if(usersInRoom.length==2){
            io.to(room).emit('secondPlayer',{
                firstPlayer:getCurrentUser(usersInRoom[0].id).username,
                secondPlayer: user.username
            });
        }
    })

    socket.on('playerStep',({element_id,value,room})=>{
        io.to(room).emit('playerStepClient',({element_id,value}));
    })

    //send message when user disconnects
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);
        console.log(user.username," left the game")
    })


})


const PORT = 3000;

app.use(express.static(path.join(__dirname,'public')))

server.listen(PORT, ()=> console.log(`Server is running on ${PORT}`));