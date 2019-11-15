import {BaseServer} from '../lib/base_server';
import {Container} from 'inversify';
import * as express from 'express';
import * as should from 'should';

describe('BaseServer', function () {

    class TestServer extends BaseServer {

        private container = new Container();

        configure() {

        }

        getContainer(): Container {
            return this.container;
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
