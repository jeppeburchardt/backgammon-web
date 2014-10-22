requirejs.config({
	paths: {
		'q': 'lib/q'
	}
});

requirejs(['board', 'dragdrop', 'lobby'], function (Board, DragDrop, Lobby) {

	var socket = io.connect();

	var dragdrop, board, playerId;
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
		board.setDice(dice, playerId);
	});

	socket.on('turn', function (playerId, data, moves) {
		// a (non-player) turn has completed
		board.updateBoard(data, moves, playerId);
	});

	socket.on('playerId', function (id) {
		playerId = id;

		board = new Board();
		board.buildBoard();

		dragdrop = new DragDrop();
		dragdrop.init(board, playerId);
	})

	socket.on('dice', function (data) {
		// player's turn...
		board.setDice(data.dice, playerId);
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