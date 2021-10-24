import { LookupResponse, ServerAction } from '../server/socket/actions';
import { User, UserInfo } from './user';

interface LoginAction {
   action: 'Login';
   token: string;
}

interface LogoutAction {
   action: 'Logout';
}

interface SetChannelAction {
   action: 'SetChannel';
   channel: string;
}

interface LookupAction {
   action: 'Lookup';
   name: string;
}

interface CommandAction {
   action: 'Command';
   command: string;
}

export type ClientAction = LoginAction |
   LogoutAction |
   SetChannelAction |
   LookupAction |
   CommandAction;

export class Game {
   socket: WebSocket;

   user?: User;
   users: User[] = [];

   listeners: { [key: string]: ((data: any) => boolean | void)[] } = {};

   constructor(socket: WebSocket) {
      this.socket = socket;

      socket.onmessage = (message) => {
         console.log(`Received message: ${message}`);
      }

      var token = localStorage.getItem('token');
      socket.onopen = () => {
         this.users = [];
         this.send({ action: 'Login', token: 'abc' });

         if (token) {
            this.send({ action: 'Login', token });
         }
         this.send({ action: 'SetChannel', channel: 'MAIN' });
      }

      // socket.on('token', function (t) {
      //    token = t;
      //    localStorage.setItem('token', token);
      // });

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

   send(payload: ClientAction) {
      console.log(`Sending ${JSON.stringify(payload)}`)
      this.socket.send(JSON.stringify(payload));
   }

   recv(payload: ServerAction) {
      const listeners = this.listeners[payload.action];
      if (listeners) {
         for (let i = 0; i < listeners.length; i++) {
            if (listeners[i](payload) === false) {
               listeners.splice(i, 1);
               i--;
            }
         }
      }
   }

   on(eventName: string, callback: ((data: ServerAction) => boolean | void)) {
      this.listeners[eventName] = this.listeners[eventName] ?? [];
      this.listeners[eventName].push(callback);
   }

   // addUser(_user: any) {
   // if (user && user.user_id === _user.user_id || indexOf(_user) >= 0) {
   //    return;
   // }

   // if (_user.__proto__ !== User.prototype) {
   //    _user = new User(_user);
   // }

   // usersByName.splice(_.sortedIndex(users, _user, function (u) { return u.name; }), 0, _user);
   // users.splice(_.sortedIndex(users, _user, function (u) { return u.user_id; }), 0, _user);

   // console.log(_.map(usersByName, function (u) { return u.name }));
   // console.log(_.map(users, function (u) { return u.user_id }));

   // $('.user-' + _user.user_id).text('@' + _user.name);
   // }

   autocomplete(name: string, callback: ((names: User[]) => void)) {
      callback(this.users.filter(user => {
         return user.name.indexOf(name) === 0 && user.name !== 'Unnamed';
      }));

      this.on('Lookup', (response: ServerAction) => {
         const { users } = response as LookupResponse;

         var result: User[] = [];
         users.forEach(info => {
            if (this.users.filter(u => u.id === info.id).length === 0) {
               result.push(new User(info));
            }
         });

         callback(result);
         return false; // Destroy this listener
         // result.forEach(user => {
         //    addUser(user);
         // });
      })

      this.send({
         action: 'Lookup',
         name
      });
   }

   toTag(name: string) {
      if (this.user?.name === name) {
         return this.user.tag;
      }

      const filtered = this.users.filter(user => user.name === name);
      return filtered ? filtered[0].tag : '';
   };

   logout() {
      localStorage.removeItem('token');
      this.send({
         action: 'Logout'
      });
   }
};