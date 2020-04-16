import { factory } from "./ConfigLog4j";
import { SocketIO } from './classes/SocketIO';
import { ExpressServer } from "./classes/ExpressServer";

const log = factory.getLogger("app");

runServer().then(() => {
}).catch((error) => log.error('runServer', error));

async function runServer() {
    let server = new ExpressServer();

    let io = new SocketIO(server.getServer());
    await io.start();

    log.info('Success');
}

