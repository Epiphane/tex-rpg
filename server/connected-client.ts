import * as A from '../engine/attachment';
import * as ClientAction from '../engine/client-actions';
import ServerResponse, { Attach, AvailableCommands, CurrentUser, Lookup, Token } from '../engine/server-actions';
import { WebSocket } from 'ws';
import * as jwt from 'jsonwebtoken';
import environment from './environment';
import User, { UserInfo } from '../engine/models/user';
import { Actions, SortedActions } from '../engine/actions';
import { UserController } from '../engine/controller/user';
import { Pasta } from '../engine/helpers/lang';

type UserToken = UserInfo & jwt.JwtPayload;

export class ConnectedClient {
    user?: User;
    zone?: string;
    channel: string = 'MAIN';

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

    send(payload: ServerResponse | ServerResponse[]) {
        this.socket.send(JSON.stringify(payload));
    }

    recv(payload: ClientAction.default) {
        if (payload.action === 'Token') {
            this.OnToken(payload as ClientAction.Token);
        }
        else if (payload.action === 'Login') {
            this.OnLogin(payload as ClientAction.Login);
        }
        else if (payload.action === 'SetZone') {
            this.OnSetZone(payload as ClientAction.SetZone);
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
        else if (payload.action === 'GetAvailableCommands') {
            this.OnGetAvailableCommands();
        }
        else {
            console.warn('Unhandled payload', payload);
        }
    }

    async OnToken({ token: encodedJwt }: ClientAction.Token) {
        let token: UserToken;
        try {
            token = jwt.verify(encodedJwt, environment.jwtSecret) as unknown as UserToken;
        }
        catch (e: any) {
            this.send([
                new Attach(new A.Error(`Invalid token: \`${e.message}\``)),
                new Token(),
            ]);
            return;
        }

        try {
            if (token.iss !== 'RGB') {
                throw new Error(`Unexpected error, code=0101`);
            }
            else if (!token.sub) {
                throw new Error(`Unexpected error, code=0102`);
            }

            const user = await UserController.FindByEmail(token.sub!, token.zoneId);
            if (!user) {
                throw new Error(`Unexpected error, code=0201`);
            }
            else if (user.id !== token.id) {
                throw new Error(`Unexpected error, code=0202`);
            }
            // Valid login!
            this.user = user;
            this.send(new CurrentUser(user));
        }
        catch (err) {
            this.send([
                new Attach(new A.Error(`Error refreshing token: \`${err}\``)),
                new Token(),
            ]);
        };
    }

    async OnLogin({ email, password }: ClientAction.Login) {
        if (!this.zone) {
            this.send(new Attach(new A.Error(`No game zone specified, please reload.`)));
            return;
        }

        const user = await UserController.FindByEmail(email, this.zone);
        if (!user || !user.authenticate(password)) {
            this.send(new Token());
        }
        else {
            this.user = user;
            this.send(new Token(jwt.sign(
                user.format(),
                environment.jwtSecret,
                {
                    issuer: `RGB`,
                    subject: user.email,
                }
            )));
        }
    }

    OnSetZone({ zone }: ClientAction.SetZone) {
        this.zone = zone;
    }

    OnSetChannel({ channel }: ClientAction.SetChannel) {
        this.channel = channel;
    }

    OnLookup({ tag }: ClientAction.Lookup) {
        if (!this.zone) {
            return;
        }

        if (tag[0] === '@') {
            const name = tag.substr(1);
            UserController.Lookup(name, this.zone).then(users => {
                this.send(new Lookup(users.map(user => user.format())));
            });
        }
        else if (tag[0] === '#') {
            const userId = parseInt(tag.substr(1));
            UserController.FindById(userId, this.zone).then(user => {
                if (user) {
                    this.send(new Lookup([user.format()]))
                }
            })
        }
    }

    OnCommand({ command }: ClientAction.Command) {
        const [action, ...args] = command.split(' ');

        if (Actions[action]) {
            try {
                const result = Actions[action](args, this.user, this.channel);
                Promise.resolve(result)
                    .then(output => (output instanceof Array) ? output : [output])
                    .then(outputs =>
                        outputs.map(output => (output instanceof A.Attachment) ? new Attach(output) : output)
                    )
                    .then(result => this.send(result))
                    .catch(err => this.send(new Attach(new A.Error(`Error: ${err}`))));
            }
            catch (e: any) {
                this.send(new Attach(new A.Error(`${e}`)));
            }
        }
        else {
            this.send(new Attach(new A.Warning([
                `'${action}' is not an available action.`,
                `Type ${Pasta('help', true)} for the list of available actions.`
            ])))
        }
    }

    OnGetAvailableCommands() {
        this.send(new AvailableCommands(
            SortedActions
                .map(cmd => Actions[cmd].shortFmt(this.user) ?? '')
                .filter(line => !!line)
        ));
    }
}