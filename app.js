const express = require('express');
const app = express();
const socketio = require('socket.io');
const mongoose = require('mongoose');

const expressServer = app.listen(3001);
const io = socketio(expressServer);

const Game = require('./Models/Game');
const QuotableAPI = require('./QuotableAPI');

mongoose.connect('mongodb://localhost:27017/typeracerTutorial',
                {useNewUrlParser : true, useUnifiedTopology : true},
                ()=>{ console.log('successfully connected to database')});

io.on('connect',(socket)=>{
    socket.on('create-game',async (nickName)=>{
        try{
            // get words that our users have to type out
            const quotableData = await QuotableAPI();
            // create game
            let game = new Game();
            // set words
            game.words = quotableData;
            // create player
            let player = {
                socketID : socket.id,
                isPartyLeader : true,
                nickName
            }
            // add player
            game.players.push(player);
            // save the game
            game.save();
            // make players socket join the game room
            const gameID = game._id.toString();
            socket.join(gameID);
            // send updated game to all sockets within game
            io.to(gameID).emit('updateGame',game);
        }catch(err){
            console.log(err);
        }
    });
});
