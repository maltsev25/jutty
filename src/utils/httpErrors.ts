export abstract class HTTPClientError extends Error {
    readonly statusCode!: number;
    readonly name!: string;

    constructor(message: object|string) {
        if (message instanceof Object) {
            console.log('message is obj');
            super(JSON.stringify(message));
        } else {
            super(message);
        }
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class HTTP400Error extends HTTPClientError {
    readonly statusCode = 400;

    constructor(message: string|object = "Bad Request") {
        super(message);
    }
}

export class HTTP403Error extends HTTPClientError {
    readonly statusCode = 403;

    constructor(message: string|object = "Bad auth") {
        super(message);
    }
}

export class HTTP404Error extends HTTPClientError {
    readonly statusCode = 404;

    constructor(message: string|object = "Not found") {
        super(message);
    }
}

export class HTTP500Error extends HTTPClientError {
    readonly statusCode = 500;

    constructor(message: string|object = "Error") {
        super(message);
    }
}