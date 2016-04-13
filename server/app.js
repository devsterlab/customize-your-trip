var express = require('express');
var app = express();
var http = require('http');
var server = http.Server(app);
var io = require('socket.io')(server);
var path = require('path');

var config = require('./config');

app.use(express.static(path.join(__dirname, '../')));

require('./socket')(io);

var port = config.get('port'),
	url = config.get('url');

server.listen(port, url, (err, result) => {
	if (err) {
		console.log(err);
	}
	console.log(`Listening at ${url}:${port}`);
});