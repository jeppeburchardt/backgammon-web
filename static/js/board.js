define(['q'], function(Q) {

	var Board = function (el) {

		var self = this;

		self.tiles = [];
		self.topBar = null;
		self.bottomBar = null;
		self.el = el || document.getElementById('board');
		self.dice = self.el.querySelectorAll('.die');


		this.setDice = function (roll, color) {
			self.dice[0].innerText = roll[0];
			self.dice[1].innerText = roll[1];
			self.dice[0].className = self.dice[1].className = color;
		};

		this.updateBoard = function (data) {
			var playerA = data.players[0];
			var playerB = data.players[1];

			document.querySelector('#info .a .name span').innerText = playerA.name;
			document.querySelector('#info .b .name span').innerText = playerB.name;
			document.querySelector('#info .a .hits span').innerText = playerA.hits;
			document.querySelector('#info .b .hits span').innerText = playerB.hits;
			document.querySelector('#info .a .beared.off span').innerText = playerA.bearedOff;
			document.querySelector('#info .b .beared.off span').innerText = playerB.bearedOff;

			var a = playerA.checkers;
			var b = playerB.checkers.reverse();
			function buildCheckers(num, cssClass) {
				for (var i = 0, html = ''; i < num; i++) {
					html += '<div class="checker '+cssClass+'"></div>';
				}
				return html;
			}
			self.tiles.forEach(function (el, i) {
				el.innerHTML = buildCheckers(Math.max(a[i], b[i]), a[i]>b[i]?'a':'b');
			});

			var ahHtml = '';
			for (var ah = 0; ah < playerA.hits; ah++) {
				ahHtml += '<div class="checker a"></div>';
			}
			self.topBar.innerHTML = ahHtml;

			var bhHtml = '';
			for (var bh = 0; bh < playerB.hits; bh++) {
				bhHtml += '<div class="checker b"></div>';
			}
			self.bottomBar.innerHTML = bhHtml;
		};

		this.buildBoard = function () {
			var html = '';
			for (var i = 0; i < 24; i++) {
				html += '<div class="tile '+(i%2==0?'even':'odd')+' '+(i<12?'top':'bottom')+'"></div>';
				if (i==5) {
					html += '<div class="bar top"></div>';
				}
				if (i==17) {
					html += '<div class="bar bottom"></div>';
				}
			}
			self.el.querySelector('.aspect').innerHTML = html;
			
			self.tiles = [];
			var tiles = self.el.querySelectorAll('.tile');
			for (var i = 0; i < tiles.length; i++) {
				self.tiles.push(tiles[i]);
			}
			
			self.topBar = self.el.querySelector('.bar.top');
			self.bottomBar = self.el.querySelector('.bar.bottom');
		};

	};

	return Board;
});