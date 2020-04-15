import { Router, Request, Response, NextFunction } from "express";
import { factory } from "../ConfigLog4j";

const log = factory.getLogger("utils");
type Wrapper = ((router: Router) => void);

export const applyMiddleware = (
    middlewareWrappers: Wrapper[],
    router: Router
) => {
    log.debug('applyMiddleware');
    for (const wrapper of middlewareWrappers) {
        wrapper(router);
    }
};

type Handler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void>|void;

type Route = {
    path: string;
    method: string;
    handler: Handler|Handler[];
};

export const applyRoutes = (routes: Route[], router: Router) => {
    log.debug('applyRoutes');
    for (const route of routes) {
        const {method, path, handler} = route;
        (router as any)[method](path, handler);
    }
};