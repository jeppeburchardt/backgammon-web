var bg = require('backgammon-ai');

var HumanSocketInterface = require('./HumanSocketInterface');
var bg = require('backgammon-ai');

function Lobby (io) {

	var self = this;

	self.io = io;
	self.waitngPlayer = null;

	function onConnection (socket) {

		sendLobby(socket);

		socket.on('playGame', function (options) {
			
			switch(options.type) {
				
				case 'human-vs-machine':
					humanVsMachine(socket, options);
					break;

				case 'machine-vs-machine':
					machineVsMachine(socket, options);
					break;

				case 'human-vs-human':
					humanVsHuman(socket, options);
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

	function humanVsHuman (socket, options) {
		if (self.waitngPlayer != null) {
			var player = self.waitngPlayer;
			self.waitngPlayer = null;

			socket.emit('prepareGame');
			player.socket.emit('prepareGame');

			var game = new bg.Game(3000);
			game.setController(new HumanSocketInterface(socket, game), options.playerName || 'Player A');
			game.setController(new HumanSocketInterface(player.socket, game), player.options.playerName || 'Player B');
			game.start();

		} else {
			self.waitngPlayer = {
				socket: socket,
				options: options
			};
			socket.emit('waitingForOtherPlayer');
		}
	}

	function humanVsMachine (socket, options) {
		try {
			socket.emit('prepareGame');
			var game = new bg.Game(3000);
			var humanInterface = new HumanSocketInterface(socket, game);
			game.setController(humanInterface, options.playerName || 'Human');
			game.setController(new bg.controllers[options.controllerA](), options.controllerA);
			game.start();
		} catch (e) {
			sendLobby(socket);
		}
	}

	function machineVsMachine (socket, options) {
		socket.emit('prepareGame');
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


	self.io.on('connection', onConnection);
}

module.exports = Lobby;