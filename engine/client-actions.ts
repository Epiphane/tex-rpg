export default interface ClientAction {
    action: string;
}

export class Token implements ClientAction {
    action = 'Token';
    constructor(
        public token: string
    ) { }
}

export class Login implements ClientAction {
    action = 'Login';
    constructor(
        public email: string,
        public password: string,
    ) { }
}

export class SetZone implements ClientAction {
    action = 'SetZone';
    constructor(
        public zone: string
    ) { }
}

export class SetChannel implements ClientAction {
    action = 'SetChannel';
    constructor(
        public channel: string
    ) { }
}

export class Lookup implements ClientAction {
    action = 'Lookup';
    constructor(
        public name: string
    ) { }
}

export class Command implements ClientAction {
    action = 'Command';
    constructor(
        public command: string
    ) { }
}