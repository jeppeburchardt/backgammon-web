var bg = require('backgammon-ai');

var Human = require('./Human');
var bg = require('backgammon-ai');

function Lobby (io) {

	var self = this;

	self.io = io;

	function connection (socket) {

		sendLobby(socket);

		socket.on('playGame', function (options) {
			
			socket.emit('prepareGame');

			switch(options.type) {
				
				case 'human-vs-machine':
					humanVsMachine(socket, options);
					break;

				case 'machine-vs-machine':
					machineVsMachine(socket, options);
					break;
			}
		});
	}

	function sendLobby (socket) {
		var controllers = [];
		for (var s in bg.controllers) {
			controllers.push(s);
		}
		socket.emit('lobby', {
			types: ['human-vs-machine', 'machine-vs-machine'],
			controllers: controllers
		});
	}

	function humanVsMachine (socket, options) {
		try {
			var game = new bg.Game(3000);
			var humanInterface = new Human(socket);
			game.setController(humanInterface, options.playerName || 'Human');
			game.setController(new bg.controllers[options.controllerA](), options.controllerA);
			game.on('turnStart', function(id, dice) {
				socket.emit('turnStart', id, dice);
			})
			game.on('turn', function (id, moves) {
				socket.emit('turn', id, game.board, moves);
			});
			game.on('result', function (result) {
				socket.emit('result', result);

			});

			socket.emit('playerId', humanInterface.id);
			socket.emit('turn', game.getCurrentIndex(), game.board);

			game.start();
		} catch (e) {
			sendLobby(socket);
		}
	}

	function machineVsMachine (socket, options) {
		var game = new bg.Game(3000);
		try {
			game.setController(new bg.controllers[options.controllerA](), options.controllerA);
			game.setController(new bg.controllers[options.controllerB](), options.controllerB);

			game.on('turnStart', function(id, dice) {
				socket.emit('turnStart', id, dice);
			})
			game.on('turn', function (id, moves) {
				socket.emit('turn', id, game.board, moves);
			});
			game.on('result', function (result) {
				socket.emit('result', result);
			});
			socket.emit('turn', game.getCurrentIndex(), game.board);
			game.start();
		} catch (e) {
			console.log(bg.controllers[options.controllerA], bg.controllers, options.controllerA);
			sendLobby(socket);
		}
	}


	self.io.on('connection', connection);
}

module.exports = Lobby;