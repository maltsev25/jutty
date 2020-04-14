import * as fs from "fs";

export const ssl = {
    key: fs.readFileSync('./sslcert/private.pem', 'utf-8'),
    cert: fs.readFileSync('./sslcert/public.pem', 'utf-8'),
};
