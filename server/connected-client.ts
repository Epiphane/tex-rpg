import * as A from '../engine/attachment';
import * as ClientAction from '../engine/client-actions';
import ServerResponse, { Attach, CurrentUser, Token } from '../engine/server-actions';
import { WebSocket } from 'ws';
import * as jwt from 'jsonwebtoken';
import environment from './environment';
import User, { UserInfo } from '../engine/models/user';
import actions from '../engine/actions';

type UserToken = UserInfo & jwt.JwtPayload;

export class ConnectedClient {
    user?: User;
    channel?: string;

    constructor(
        private readonly socket: WebSocket,
        onCloseCallback: (client: ConnectedClient) => void,
    ) {
        socket.on('message', message => {
            let payload;
            try {
                payload = JSON.parse(message.toString());
            } catch (e) {
                console.warn(`Received non-JSON message: '${message.toString()}'`);
            }

            if (payload) {
                this.recv(payload);
            }
        });

        socket.on('close', () => onCloseCallback(this));
    }

    send(payload: ServerResponse) {
        this.socket.send(JSON.stringify(payload));
    }

    recv(payload: ClientAction.default) {
        if (payload.action === 'Token') {
            this.OnToken(payload as ClientAction.Token);
        }
        else if (payload.action === 'Login') {
            this.OnLogin(payload as ClientAction.Login);
        }
        else if (payload.action === 'SetChannel') {
            this.OnSetChannel(payload as ClientAction.SetChannel);
        }
        else if (payload.action === 'Lookup') {
            this.OnLookup(payload as ClientAction.Lookup);
        }
        else if (payload.action === 'Command') {
            this.OnCommand(payload as ClientAction.Command);
        }
        else {
            console.warn('Unhandled payload', payload);
        }
    }

    OnToken({ token }: ClientAction.Token) {
        new Promise((resolve: (value: UserToken) => void, reject) => {
            try {
                resolve(jwt.verify(token, environment.jwtSecret) as UserToken);
            }
            catch (e: any) {
                reject(`Invalid token: \`${e.message}\``);
            }
        })
            .then(token => {
                if (token.iss !== 'RGB') {
                    throw new Error(`Unexpected error, code=0101`);
                }
                else if (!token.sub) {
                    throw new Error(`Unexpected error, code=0102`);
                }

                return token;
            })
            .then(token =>
                User.findOne({
                    where: {
                        id: token.id,
                        email: token.sub,
                    }
                })
            )
            .then(user => {
                this.user = user ?? undefined;
                if (!user) {
                    throw new Error(`Unexpected error, code=0201`);
                }
                else {
                    // Valid login!
                    this.send(new CurrentUser(user.format()));
                }
            })
            .catch(err => {
                this.send(new Attach(new A.Error(`Error refreshing token: \`${err}\``)));
                this.send(new Token());
            });
    }

    OnLogin({ email, password }: ClientAction.Login) {
        User.findOne({
            where: {
                email: email
            }
        }).then(user => {
            if (!user || !user.authenticate(password)) {
                this.send(new Token());
            }
            else {
                this.send(new Token(jwt.sign(
                    user.format(),
                    environment.jwtSecret,
                    {
                        issuer: `RGB`,
                        subject: user.email,
                    }
                )));
            }
        });
    }

    OnSetChannel({ channel }: ClientAction.SetChannel) {
        this.channel = channel;
    }

    OnLookup(payload: ClientAction.Lookup) {

    }

    OnCommand({ command }: ClientAction.Command) {
        const [action, ...args] = command.split(' ');

        if (actions[action]) {
            const result = actions[action](args, this.user, this.channel);
            Promise.resolve(result)
                .then(output => this.send(new Attach(output)))
                .catch(err => this.send(new Attach(new A.Error(`Error: ${err}`))));
        }
        else {
            this.send(new Attach(new A.Warning([
                `'${action}' is not an available action.`,
                `Type \`${A.Pasta('help', true)}\` for the list of available actions.`
            ])))
        }
    }
}