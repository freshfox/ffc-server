import * as http from "http";
import {Container} from 'inversify';
import {Server} from "http";

export abstract class BaseServer {

    protected server: Server = null;

    constructor(public app: any, protected port: number) {
    }

    abstract configure(): void;

    start() {
        this.configure();
        return this.boot();
    }

    boot(): Promise<void> {
        return new Promise((resolve) => {
            let self = this;
            let server = http.createServer(this.app);
            server.listen(this.port, () => {
                self.server = server;
                resolve();
            });
        });
    }

    stop() {
        if (this.server) {
            return new Promise((resolve) => {
                this.server.close(resolve);
                this.server = null;
            });
        }
        return Promise.resolve();
    }

    abstract getContainer(): Container;

    getServer() {
        return this.server;
    }

}
