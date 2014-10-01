var tiles = document.querySelectorAll('#board .tile');
var moves = [];
var availableMoves = [];
var dice = [];

var socket = io.connect('http://localhost');

var topBar = document.querySelector('#board .bar.top');
var bottomBar = document.querySelector('#board .bar.bottom');

socket.on('turnStart', function (dice) {
	var f = document.querySelector('#dice .f');
	f.innerText = dice[0];
	f.classList.add('b');
	f.classList.remove('a');
	var s = document.querySelector('#dice .s');
	s.innerText = dice[1];
	s.classList.add('b');
	s.classList.remove('a');
	console.log('Opponent rolled ', dice);
});
socket.on('turn', function (data) {
	var playerA = data.players[0];
	var playerB = data.players[1];

	
	for (var i = 0; i < tiles.length; i++) {
		var tile = tiles[i];
		tile.innerHTML = '';
	}
	topBar.innerHTML = '';
	bottomBar.innerHTML = ''

	document.querySelector('#info .a .name span').innerText = playerA.name;
	document.querySelector('#info .b .name span').innerText = playerB.name;
	document.querySelector('#info .a .hits span').innerText = playerA.hits;
	document.querySelector('#info .b .hits span').innerText = playerB.hits;
	document.querySelector('#info .a .beared.off span').innerText = playerA.bearedOff;
	document.querySelector('#info .b .beared.off span').innerText = playerB.bearedOff;

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
	
	var ahHtml = '';
	for (var ah = 0; ah < playerA.hits; ah++) {
		ahHtml += '<div class="checker a"></div>';
	}
	if (ahHtml != '') topBar.innerHTML = ahHtml;

	var bhHtml = '';
	for (var bh = 0; bh < playerB.hits; bh++) {
		bhHtml += '<div class="checker b"></div>';
	}
	if (bhHtml != '') bottomBar.innerHTML = bhHtml;
});
socket.on('dice', function (data) {
	dice = data.dice;
	availableMoves = data.availableMoves;
	var f = document.querySelector('#dice .f');
	f.innerText = dice[0];
	f.classList.add('a');
	f.classList.remove('b');
	var s = document.querySelector('#dice .s');
	s.innerText = dice[1];
	s.classList.add('a');
	s.classList.remove('b');
	console.log('You rolled ', dice);
});
socket.on('illegal', function (moves) {
	console.log('Illegal move', moves);
});
function findTile(el) {
	while(el != document.body && !el.classList.contains('tile') && !el.classList.contains('bar')) {
		el = el.parentNode;
	}
	return (el == document.body ? null : el);
}
var dragging = -1;
var target = -1;
document.getElementById('board').addEventListener('mousemove', function (e) {
	if (dragging != -1) {
		var tile = tiles[dragging];
		//console.log(e.pageX)

	}
});
document.getElementById('board').addEventListener('mouseover', function (e) {
	if (dragging != -1) {
		console.log('target', target);
		var tile = findTile(e.target);
		if (target != -1) {
			tiles[target].classList.remove('drag-to');
		}
		if (tile !== null) {
			for (var i = 0; i < tiles.length; i++) {
				if (tiles[i] === tile) {
					target = i;
					break;
				}
			}
			if (target !== -1) {
				tile.classList.add('drag-to');
			} else {
				target = -1;
			}
		}
	}
});
document.addEventListener('mouseup', function (e) {
	dragging = -1;
});
document.getElementById('board').addEventListener('mousedown', function (e) {
	var tile = findTile(e.target),
		index = null;
	if (tile !== null) {
		for (var i = 0; i < tiles.length; i++) {
			if (tiles[i] === tile) {
				index = i;
				break;
			}
		}
		if (index !== null) {
			console.log(index);	
		} else {
			index = -1;
		}
		dragging = index;

		if (moves.length == 0) {
			moves = [[index]];
		} else {
			var move = moves[moves.length-1];
			if (move.length == 1) {
				move.push(index-move[0]);
			} else {
				moves.push([index]);
			}
		}
		console.log(moves);

		var allMovesComplete = true;
		moves.forEach(function(m){
			if (m.length != 2) {
				allMovesComplete = false;
			}
		});
		if (allMovesComplete && moves.length == dice.length) {
			socket.emit('move', moves);
			moves = [];
		}
	}
	e.preventDefault();
});



