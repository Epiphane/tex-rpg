import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as nocache from 'nocache';
import environment from './environment';
import apiRouter from './api';
import { SeedDB } from './seed';
import { Server as WebSocketServer } from 'ws';

if (environment.seedDB) {
    SeedDB();
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

const wss = new WebSocketServer({
    port: 8081,
});

wss.on('connection', socket => {
    socket.on('message', message => {
        console.log(JSON.parse(message.toString()));
    });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});