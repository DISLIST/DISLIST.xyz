var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const chalk = require('chalk');

var port = 80;

app.get('/', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/index.html');});

app.use(express.static('PUBLIC'));

app.get('*', (req, res) => {res.sendFile(__dirname + '/PUBLIC/HTML/404.html', 404);});

server.listen(port, () => {
    console.log(chalk.grey('[' + chalk.red('START') + ']Web Server Launched on port: ' + chalk.red(port)));
});