import * as A from "engine/attachment";
import * as Action from "engine/client-actions";
import * as ServerResponse from "engine/server-actions";
import { Game } from "./game";
import { User } from "./user";
import { Textcomplete } from "@textcomplete/core";
import { TextareaEditor } from "@textcomplete/textarea";

const content = document.getElementById('content')!;
const history = document.getElementById('history')!;
const autotype = document.getElementById('autotype') as HTMLInputElement;

autotype.value = localStorage.getItem('autotype') ?? '';

declare global {
    interface String {
        formatMarkbottom(): string;
    }
}

String.prototype.formatMarkbottom = function (this: string) {
    return this
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\|\[(.*?)\](.*?)\|/g, (_, cmd, text) =>
            text
                ? '<span class="copypasta execute" pasta="' + cmd + '">' + text + '</span>'
                : '<span class="copypasta execute">' + cmd + '</span>'
        )
        .replace(/\|\](.*?)\[(.*?)\|/g, (_, cmd, text) =>
            text
                ? '<span class="copypasta" pasta="' + cmd + '">' + text + '</span>'
                : '<span class="copypasta">' + cmd + '</span>'
        );
};

class Input {
    data = document.getElementById('command') as HTMLTextAreaElement;
    div = document.getElementById('input-display');
    commands = document.getElementById('commands');
    value = localStorage.getItem('cmd') ?? '';
    isPassword = false;

    confirm = false;
    confirmCheck?: string;

    log: string[];
    logIndex: number;

    pendingEmail?: string;

    wasLoggedIn = false;
    triedToAuth = false;

    constructor(
        private readonly game: Game
    ) {
        try {
            this.log = JSON.parse(localStorage.getItem('log') ?? '[]');
        }
        catch {
            this.log = [];
        }
        this.logIndex = this.log.length;

        game.on(ServerResponse.Attach, ({ attachments }) => {
            attachments.forEach(this.insertAttachment.bind(this));
        });

        this.wasLoggedIn = game.isLoggedIn();
        this.triedToAuth = false;
        game.on(ServerResponse.Token, ({ token }) => {
            if (token) {
                this.insertAttachment(new A.Small('Login successful.'));
                this.wasLoggedIn = true;
            }
            else {
                let logoutAttachment: A.Attachment;
                if (this.wasLoggedIn) {
                    logoutAttachment = new A.Info('You have been logged out.');
                    this.wasLoggedIn = false;
                }
                else if (this.triedToAuth) {
                    logoutAttachment = new A.Error('Authentication failed.');
                    this.triedToAuth = false;
                }
                else {
                    logoutAttachment = new A.Info('You are not logged in.');
                }
                this.insertAttachments([
                    logoutAttachment,
                    new A.Small('Enter your email to log in:'),
                ]);
            }
        });

        game.on(ServerResponse.CurrentUser, ({ user }) => {
            this.insertAttachment(new A.Small(`Welcome back, ${user.tag}.`));
            if (autotype.value !== '') {
                this.enter(autotype.value);
            }
            return false;
        });

        game.on(ServerResponse.UpdateUsers, ({ users }) => {
            users.forEach(user => {
                const tags = document.getElementsByClassName(`user-${user.id}`);
                const newVal = game.lookup(user.tag);
                for (let i = 0; i < tags.length; i++) {
                    tags[i].textContent = newVal;
                }
            });
        });

        this.setCommands([`|[help]|`]);
        game.on(ServerResponse.AvailableCommands, ({ commands }) => {
            this.setCommands(commands);
        });

        this.setupAutoComplete();
        this.set(localStorage.getItem('cmd') ?? '');
    }

    setupAutoComplete() {
        const specialKeys: { [key: number]: string } = {
            13: 'enter',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        let replaced = false;
        const editor = new TextareaEditor(this.data);

        // Don't gotta clean this up cause it never goes away~
        new Textcomplete(editor, [
            {
                match: /\B@(\w{2,})$/,
                search: (term: string, callback: (results: string[]) => void) => {
                    term = term.toLowerCase();
                    this.game.autocomplete(term, callback);
                },
                index: 1,
                replace: (mention: string) => {
                    replaced = true;
                    return '@' + mention + ' ';
                }
            }
        ], {
            dropdown: {
                header: (results: unknown[]) => "",
                footer: (results: unknown[]) => "",
            }
        })

        // this.data.onblur = () => {
        //     this.data.focus();
        // }
        this.data.focus();
        content.onclick = () => this.data.focus();

        this.data.oninput =
            this.data.onkeydown =
            this.data.onkeyup =
            this.data.onmousedown =
            this.data.onmouseup =
            this.data.onmousemove = () => this.update();

        document.onkeydown = (e: KeyboardEvent) => {
            const keyCode = e.keyCode;

            if (specialKeys[keyCode]) {
                var key = specialKeys[keyCode];

                const dropdown = document.getElementsByClassName('textcomplete-dropdown');
                const dropdownVisible = (dropdown.length > 0 && (dropdown[0] as HTMLElement).style.display !== 'none');

                if ((this as any)[key] && !dropdownVisible) {
                    if (replaced) {
                        replaced = false;
                        return false;
                    }

                    (this as any)[key]();

                    return false;
                }
            }

            localStorage.setItem('autotype', autotype.value);
        };
    }

    update() {
        // console.log(this.data.value);
        // console.log(this.value);
        this.value = this.data.value;
        localStorage.setItem('cmd', this.value);

        let display = this.value;
        if (this.isPassword) {
            display = (new Array(this.value.length + 1)).join('*');
        }

        const { selectionStart, selectionEnd } = this.data;

        let before, between, after;
        let replacing = '';
        if (selectionStart === this.value.length) {
            before = display;
            between = ' ';
            after = '';
        }
        else if (selectionStart === selectionEnd) {
            before = display.substr(0, selectionStart);
            between = display.substr(selectionStart, 1);
            after = display.substr(selectionEnd + 1);
        }
        else {
            before = display.substr(0, selectionStart);
            between = display.substr(selectionStart, selectionEnd - selectionStart);
            after = display.substr(selectionEnd);
            replacing = 'replacing';
        }
        between = between.replace(/ /g, '&nbsp;');
        before = before.replace(/ /g, '&nbsp;');
        after = after.replace(/ /g, '&nbsp;');
        this.div!.innerHTML = `${before}<span class="selection ${replacing}">${between}</span>${after}`;
        this.div!.scrollLeft = this.data!.scrollLeft;
    }

    set(str: string) {
        this.data.value = str;
        this.update();
    };

    add(str: string) {
        this.set(this.value + str);
    };

    up() {
        if (this.logIndex > 0) {
            this.logIndex--;

            this.set(this.log[this.logIndex]);
        }
    };

    down() {
        if (this.logIndex < this.log.length) {
            this.logIndex++;

            if (this.logIndex < this.log.length) {
                this.set(this.log[this.logIndex]);
            }
            else {
                this.set('');
            }
        }
    };

    addToLog() {
        this.log.push(this.value);
        this.logIndex = this.log.length;

        localStorage.setItem('log', JSON.stringify(this.log));
    };

    enter(value?: string) {
        if (!value) {
            value = this.value;
            this.data.value = '';
        }
        if (!this.confirm && !this.isPassword) {
            this.addToLog();
        }

        const record = document.createElement('div');
        record.classList.add('record');

        let command = value;
        if (this.isPassword) {
            command = (new Array(command.length + 1)).join('*');
        }

        record.innerHTML = `> ${command}`;
        history.appendChild(record);

        // Set password to false if we're not confirming a password
        this.setPassword(this.confirm && this.isPassword);

        if (['logout', 'quit'].indexOf(command.toLowerCase()) >= 0) {
            this.game.logout();
        }
        else if (['clear'].indexOf(command.toLowerCase()) >= 0) {
            while (history.firstChild) {
                history.removeChild(history.firstChild);
            }
        }
        else if (this.confirm && !this.confirmCheck) {
            this.confirmCheck = value;
            this.insertAttachment(new A.Small('Please enter it again to confirm.'));
        }
        else if (this.confirm && this.confirmCheck) {
            if (value === this.confirmCheck) {
                this.game.send(new Action.Command(value));
                this.setPassword(false);
                this.confirm = false;
            }
            else {
                this.insertAttachment(new A.Error('Entries did not match. Please try again'));

                this.confirm = true;
                this.setPassword(true);
            }
        }
        else if (!this.game.isLoggedIn()) {
            if (!this.pendingEmail) {
                this.pendingEmail = value;

                this.insertAttachment(new A.Small('Password:'));
                this.setPassword(true);
            }
            else {
                this.triedToAuth = true;
                this.game.send(new Action.Login(this.pendingEmail, value));
                this.pendingEmail = undefined;
            }
        }
        else if (!this.confirm) {
            this.game.send(new Action.Command(value));
        }

        // Update mentions
        // var str = this.str.replace(/\B@(\w*)/g, function (str, tag) { return game.toTag(tag); }).toLowerCase();
        content.scrollTo(0, content.scrollHeight);
        this.update();
    };

    setPassword(isPassword: boolean) {
        this.isPassword = isPassword;
        (this.data as any).type = this.isPassword ? 'password' : 'text';
    };

    setConfirm(confirm: boolean) {
        this.confirm = confirm;
    };

    insertAttachment(attachment: A.Attachment) {
        const { text, type } = attachment;

        const element = document.createElement('div');
        element.classList.add('attachment', type);

        element.innerHTML = text
            .join('<br />')
            .replace(/<#([0-9]+)>/g, (tag, id) =>
                '<span class="user-tag user-' + id + '">' + this.game.lookup(tag) + '</span>'
            )
            .formatMarkbottom();

        history.appendChild(element);

        this.setupLinks(element);
        content.scrollTo(0, content.scrollHeight);
    };

    setCommands(commands: string[]) {
        if (this.commands) {
            while (this.commands.firstChild) {
                this.commands.removeChild(this.commands.firstChild);
            }

            this.commands.innerHTML = commands
                .map(command => `<li>${command}</li>`)
                .join('')
                .formatMarkbottom();
            this.setupLinks(this.commands);
        };
    }

    setupLinks(element: HTMLElement) {
        const pastas = element.getElementsByClassName('copypasta');
        for (let i = 0; i < pastas.length; i++) {
            const pasta = pastas[i] as HTMLElement;

            pasta.onclick = () => {
                const text = pasta.textContent ?? '';
                const command = pasta.getAttribute('pasta');

                const content = command ?? text;
                if (pasta.classList.contains('execute')) {
                    this.enter(content);
                }
                else {
                    if (this.value.length > 0 && this.value[this.value.length - 1] !== ' ') {
                        this.add(` ${content}`);
                    }
                    else {
                        this.add(content);
                    }
                }
            };
        };
    }

    insertAttachments(attachments: A.Attachment[]) {
        attachments.forEach(attach => this.insertAttachment(attach));
    }
};

{
    const game = new Game();
    const input = new Input(game);

    // Connect
    const socket = new WebSocket(`ws://${window.location.host}`);
    socket.addEventListener('close', () => {
        window.location.reload();
    });
    game.setSocket(socket);
}
