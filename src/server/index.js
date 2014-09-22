var bg = require('backgammon-ai');
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var Human = require('./Human');

var games = [];

app.use('/', express.static(path.join(__dirname, '../../static')));

function startGame(socket) {
	var game = new bg.Game(500);
	// var display = new bg.Display(game);
	var humanInterface = new Human(socket);
	game.setController(humanInterface, 'Human');
	game.setController(new bg.controllers.PrimerEndGame(), 'PrimerEndGame');
	// game.setController(new bg.controllers.PrimerEndGame(), 'PrimerEndGame2');

	game.on('turnStart', function(id, dice) {
		if (id != humanInterface.id) {
			socket.emit('turnStart', dice);
		}
	})
	game.on('turn', function (id, moves) {
		if (id != humanInterface.id) {
			socket.emit('turn', game.board, moves);
		}
	});

	game.on('end', function () {
		// startGame();
	});

	game.start();
	return game;
}

io.on('connection', function (socket) {
	var game = startGame(socket);
	socket.join('game');
	socket.emit('turn', game.board);
	games.push(game);
});

module.exports = function () {
	server.listen(1234);
};
