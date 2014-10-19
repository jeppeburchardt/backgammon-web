requirejs.config({
	paths: {
		'q': 'lib/q'
	}
});

requirejs(['board', 'dragdrop', 'lobby'], function (Board, DragDrop, Lobby) {

	var socket = io.connect();

	var board = new Board();
	board.buildBoard();

	var dragdrop = new DragDrop();
	dragdrop.init(board);

	var lobby = new Lobby(socket);

	socket.on('lobby', function (options) {
		document.querySelector('.content.lobby').style.display = 'block';
		document.querySelector('.content.game').style.display = 'none';
		document.querySelector('.content.wait').style.display = 'none';
		lobby.init(options);
	});

	socket.on('waitingForOtherPlayer', function () {
		document.querySelector('.content.lobby').style.display = 'none';
		document.querySelector('.content.game').style.display = 'none';
		document.querySelector('.content.wait').style.display = 'block';
	})

	socket.on('prepareGame', function () {
		document.querySelector('.content.lobby').style.display = 'none';
		document.querySelector('.content.game').style.display = 'block';
		document.querySelector('.content.wait').style.display = 'none';
	})

	socket.on('turnStart', function (playerId, dice) {
		// a (non-player) turn has started
		board.setDice(dice, 'b');
	});

	socket.on('turn', function (playerId, data, moves) {
		// a (non-player) turn has completed
		board.updateBoard(data, moves, playerId);
	});

	socket.on('dice', function (data) {
		// player's turn...
		board.setDice(data.dice, 'a');
		dragdrop.makeMove(data.availableMoves).then(function (moves) {
			console.log('user make moves:', moves);
			socket.emit('move', moves);
		});

	});

	socket.on('illegal', function () {
		alert('submitted move was not legal!');
		dragdrop.reset();
	});


	

});