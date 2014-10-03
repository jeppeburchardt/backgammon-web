define(function () {

	var Lobby = function (socket) {

		var self = this;

		self.socket = socket;

		self.gameTypeSelect = document.getElementById('game-type');
		self.controllerASelect = document.getElementById('controller-a');
		self.controllerBSelect = document.getElementById('controller-b');
		self.playerNameInput = document.getElementById('player-name');
		self.submitButton = document.getElementById('start-game');

		this.init = function (options) {
			console.log('LOBBY INIT', options);

			self.controllerASelect.innerHTML = self.controllerBSelect.innerHTML = '';
			options.controllers.forEach(function (controller) {
				self.controllerASelect.innerHTML += '<option>'+controller+'</option>';
				self.controllerBSelect.innerHTML += '<option>'+controller+'</option>';
			});

			self.onGameTypeChange();
		};

		this.startGame = function () {
			self.socket.emit('playGame', {
				type: self.gameType(),
				controllerA: self.controllerASelect.value,
				controllerB: self.controllerBSelect.value,
				playerName: self.playerNameInput.value
			});
		};

		this.onGameTypeChange = function () {

			console.log(self.gameType());

			switch (self.gameType()) {

				case "human-vs-machine":
					self.controllerASelect.parentNode.style.display = 'block';
					self.controllerBSelect.parentNode.style.display = 'none';
					self.playerNameInput.parentNode.style.display = 'block';
					break;

				case "machine-vs-machine":
					self.controllerASelect.parentNode.style.display = 'block';
					self.controllerBSelect.parentNode.style.display = 'block';
					self.playerNameInput.parentNode.style.display = 'none';
					break;

				case "human-vs-human":
					self.controllerASelect.parentNode.style.display = 'none';
					self.controllerBSelect.parentNode.style.display = 'none';
					self.playerNameInput.parentNode.style.display = 'block';
					break;

			}
		};

		this.gameType = function () {
			return self.gameTypeSelect.value;
		};

		self.gameTypeSelect.addEventListener('change', self.onGameTypeChange);
		self.submitButton.addEventListener('click', self.startGame);
	};

	return Lobby;

});