define(['q'], function (Q) {

	var multiplier = 7.69230769;
	var pseudoMoves = [];

	function getTile(board, tile, playerId) {
		if (tile > 23 && playerId == 1) {
			return board.topHome;
		} else if (tile > 23 && playerId == 0) {
			return board.bottomHome;
		} else if (tile < 0 && playerId == 1) {
			return board.bottomBar;
		} else if (tile < 0 && playerId == 0) {
			return board.topBar;
		}
		return board.tiles[tile];
	}

	function positionToCoordinates (board, tile, playerId) {
		var c = {left:0, top:null};
		if (tile == -1) {
			c.left = 6;
		} else if (tile < 6) {
			c.left = 12 - tile;
		} else if (tile < 12) {
			c.left = 11 - tile; 
		} else if (tile < 18) {
			c.left = tile - 12;
		} else {
			c.left = tile - 11;
		} 
		if (tile == -1 && playerId == 1) {
			c.top = 7;
		} else if (tile == -1 && playerId == 0) {
			c.top = 6;
		} else if (tile < 11.7) {
			c.top = getTile(board, tile, playerId).children.length;
		} else {
			c.top = 11.7 - getTile(board, tile, playerId).children.length;
		}
		return c;
	}

	function moveChecker(board, playerId, from, to, pseudo) {

		console.log('move checker', playerId, from, to, pseudo);

		var deffered = Q.defer();

		if (pseudo) {
			//pseudo are the moves that are made by a human player in his or her turn
			pseudoMoves.push([from, (to-from)]);
		}

		//reverse positions if playerId 1:
		if (playerId == 1) {
			if (from != -1) {
				from = 23-from;
			}
			if (to <= 23) {
				to = 23-to;
			}
		}

		var t = getTile(board, from, playerId);
		var grab = t.lastChild;
		if (!grab) {
			throw new Error('Could not grab checker');
		}
		grab.parentNode.removeChild(grab);
		
		var ghost = document.createElement('div');
		ghost.className = 'ghost';
		ghost.innerHTML = '<div class="checker '+(playerId==0?'a':'b')+'"></div>';
		board.el.querySelector('.aspect').appendChild(ghost);

		//start position:
		var start = positionToCoordinates(board, from, playerId);
		ghost.style.left = start.left * multiplier + '%';
		ghost.style.top = start.top * multiplier + '%';

		//animate:
		ghost.style.transition = 'all 800ms';


		//end:
		setTimeout(function () {
			var end = positionToCoordinates(board, to, playerId);
			ghost.style.left = end.left * multiplier + '%';
			ghost.style.top = end.top * multiplier + '%';
				
		}, 20);

		setTimeout(function () {
			getTile(board, to, playerId).appendChild(grab);
			if (to > 23) {
				// console.log('W0000+++', getTile(board, to, playerId));
			}
			ghost.parentNode.removeChild(ghost);
			deffered.resolve();
		}, 800);

		return deffered.promise;
	}

	function moveCheckers(board, moves, playerId) {

		var deffered = Q.defer();
		var chain = Q(0);
		var i = 0;

		moves.forEach(function (m) {
			
			if (pseudoMoves[i] && pseudoMoves[i].join('_') == m.join('_')) {
				//ignore pseudo moves
				console.log('ignore pseudo moves', pseudoMoves[i].join('_'), m.join('_'));
			} else {
				if (pseudoMoves[i]) {
					console.log('adding move to chain', pseudoMoves[i].join('_'), m.join('_'));
				}
				

				chain = chain.then(function () {
					return moveChecker(board, playerId, m[0], m[0]+m[1]);
				}).fail(function (e) {
					console.error('animation chain fail');
					console.error(e.stack);
					deffered.reject(e);
				});
			}

			i++;
		});

		pseudoMoves = [];

		chain.then(function () {
			deffered.resolve();
		});

		return deffered.promise;
	}

	var a = {
		moveChecker: moveChecker,
		moveCheckers: moveCheckers,
		getTile: getTile,
		positionToCoordinates: positionToCoordinates
	};

	window.animations = a;

	return a;

});