import { Response, NextFunction } from "express";
import { HTTPClientError } from "./httpErrors";
import { env } from "../environment";
import { factory } from "../ConfigLog4j";

const log = factory.getLogger("errorHandler");

export const notFoundError = (res: Response) => {
    res.status(404).send("Method not found.");
};

export const clientError = (err: Error, res: Response, next: NextFunction) => {
    if (err instanceof HTTPClientError) {
        log.warn(`clientError ${err.statusCode}`, err);
        res.status(err.statusCode).send(err.message);
    } else {
        next(err);
    }
};

export const serverError = (err: Error, res: Response, _next: NextFunction) => {
    console.error(err);
    log.error(`serverError`, err);
    if (env.NODE_ENV === "production") {
        res.status(500).send("Internal Server Error");
    } else {
        res.status(500).send(err.stack);
    }
};
