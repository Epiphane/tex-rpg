import * as ServerResponse from 'engine/server-actions';
import * as ClientAction from 'engine/client-actions';
import { User } from './user';

type ActionHandler = (data: ServerResponse.default) => boolean | void;

export class Game {
    socket?: WebSocket;

    user?: User;
    users: User[] = [];

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
            }
        });

        this.on(ServerResponse.CurrentUser, ({ user }) => {
            this.user = user;
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

            if (payload) {
                this.recv(payload);
            }
        }

        socket.onopen = () => {
            // Only call once
            socket.onopen = null;

            this.users = [];

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

        // socket.on('user', function (_user) {
        //    user = _user;
        //    $('.user-' + user.user_id).text('@' + user.name);
        // });

        // socket.on('users add', function (res) {
        //    if (!Array.isArray(res)) res = [res];

        //    for (var i = res.length - 1; i >= 0; i--) {
        //       addUser(res[i]);
        //    };
        // });

        // socket.on('users remove', function (res) {
        //    return;
        //    // if (!Array.isArray(res)) res = [res];

        //    // for (var i = res.length - 1; i >= 0; i--) {
        //    //    removeUser(res[i]);
        //    // };
        // });

        // socket.on('team', function () {
        //    socket.emit('team', 'THOMASSTEINKE');
        // });
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
        return tag;
    }

    autocomplete(name: string, callback: ((names: User[]) => void)) {
        callback(this.users.filter(user => {
            return user.name && user.name.indexOf(name) >= 0;
        }));

        this.on(ServerResponse.Lookup, ({ users }) => {
            var result: User[] = [];
            users.forEach(info => {
                if (this.users.filter(u => u.id === info.id).length === 0) {
                    result.push(new User(info));
                }
            });

            callback(result);
            // result.forEach(user => {
            //    addUser(user);
            // });
            return false; // Destroy this listener
        });

        this.send(new ClientAction.Lookup(name));
    }

    toTag(name: string) {
        if (this.user?.name === name) {
            return this.user.tag;
        }

        const filtered = this.users.filter(user => user.name === name);
        return filtered ? filtered[0].tag : '';
    };

    logout() {
        this.recv(new ServerResponse.Token());
    }
};