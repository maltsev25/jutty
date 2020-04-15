import * as dotEnv from 'dotenv';

dotEnv.config();

interface Environment {
    NODE_ENV: string;
    SSL: boolean;
    PORT: number|string;
    NUMBER_OF_CONNECTIONS_PER_USER: number|string;
}

export const env: Environment = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    SSL: process.env.SSL === 'true' || false,
    PORT: process.env.PORT || 3000,
    NUMBER_OF_CONNECTIONS_PER_USER: process.env.NUMBER_OF_CONNECTIONS_PER_USER || 1,
};

