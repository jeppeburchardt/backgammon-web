var Q = require('q');

var Human = function (socket) {

	var self = this;
	self.id = -1;

	self.socket = socket;

	this.turn = function (dice, board) {

		var deferred = Q.defer();
		var result = [];
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