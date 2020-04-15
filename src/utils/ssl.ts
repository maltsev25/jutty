import * as fs from "fs";
import { env } from "../environment";

export const ssl = {
    key: env.SSL ? fs.readFileSync('./sslcert/key.pem', 'utf-8') : '',
    cert: env.SSL ? fs.readFileSync('./sslcert/cert.pem', 'utf-8') : '',
};
