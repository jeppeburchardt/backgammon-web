define(['q'], function (Q) {

	var dragdrop = function () {

		var self = this;

		self.deffered = null;

		self.board = null;
		self.dragFrom = null;
		self.dragTo = null;
		self.availableMoves = null;
		self.currentMoves = [];

		function findTile(el) {
			while(el != document.body && !el.classList.contains('tile') && !el.classList.contains('bar') && !el.classList.contains('home')) {
				el = el.parentNode;
			}
			var index = self.board.tiles.indexOf(el);
			if (index == -1 && el.classList.contains('home')) {
				index = 24;
			}
			return (el == document.body || el == null ? null : {
				index: index,
				el: el
			});
		}

		this.reset = function () {
			self.dragFrom = null;
			self.dragTo = null;
			self.availableMoves = null;
			self.currentMoves = [];
		};

		this.init = function (board) {

			self.board = board;
			self.board.el.className = 'no-drag';

			self.board.el.addEventListener('mousedown', function (e) {
				var r = findTile(e.target);
				if (r) {
					self.dragFrom = r;
					self.markAvailableDrop();
					self.board.el.className = 'drag';
					e.preventDefault();
				}
			});
			self.board.el.addEventListener('mouseup', function (e) {
				self.dragTo.el.classList.remove('drag-over');
				self.addMove();
				self.board.el.className = 'no-drag';
			});
			self.board.el.addEventListener('mousemove', function (e) {

			});
			self.board.el.addEventListener('mouseover', function (e) {
				if (self.dragTo) {
					self.dragTo.el.classList.remove('drag-over');
				}
				if (self.dragFrom) {
					var r = findTile(e.target);
					if (r) {
						self.dragTo = r;
						self.dragTo.el.classList.add('drag-over');
					}
				}
			});
		};

		this.markAvailableDrag = function () {
			self.availableMoves.forEach(function (move) {
				var start = move[self.currentMoves.length][0];
				if (start == -1) {
					self.board.topBar.classList.add('available-drag');
				} else {
					var tile = self.board.tiles[start];
					tile.classList.add('available-drag');
				}
			})
		};

		this.clearDragDropClasses = function () {
			self.board.topBar.classList.remove('available-drag', 'available-drop');
			self.board.bottomHome.classList.remove('available-drag', 'available-drop');
			self.board.tiles.forEach(function (tile) {
				tile.classList.remove('available-drag', 'available-drop');
			});
		}

		this.markAvailableDrop = function () {
			self.availableMoves.forEach(function (move) {
				if (move[self.currentMoves.length][0] == self.dragFrom.index) {
					var index = self.dragFrom.index + move[self.currentMoves.length][1];
					if (index < 24) {
						self.board.tiles[index].classList.add('available-drop');
					} else if (index > 23) {
						self.board.bottomHome.classList.add('available-drop');
					}
				}
			});
		};

		this.addMove = function () {
			var tile = self.dragFrom.index;
			var distance = self.dragTo.index - tile;
			var moveNum = self.currentMoves.length;
			var ok = false;

			// console.log('addMove', self.dragTo.index);

			for (var i = 0; i < self.availableMoves.length; i++) {
				var a = self.availableMoves[i][moveNum];
				var b = [tile, distance];
				if (a.join('_') == b.join('_')) {
					ok = true;
					break;
				} else if (a[0] + a[1] > 23 && tile + distance > 23) {
					// console.log('move HOME!', a);
					distance = a[1];
					ok = true;
					break;
				}
			}
			if (ok) {
				// console.log('Move OK!');
				self.currentMoves.push([tile, distance]);
				self.availableMoves = self.availableMoves.filter(function (move) {
					var r = move.join('_').indexOf(self.currentMoves.join('_')) == 0;
					return r;
				});
			} else {
				// console.log('Move NOT OK!!');
			}
			self.clearDragDropClasses();
			
			// console.log(self.availableMoves.length, ' possible moves left');
			
			if (self.availableMoves.length == 1 && self.availableMoves[0].join('_') == self.currentMoves.join('_')) { //BUG HERE...!
				self.deffered.resolve(self.currentMoves);
				self.reset();
			} else {
				self.markAvailableDrag();
				if (ok) {
					self.board.psuedoPlayerMove(tile, tile+distance);
				}
			}
		};

		this.makeMove = function (availableMoves) {

			self.deffered = Q.defer();
			if (availableMoves[0].length == 0) {
				alert('You can not make a move!');
				self.deffered.resolve([]);
			} else {
				self.availableMoves = availableMoves;
				self.markAvailableDrag();
			}
			
			return self.deffered.promise;
		};

	};

	return dragdrop;

});