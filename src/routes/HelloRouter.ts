import { NextFunction, Request, Response } from "express";
import path from "path";

export default [
    {
        path: "/ping",
        method: "get",
        handler: [
            async (_req: Request, res: Response, _next: NextFunction) => {
                res.status(200).send('It works!');
            }
        ]
    },
    {
        path: "/",
        method: "get",
        handler: [
            async (_req: Request, res: Response, _next: NextFunction) => {
                res.sendFile('jutty.html', {
                    root: path.join(__dirname, '../../public/')
                });
            }
        ]
    },
];