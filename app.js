let express =       require('express');
let bodyParser =    require('body-parser');
let http =          require('http');
let https =         require('https');
let path =          require('path');
let server =        require('socket.io');
let pty =           require('node-pty');
let fs =            require('fs');
let log =           require('yalm');
log.setLevel('debug');

let opts = require('optimist')
    .options({
        sslkey: {
            demand: false,
            description: 'path to SSL key'
        },
        sslcert: {
            demand: false,
            description: 'path to SSL certificate'
        },
        port: {
            demand: true,
            alias: 'p',
            description: 'wetty listen port'
        }
    }).boolean('allow_discovery').argv;

let runhttps = false;

if (opts.sslkey && opts.sslcert) {
    runhttps = true;
    opts['ssl'] = {
        key: fs.readFileSync(path.resolve(opts.sslkey)),
        cert: fs.readFileSync(path.resolve(opts.sslcert))
    };
}

let httpserv;

let app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.post('/', function(req, res) {
    res.sendFile(__dirname + '/public/jutty.html');
});

app.use('/', express.static(path.join(__dirname, 'public/')));

if (runhttps) {
    httpserv = https.createServer(opts.ssl, app).listen(opts.port, function () {
        log.info('https on port ' + opts.port);
    });
} else {
    httpserv = http.createServer(app).listen(opts.port, function () {
        log.info('http on port ' + opts.port);
    });
}

let io = server(httpserv, {path: '/socket.io'});

let CLIENTS = [];

io.on('connection', function (socket) {
    log.info('socket.io connection: ' + socket.conn.id);
    CLIENTS.push(socket);

    socket.on('start', function (data) {

        let params;

        if (data.type === 'telnet') {
            params = [data.host, data.port ? data.port : '23'];
        } else {
            data.type = 'ssh';
            params = [data.user + '@' + data.host];
        }

        log.info(data.type, params.join(' '));

        let term = pty.spawn(data.type, params, {
            name: 'xterm-256color',
            cols: data.col,
            rows: data.row
        });

        log.info(term.pid, 'spawned');
        term.on('data', function(data) {
            socket.emit('output', data);
        });
        term.on('exit', function (code) {
            log.info(term.pid, 'ended');
            socket.emit('end');
            term.destroy();
            term = null;
        });

        setConnectionTerm(socket, term);
    });

    socket.on('resize', function (data) {
        let client = getConnection(socket);
        if (client !== false)
            client.term && client.term.resize(data.col, data.row);
    });

    socket.on('input', function (data) {
        let client = getConnection(socket);
        if (client !== false)
            client.term && client.term.write(data);
    });

    socket.on('disconnect', function () {
        removeClient(socket);
    });

});

function setConnectionTerm(socket, term) {
    let index = CLIENTS.indexOf(socket);
    log.debug('connection ' + index + ' setConnectionTerm ' + socket.conn.id);
    if (index > -1) {
        CLIENTS[index].term = term;
    }
}

function getConnection(socket) {
    let index = CLIENTS.indexOf(socket);
    if (index > -1) {
        return CLIENTS[index];
    }
    return false;
}

function removeClient(socket) {
    let index = CLIENTS.indexOf(socket);
    log.debug('connection ' + index + ' close ' + socket.conn.id);
    if (index > -1) {
        if (CLIENTS[index].term !== undefined)
            CLIENTS[index].term.end();
        CLIENTS.splice(index, 1);
    }
}
