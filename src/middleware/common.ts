import { Router, Request, Response, NextFunction } from "express";
import cors from "cors";
import parser from "body-parser";
import compression from "compression";
import express from "express";
import path from "path";

export const handleCors = (router: Router) =>
    router.use(cors({credentials: true, origin: true}));

export const handleBodyRequestParsing = (router: Router) => {
    router.use(parser.urlencoded({extended: true}));
    router.use(parser.json());
};

export const handleCompression = (router: Router) => {
    router.use(compression());
};

export const handleContentType = (router: Router) => {
    router.use(function (_req: Request, res: Response, next: NextFunction) {
        res.contentType('text/plain; charset=utf-8');
        next();
    });
};

export const handleParentPath = (router: Router) => {
    router.use('/', express.static(path.join(__dirname, '../../public/')));
};