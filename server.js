var fs = require('fs');

var express = require('express');
var app = express();
var server = require('http').Server(app);
server.listen(80);
var io = require('socket.io')(server);
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.engine('html', rawHtmlViewEngine);
app.set('views', './');
app.set('view engine', 'html');
function rawHtmlViewEngine(filename, options, callback) {
    fs.readFile(filename, 'utf8', function(err, str){
        if(err) return callback(err);

        /*
         * if required, you could write your own 
         * custom view file processing logic here
         */

        callback(null, str);
    }); 
}
app.get('/', function(request, response) {
  response.render('index.html');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


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