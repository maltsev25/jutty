import socketIO, { Socket } from "socket.io";
import http from "http";
import https from "https";
import { IPty } from "node-pty";
import { factory } from "../ConfigLog4j";
import { env } from '../environment';

const pty = require('node-pty');
const log = factory.getLogger("SocketIO");

export class SocketIO {
    protected io: SocketIO.Server;
    protected CLIENTS: any[];

    constructor(server: http.Server|https.Server) {
        this.io = socketIO(server);
        this.CLIENTS = [];
    }

    start() {
        let self = this;
        this.io.on('connection', function (socket: Socket) {
            log.debug(`connection start ${socket.conn.remoteAddress} id ${socket.conn.id}`);

            self.CLIENTS.push(socket);
            self.checkTerminalsPerUser(socket);

            socket.on('start', function (data) {
                let params;

                if (data.type === 'telnet') {
                    params = [data.host, data.port ? data.port : '23'];
                } else {
                    data.type = 'ssh';
                    params = [data.user + '@' + data.host];
                }

                log.info(data.type + params.join(' '));

                let term: IPty = pty.spawn(data.type, params, {
                    name: 'xterm-256color',
                    cols: data.col,
                    rows: data.row
                });

                log.debug(`${term.pid} spawned`);
                term.onData(function (data: any) {
                    socket.emit('output', data);
                });
                term.onExit(function (_code: any) {
                    log.debug(`${term.pid} ended`);
                    socket.emit('end');
                    term.kill();
                });

                self.setConnectionTerm(socket, term);
            });

            socket.on('resize', function (data) {
                let client: any = self.getConnection(socket);
                if (client !== null)
                    client.term && client.term.resize(data.col, data.row);
            });

            socket.on('input', function (data) {
                let client: any = self.getConnection(socket);
                if (client !== null)
                    client.term && client.term.write(data);
            });

            socket.on('disconnect', function () {
                self.removeClient(socket);
            });

        });
    }

    setConnectionTerm(socket: Socket, term: IPty) {
        let index = this.CLIENTS.indexOf(socket);
        log.debug(`connection ${index} setConnectionTerm ${socket.conn.remoteAddress} id ${socket.conn.id}`);
        if (index > -1) {
            this.CLIENTS[index].term = term;
        }
    }

    getConnection(socket: Socket): Socket|null {
        let index = this.CLIENTS.indexOf(socket);
        if (index > -1) {
            return this.CLIENTS[index];
        }
        return null;
    }

    removeClient(socket: Socket) {
        let index = this.CLIENTS.indexOf(socket);
        log.debug(`connection ${index} close ${socket.conn.remoteAddress} id ${socket.conn.id}`);
        if (index > -1) {
            if (this.CLIENTS[index].term !== undefined)
                this.CLIENTS[index].term.end();
            this.CLIENTS.splice(index, 1);
        }
    }

    checkTerminalsPerUser(socket: Socket) {
        let currentUserConnections = this.CLIENTS.filter((item: Socket) => {
            return item.conn.remoteAddress === socket.conn.remoteAddress;
        });
        if (currentUserConnections.length > env.NUMBER_OF_CONNECTIONS_PER_USER) {
            log.info(`connection ${socket.conn.remoteAddress} id ${socket.conn.id} refused`);
            this.removeClient(socket);
            socket.disconnect();
        }
    }
}