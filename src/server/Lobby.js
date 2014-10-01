var bg = require('backgammon-ai');

function Lobby (io) {

	var self = this;

	self.io = io;

	function connection (socket) {

		sendLobby(socket);

		socket.on('playGame', function (options) {
			var type = options.type || '';
		});
	}

	function sendLobby (socket) {
		socket.emit('lobby', {
			types: ['human-vs-machine', 'machine-vs-machine'],
			controllers: ['Aggressive', 'PrimerEndGame', 'Runner', 'Random', 'Safe']
		});
	}

	function playGame () {

	}


	self.io.on('connection', connection);
}

module.exports = Lobby;