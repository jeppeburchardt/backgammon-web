var bg = require('backgammon-ai');
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var config = require('config');

var Lobby = require('./Lobby');

var Human = require('./Human');

var games = [];
var humanInterface;

app.use('/', express.static(path.join(__dirname, '../../static')));

var lobby = new Lobby(io);


function startGame(socket) {
	var game = new bg.Game(3000);
	// game.board.initialEndGameCheckers();
	// var display = new bg.Display(game);
	humanInterface = new Human(socket);
	game.setController(humanInterface, 'Human');
	game.setController(new bg.controllers.PrimerEndGame(), 'Machine');
	// game.setController(new bg.controllers.PrimerEndGame(), 'PrimerEndGame2');

	game.on('turnStart', function(id, dice) {
		socket.emit('turnStart', id, dice);
	})
	game.on('turn', function (id, moves) {
		socket.emit('turn', id, game.board, moves);
	});

	game.on('result', function (result) {
		// startGame();
		socket.emit('result', result);

	});

	game.start();
	return game;
}

io.on('__connection', function (socket) {
	var game = startGame(socket);
	socket.emit('playerId', humanInterface.id);
	socket.join('game');
	socket.emit('turn', game.getCurrentIndex(), game.board);
	games.push(game);
});

module.exports = function () {
	server.listen(config.web.port);
};
