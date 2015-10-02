var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT || 80);
app.use(express.static('./'));

var connections = [];

function getAllPlayers () {

  var names = [];    

  for (var i = 0; i < connections.length; i++) {
    if (connections[i].playerName) {
      names.push(connections[i].playerName);
    }
  }

  return names;
}


io.on('connection', function (socket) {
  
  connections.push(socket);
  
  console.log('User connected.');
  
  socket.on('disconnect', function () {
    console.log('User disconnected.');
    connections.splice(connections.indexOf(socket), 1);
  });
  
  socket.on('setPlayerName', function (data) {

    socket.playerName = data;

    var allPlayers = getAllPlayers();

    io.emit('players', allPlayers);

  });
  
  socket.on('startgame', function (player) {
    
    var playerOne = socket,
        playerTwo,
        roomName = player + socket.playerName,
        PLAYER_ONE_COLOR = 'w',
        PLAYER_TWO_COLOR = 'b';

    console.log(player + ' vs ' + socket.playerName);
   
    socket.room = roomName;
    
    for (var i = 0; i < connections.length; i++) {
      if (connections[i].playerName === player) {
        connections[i].room = roomName;
        playerTwo = connections[i];
      }
    }

    playerOne.join(roomName);
    playerTwo.join(roomName);

    playerOne.emit('newgame', PLAYER_ONE_COLOR);
    playerTwo.emit('newgame', PLAYER_TWO_COLOR);

    playerOne.on('makeMove', function (move) {
      console.log('MOVE MADE BY PLAYER ' + playerOne.playerName);
      move.color = PLAYER_ONE_COLOR;
      playerTwo.emit('makeMove', move);
    });

    playerTwo.on('makeMove', function (move) {
      console.log('MOVE MADE BY PLAYER ' + playerTwo.playerName);
      move.color = PLAYER_TWO_COLOR;
      playerOne.emit('makeMove', move);
    });

  });

  socket.on('challengePlayer', function (playerToChallenge) {
    for (var i = 0; i < connections.length; i++) {
      if (connections[i].playerName && connections[i].playerName === playerToChallenge) {
        connections[i].emit('challengeRequested', socket.playerName);
      }
    }
  });

});