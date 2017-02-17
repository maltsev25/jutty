var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var server = require('socket.io');
var pty = require('pty.js');
var fs = require('fs');
var log = require('yalm');
log.setLevel('debug');

var opts = require('optimist')
    .options({
        sslkey: {
            demand: false,
            description: 'path to SSL key'
        },
        sslcert: {
            demand: false,
            description: 'path to SSL certificate'
        },
        sshauth: {
            demand: false,
            description: 'defaults to "password", you can use "publickey,password" instead'
        },
        port: {
            demand: true,
            alias: 'p',
            description: 'wetty listen port'
        },
    }).boolean('allow_discovery').argv;

var runhttps = false;
var sshport = 22;
var sshhost = 'localhost';
var sshauth = 'password';
var globalsshuser = '';



if (opts.sshauth) {
	sshauth = opts.sshauth
}

if (opts.sshuser) {
    globalsshuser = opts.sshuser;
}

if (opts.sslkey && opts.sslcert) {
    runhttps = true;
    opts['ssl'] = {};
    opts.ssl['key'] = fs.readFileSync(path.resolve(opts.sslkey));
    opts.ssl['cert'] = fs.readFileSync(path.resolve(opts.sslcert));
}

process.on('uncaughtException', function(e) {
    console.error('Error: ' + e);
});

var httpserv;

var app = express();
app.get('/ssh/:user', function(req, res) {
    console.log('SSH!')
    res.sendfile(__dirname + '/public/index.html');
});
app.use('/', express.static(path.join(__dirname, 'public/')));

if (runhttps) {
    httpserv = https.createServer(opts.ssl, app).listen(opts.port, function() {
        log.info('https on port ' + opts.port);
    });
} else {
    httpserv = http.createServer(app).listen(opts.port, function() {
        log.info('http on port ' + opts.port);
    });
}

var io = server(httpserv,{path: '/socket.io'});
io.on('connection', function(socket){
    var sshuser = '';
    var request = socket.request;
    var match;
    log.info('socket.io connection');
    log.debug(request.headers.referer);
    if (match = request.headers.referer.match('/ssh/([^@]+)@([^:]+):?([0-9]*)$')) {
        sshuser = match[1];
        sshhost = match[2];
        sshport = parseInt(match[3], 10) || 22;

    }

    var params = [sshuser + '@' + sshhost, '-p', sshport, '-o', 'PreferredAuthentications=' + sshauth]
    log.debug('ssh', params.join(' '));
    var term = pty.spawn('ssh', params, {
        name: 'xterm-256color',
        cols: 80,
        rows: 30
    });

    log.info("PID=" + term.pid + " STARTED on behalf of user=" + sshuser)
    term.on('data', function(data) {
        socket.emit('output', data);
    });
    term.on('exit', function(code) {
        log.info("PID=" + term.pid + " ENDED")
    });
    socket.on('resize', function(data) {
        term.resize(data.col, data.row);
    });
    socket.on('input', function(data) {
        term.write(data);
    });
    socket.on('disconnect', function() {
        term.end();
    });
})
