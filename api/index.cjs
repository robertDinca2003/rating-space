var express = require("express")
var http = require("http")
const cors = require("cors")
const { Server } = require('socket.io')
const app = express()

app.use(cors())

const server = http.createServer(app)

const lobbies = {};

const io = new Server(server,{
    cors: {
        origin: "https://rating-space.vercel.app",
        methods:["GET","POST"],
        allowedHeaders: ['Content-Type'],
        credentials: true,
    }
});

io.on("connection", (socket) =>{
    console.log(`User Connected: ${socket.id}`)

    socket.on("checkConnection",(username, roomId)=>{
        console.log("checking ",socket.id)
        if(!lobbies[roomId])
        {
            console.log("Room do not exits",roomId);
            return;
        }
        // for(let [key,element] of Object.entries(lobbies))
        //     {
        //         console.log(key,element)
        //         if(element.hostUserId === username){
        //             element.hostId = socket.id;
        //             socket.join(key);
        //             console.log("Socket set as admin",username)
        //         }
        //     }
        if(lobbies[roomId].hostUserId === username){
                        lobbies[roomId].hostId = socket.id;
                        console.log("Socket set as admin",username)
            }
        else{
            console.log("Voter joined",roomId);
        }
        socket.join(roomId);
        socket.username = username;

    })  
    
    
    
    // socket.on("join_room", (data) => {
    //     socket.join(data);
    //   });
    
    //   socket.on("send_message", (data) => {
    //     socket.to(data.room).emit("receive_message", data);
    //   });

    socket.on("createLobby", (lobbyInfo,host,callback) => {
        // const lobbyId = Math.random().toString(36).substr(2,9);
        lobbies[lobbyInfo.id] = {
            hostId: socket.id,
            hostUserId: host,
            votes: {}
        };
        socket.join(lobbyInfo.id);
        callback(lobbyInfo.id);
        console.log(`Lobby created succesfully, id: ${lobbyInfo.id} host: ${host}`)
        console.log("joined ",socket.id);

    });

    socket.on('joinLobby',(roomId, username,callback) =>{
            if(lobbies[roomId])
            {
                socket.join(roomId);
                socket.username = username;
                if(lobbies[roomId].hostUserId === username){
                    lobbies[roomId].hostId = socket.id;
                    callback(true,true);
                    return;
                }
                callback(true,false);
                console.log(`${username} joined room ${roomId}`)
            }
            else{
                callback(false,false);
            }
    });

    socket.on("createVoting", (lobbyId, username, question, round,participant)=>{
        if(lobbies[lobbyId] && lobbies[lobbyId].hostId === socket.id){
            if(!lobbies[lobbyId].votes[round])
                lobbies[lobbyId].votes[round] = [];
            io.to(lobbyId).emit('newVoting', question, round, participant);
            console.log("Question released: ", question, " by ", username);
        }
        else{
            console.log("Wrong host", username, lobbies[lobbyId]);
        }
    });

    socket.on("submitVote", (lobbyId, vote, round, participant) => {
        if(lobbies[lobbyId]){
            lobbies[lobbyId].votes[round].push({username:socket.username, grade:vote, for: participant})
            console.log("Has voted", socket.id)
            console.log( lobbies[lobbyId].votes[round])
            io.to(lobbyId).emit('updateVotes', lobbies[lobbyId].votes);
        }
        else{
            console.log(lobbyId, "do not exist");
        }
    });

    socket.on('stopVoting', (lobbyId, username)=>{
        if(lobbies[lobbyId]){
            if(lobbies[lobbyId].hostUserId !== username)
            {
                console.log("Illegal action by", socket.id);
                return;
            }
            socket.to(lobbyId).emit('stopVote')
            console.log("Round has ended by: ", socket.id);
        }
    })

    socket.on('endVoting',(lobbyId,username) =>{
        console.log("end",socket.id);
        if(lobbies[lobbyId] && lobbies[lobbyId].hostUserId === username){
            io.to(lobbyId).emit('votingResults', lobbies[lobbyId].votes);
            console.log("Vote Ended", lobbyId)
            delete lobbies[lobbyId];
        }
        else{
            console.log("Error")
        }
    })

    socket.on('disconnect', () =>{
        console.log("User Disconected");
    })

})
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>{
    console.log("I am running nigga")
})