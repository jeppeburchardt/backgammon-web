var socket = io.connect('http://localhost');
socket.on('turn', function (data) {
	var playerA = data.players[0];
	var playerB = data.players[1];

	var tiles = document.querySelectorAll('#board .tile');
	for (var i = 0; i < tiles.length; i++) {
		var tile = tiles[i];
		tile.innerHTML = '';
	}

	playerA.checkers.forEach(function (num, tile) {
		var html = '';
		for (var i = 0; i < num; i++) {
			html += '<div class="checker a"></div>';
		}
		if (num > 0) tiles[tile].innerHTML = html;
	});
	playerB.checkers.reverse().forEach(function (num, tile) {
		var html = '';
		for (var i = 0; i < num; i++) {
			html += '<div class="checker b"></div>';
		}
		if (num > 0) tiles[tile].innerHTML = html;
	});
});