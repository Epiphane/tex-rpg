import * as ServerResponse from 'engine/server-actions';
import * as ClientAction from 'engine/client-actions';
import { User } from './user';

type ActionHandler = (data: ServerResponse.default) => boolean | void;

export class Game {
    socket?: WebSocket;

    user?: User;
    users: { [key: number]: User } = {};

    private token?: string = localStorage.getItem('token') ?? undefined;
    private listeners: { [key: string]: ActionHandler[] } = {};

    constructor() {
        this.on(ServerResponse.Token, ({ token }) => {
            this.token = token;
            if (token) {
                localStorage.setItem('token', token);
            }
            else {
                localStorage.removeItem('token');
                this.user = undefined;
            }
        });

        this.on(ServerResponse.CurrentUser, ({ user }) => {
            this.user = user;

            this.recv({
                action: 'UpdateUsers',
                users: [user],
            } as ServerResponse.UpdateUsers);
        });

        this.on(ServerResponse.Lookup, ({ users }) => {
            this.recv({
                action: 'UpdateUsers',
                users,
            } as ServerResponse.UpdateUsers);
        })

        this.on(ServerResponse.UpdateUsers, ({ users }) => {
            users.forEach(user => {
                this.users[user.id] = user;
            });
        });
    }

    setSocket(socket: WebSocket) {
        this.socket = socket;

        socket.onmessage = ({ data }) => {
            let payload;
            try {
                payload = JSON.parse(data);
            } catch (e) {
                console.warn(`Received non-JSON message: '${data}'`);
            }

            if (payload instanceof Array) {
                payload.forEach(obj => this.recv(obj));
            }
            else {
                this.recv(payload);
            }
        }

        socket.onopen = () => {
            // Only call once
            socket.onopen = null;

            this.users = {};

            this.send(new ClientAction.SetZone('WEBAPP'));
            this.send(new ClientAction.GetAvailableCommands());

            if (this.token) {
                this.send(new ClientAction.Token(this.token));
            }
            else {
                this.recv(new ServerResponse.Token());
            }
        }

        if (socket.readyState > 1) {
            throw new Error(`Unexpected socket state: ${socket.readyState}`);
        }
        else if (socket.readyState === 1) {
            socket.onopen({} as Event);
        }
    }

    send(payload: ClientAction.default) {
        this.socket?.send(JSON.stringify(payload));
    }

    recv(payload: ServerResponse.default) {
        const listeners = this.listeners[payload.action];
        if (listeners && listeners.length > 0) {
            for (let i = 0; i < listeners.length; i++) {
                if (listeners[i](payload) === false) {
                    listeners.splice(i, 1);
                    i--;
                }
            }
        }
        else {
            console.warn(`Unhandled message`, payload);
        }
    }

    on<T extends ServerResponse.default>(c: new (...args: any[]) => T, callback: ((data: T) => boolean | void)) {
        const eventName = c.name;
        this.listeners[eventName] = this.listeners[eventName] ?? [];
        this.listeners[eventName].push(callback as ActionHandler);
    }

    isLoggedIn() {
        return !!this.token;
    }

    lookup(tag: string) {
        if (this.user && tag === this.user.tag && this.user.name) {
            return this.user.name;
        }

        const match = tag.match(/<#(.*?)>/);
        if (!match || !match[1]) {
            return tag;
        }

        const userId = parseInt(match[1]);
        if (this.users[userId]) {
            return this.users[userId].name ?? this.users[userId].tag;
        }
        else {
            this.send(new ClientAction.Lookup(`#${userId}`));
            return tag;
        }
    }

    autocomplete(name: string, callback: ((names: string[]) => void)) {
        callback(Object.values(this.users).filter(user => {
            return user.name && user.name.indexOf(name) >= 0;
        }).map(user => user.toString()));

        this.on(ServerResponse.Lookup, ({ users }) => {
            callback(users.map(info => new User(info).toString()));
            return false; // Destroy this listener
        });

        this.send(new ClientAction.Lookup(`@${name}`));
    }

    toTag(name: string) {
        if (this.user?.name === name) {
            return this.user.tag;
        }

        const filtered = Object.values(this.users).filter(user => user.name === name);
        return filtered ? filtered[0].tag : '';
    };

    logout() {
        this.recv(new ServerResponse.Token());
    }
};