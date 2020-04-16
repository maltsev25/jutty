import http from "http";
import https from "https";
import { factory } from "../ConfigLog4j";
import { env } from '../environment';
import express from "express";
import { ssl } from "../utils/ssl";
import path from "path";
import cors from "cors";
import parser from "body-parser";

const log = factory.getLogger("ExpressServer");

export class ExpressServer {
    protected server: http.Server|https.Server;

    constructor() {
        const router = express();
        router.use(cors({credentials: true, origin: true}));
        router.use(parser.urlencoded({extended: true}));
        router.use(parser.json());
        router.use('/', express.static(path.join(__dirname, '../../public/')));

        if (env.SSL) {
            // @ts-ignore
            this.server = https.createServer(ssl, router);
        } else {
            // @ts-ignore
            this.server = http.createServer(router);
        }
        this.server.listen(env.PORT, () =>
            log.info(`Server is running on port: ${env.PORT}`)
        );
    }

    getServer() {
        return this.server;
    }
}