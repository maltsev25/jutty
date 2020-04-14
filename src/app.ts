import http from "http";
import https from "https";
import express from "express";
import { applyMiddleware, applyRoutes } from "./utils";
import routes from "./routes";
import middleware from "./middleware";
import { env } from './environment';
import { ssl } from "./utils/ssl";
import { factory } from "./ConfigLog4j";
import { SocketIO } from './classes/SocketIO';

const log = factory.getLogger("app");

const router = express();
applyMiddleware(middleware, router);
applyRoutes(routes, router);

let server = null;
if (env.NODE_ENV === 'development') {
    // @ts-ignore
    server = http.createServer(ssl, router);
} else {
    // @ts-ignore
    server = https.createServer(ssl, router);
}
server.listen(env.PORT, () =>
    log.info(`Server is running on port: ${env.PORT}`)
);

let io = new SocketIO(server);
io.start();
