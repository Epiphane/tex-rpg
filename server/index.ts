import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as nocache from 'nocache';
import environment from './environment';
import apiRouter from './api';
import { SeedDB } from './seed';
import { Server as WebSocketServer } from 'ws';
import { ConnectedClient } from './connected-client';

let seeding: Promise<any> = Promise.resolve();
if (environment.seedDB) {
    seeding = SeedDB();
}

const app = express();

if (environment.allowCaching) {
    app.use('/', express.static(__dirname + '/../../public/'));
    app.use('/', express.static(__dirname + '/../public'));
    app.use(nocache());
}
else {
    app.use(nocache());
    app.use('/', express.static(__dirname + '/../../public/'));
    app.use('/', express.static(__dirname + '/../public'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use('/api', apiRouter);

seeding.then(() => {
    const port = process.env.PORT || 8080;
    const server = app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });

    const wss = new WebSocketServer({
        server,
    });

    const connections: ConnectedClient[] = [];

    const removeConnection = (client: ConnectedClient) => {
        for (let i = 0; i < connections.length; i++) {
            if (connections[i] === client) {
                connections.splice(i, 1);
                i--;
            }
        }
    };

    wss.on('connection', socket => {
        const client = new ConnectedClient(socket, removeConnection);
        connections.push(client);
    });
});