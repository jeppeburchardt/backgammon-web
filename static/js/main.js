requirejs.config({
	paths: {
		'q': 'lib/q'
	}
});

requirejs(['board', 'dragdrop'], function (Board, DragDrop) {

	var socket = io.connect('http://localhost');

	var board = new Board();
	board.buildBoard();

	var dragdrop = new DragDrop();
	dragdrop.init(board);

	socket.on('turnStart', function (dice) {
		// a (non-player) turn has started
		board.setDice(dice, 'b');
	});

	socket.on('turn', function (data) {
		// a (non-player) turn has completed
		board.updateBoard(data);
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