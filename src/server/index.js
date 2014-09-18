var bg = require('backgammon-ai');
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var game = null;

app.use('/', express.static(path.join(__dirname, '../../static')));

function startGame() {
	game = new bg.Game(500);
	var display = new bg.Display(game);
	game.setController(bg.controllers.Aggressive, 'Aggressive');
	game.setController(bg.controllers.PrimerEndGame, 'PrimerEndGame');

	game.on('turn', function () {
		io.to('game').emit('turn', game.board);
	});

	game.on('end', function () {
		startGame();
	});

	game.start();
}

io.on('connection', function (socket) {
	socket.join('game');
});

module.exports = function () {
	server.listen(1234);
	startGame();
};
