var Q = require('q');

var Human = function (socket, game) {

	var self = this;
	self.id = -1;
	self.game = game;
	self.socket = socket;

	self.game.on('turnStart', function(id, dice) {
		self.socket.emit('turnStart', id, dice);
	})
	self.game.on('turn', function (id, moves) {
		self.socket.emit('turn', id, self.game.board, moves);
	});
	self.game.on('result', function (result) {
		self.socket.emit('result', result);
	});
	self.game.on('controller', function (controller) {
		if (self === controller) {
			self.socket.emit('playerId', controller.id);
			self.socket.emit('turn', self.game.getCurrentIndex(), self.game.board);
		}
	});

	// self.socket.on('disconnect', function () {
	// 	console.log('HumanSocketInterface lost connection');
	// });

	this.turn = function (dice, board) {

		var deferred = Q.defer();
		var result = [];

		if (self.socket.disconnected) {
			deferred.reject('Socket disconnected');
			return deferred.promise;
		}
		
		var permutations = board.getAllPermutations(self.id, dice);
		var availableMoves = permutations.map(function(p) { return p.moves; });

		self.socket.emit('dice', {dice:dice, availableMoves:availableMoves});

		self.socket.on('move', function (moves) {

			var isMoveLegal = permutations.some(function (p) {
				return JSON.stringify(p.moves) === JSON.stringify(moves);
			});

			if (isMoveLegal) {
				socket.removeAllListeners('move');
				deferred.resolve(moves);

			} else {
				self.socket.emit('illegal', moves);

			}

		});

		return deferred.promise;
	}

}

module.exports = Human;