define(['q'], function (Q) {

	var dragdrop = function () {

		var self = this;

		self.deffered = null;

		self.board = null;
		self.dragFrom = null;
		self.dragTo = null;
		self.tiles = null;
		self.playerId = null;
		self.draggingChecker = null;
		self.availableMoves = null;
		self.currentMoves = [];
		self.isDragging = false;

		function findTile(el) {
			while(el != document.body && !el.classList.contains('tile') && !el.classList.contains('bar') && !el.classList.contains('home')) {
				el = el.parentNode;
			}
			var index = self.tiles.indexOf(el);
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

		this.init = function (board, playerId) {

			self.board = board;
			self.playerId = playerId;
			self.tiles = (playerId === 0 ? board.tiles.slice() : board.tiles.slice().reverse());
			self.home = (playerId === 0 ? board.bottomHome : board.topHome);
			self.bar = (playerId === 0 ? board.topBar : board.bottomBar);

			self.board.el.className = 'no-drag';

			self.board.el.addEventListener('mousedown', function (e) {
				var r = findTile(e.target);
				if (r) {
					self.isDragging = true;
					self.dragFrom = r;
					self.markAvailableDrop();
					self.board.el.className = 'drag';
					r.el.classList.add('dragging');
					if (r.el.lastChild) {
						var color = r.el.lastChild.classList.contains('a') ? 'a' : 'b';
						self.draggingChecker = self.board.createChost(color);
					}
					e.preventDefault();
				}
			});
			self.board.el.addEventListener('mouseup', function (e) {
				self.isDragging = false;
				self.board.el.className = 'no-drag';
				if (self.dragFrom) {
					self.dragFrom.el.classList.remove('dragging');
				}
				if (self.dragTo) {
					self.dragTo.el.classList.remove('drag-over');
					self.addMove();
				}
				self.clearDragDropClasses();
				self.markAvailableDrag();
			});
			self.board.el.addEventListener('mousemove', function (e) {
				if (self.draggingChecker && self.isDragging) {
					var checkerSize = self.board.el.offsetWidth / 13;
					var boardHeight = self.board.el.offsetHeight;
					var x = (e.pageX - self.board.el.offsetLeft) - (checkerSize / 2);
					var y = (e.pageY - self.board.el.offsetTop) + (checkerSize / 2);
					if (y > boardHeight / 2) {
						y -= checkerSize * 2;
					}
					self.draggingChecker.style.left = x;
					self.draggingChecker.style.top = y;
				}
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
			if (self.canMakeMoves()) {
				self.availableMoves.forEach(function (move) {
					var start = move[self.currentMoves.length][0];
					if (start == -1) {
						self.bar.classList.add('available-drag');
					} else {
						var tile = self.tiles[start];
						tile.classList.add('available-drag');
					}
				});
			}
		};

		this.clearDragDropClasses = function () {
			self.bar.classList.remove('available-drag', 'available-drop');
			self.home.classList.remove('available-drag', 'available-drop');
			self.tiles.forEach(function (tile) {
				tile.classList.remove('available-drag', 'available-drop', 'dragging');
			});
		}

		this.markAvailableDrop = function () {
			self.availableMoves.forEach(function (move) {
				if (move[self.currentMoves.length][0] == self.dragFrom.index) {
					var index = self.dragFrom.index + move[self.currentMoves.length][1];
					if (index < 24) {
						self.tiles[index].classList.add('available-drop');
					} else if (index > 23) {
						self.home.classList.add('available-drop');
					}
				}
			});
		};

		this.canMakeMoves = function () {
			if (self.availableMoves && self.availableMoves.length == 1 && self.availableMoves[0].length == self.currentMoves.length) {
				return false;
			} else {
				return true;
			}
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
			
			if (self.availableMoves.length == 1 && self.availableMoves[0].join('_') == self.currentMoves.join('_')) {
				self.board.psuedoPlayerMove(self.playerId, tile, tile+distance, self.draggingChecker).done(function () {
					self.deffered.resolve(self.currentMoves);
					self.reset();
				});
			} else {
				self.markAvailableDrag();
				if (ok) {
					self.board.psuedoPlayerMove(self.playerId, tile, tile+distance, self.draggingChecker);
				} else {
					if (self.draggingChecker) {
						self.draggingChecker.parentNode.removeChild(self.draggingChecker);
					}
				}
			}

			self.dragTo = null;
			self.dragFrom = null;
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