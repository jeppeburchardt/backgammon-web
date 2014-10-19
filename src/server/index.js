var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var config = require('config');

var GameSocketLobby = require('./GameSocketLobby');

app.use('/', express.static(path.join(__dirname, '../../static')));

var lobby = new GameSocketLobby(io);


module.exports = function () {
	server.listen(config.web.port);
};
