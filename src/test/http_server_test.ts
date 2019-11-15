import {Container} from 'inversify';
import {default as express} from 'express';
import * as should from 'should';
import {HttpServer, HttpServiceConfig} from "../lib";

describe('HttpServer', function () {

    class TestServer extends HttpServer {

        private container = new Container();

        configure() {

        }

        getContainer(): Container {
            return this.container;
        }

        protected getServerConfig(): HttpServiceConfig {
            return {
                corsWhitelist: true
            };
        }
    }

    it('should start and stop a server', async () => {
        const server = new TestServer(express(), 3001);
        await server.start();
        const address = server.getServer().address();
        should(address).properties({
            address: '::',
            port: 3001
        });
        await server.stop();
    });

});
