import { AError, ASmall } from "./attachments";
import { Game } from "./game";
import { User } from "./user";
import { Textcomplete } from "@textcomplete/core";
import { TextareaEditor } from "@textcomplete/textarea";
import { textChangeRangeIsUnchanged } from "typescript";

const socket = new WebSocket('ws://localhost:8081');
socket.addEventListener('close', () => {
    window.location.reload();
});

const game = new Game(socket);

const specialKeys: { [key: number]: string } = {
    13: 'enter',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
};

let replaced = false;
const command = document.getElementById('command') as HTMLTextAreaElement;
const editor = new TextareaEditor(command);

// Don't gotta clean this up cause it never goes away~
const textcomplete = new Textcomplete(editor, [
    {
        match: /\B@(\w*)$/,
        search: (term: string, callback: (results: User[]) => void) => {
            term = term.toLowerCase();
            game.autocomplete(term, callback);
        },
        index: 1,
        replace: (mention: string) => {
            console.log(mention);
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

command.onblur = () => command.focus();
command.focus();

command.oninput =
    command.onkeydown =
    command.onkeyup =
    command.onmousedown =
    command.onmouseup =
    command.onmousemove = () => input.update();

document.onkeydown = (e: KeyboardEvent) => {
    const keyCode = e.keyCode;

    if (specialKeys[keyCode]) {
        var key = specialKeys[keyCode];

        const dropdown = document.getElementsByClassName('textcomplete-dropdown');
        const dropdownVisible = (dropdown.length > 0 && (dropdown[0] as HTMLElement).style.display !== 'none');

        if ((input as any)[key] && !dropdownVisible) {
            if (replaced) {
                replaced = false;
                return false;
            }

            (input as any)[key]();

            return false;
        }
    }
};

const content = document.getElementById('content')!;
const history = document.getElementById('history')!;

class Input {
    data = command;
    div = document.getElementById('input-display');
    value = '';
    isPassword = false;

    confirm = false;
    confirmCheck?: string;

    log: string[] = [];
    logIndex = 0;

    update() {
        this.value = command.value;

        let display = this.value.toUpperCase();
        if (this.isPassword) {
            display = (new Array(this.value.length + 1)).join('*');
        }

        const { selectionStart, selectionEnd } = command;

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
        this.div!.scrollLeft = command!.scrollLeft;
    }

    set(str: string) {
        command.value = str;
        this.update();
    };

    add(str: string) {
        this.data.value += str;
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
    };

    enter() {
        if (!this.confirm && !this.isPassword) {
            this.addToLog();
        }

        const record = document.createElement('div');
        record.classList.add('record');

        let command = this.value.toUpperCase();
        if (this.isPassword) {
            command = (new Array(command.length + 1)).join('*');
        }

        record.innerHTML = `> ${command}`;
        history.appendChild(record);

        // Set password to false if we're not confirm a password
        this.setPassword(this.confirm && this.isPassword);

        if (command === 'logout' || command === 'quit') {
            game.logout();
        }
        else if (!this.confirm) {
            game.send({
                action: 'Command',
                command: this.value,
            });
        }
        else if (this.confirm && !this.confirmCheck) {
            this.confirmCheck = this.value;
            this.insertAttachment(new ASmall('Please enter it again to confirm.'));
        }
        else if (this.confirm && this.confirmCheck) {
            if (this.value === this.confirmCheck) {
                game.send({
                    action: 'Command',
                    command: this.value
                });
                this.setPassword(false);
                this.confirm = false;
            }
            else {
                this.insertAttachment(new AError('Entries did not match. Please try again'));

                this.confirm = true;
                this.setPassword(true);
            }
        }

        // Update mentions
        // var str = this.str.replace(/\B@(\w*)/g, function (str, tag) { return game.toTag(tag); }).toLowerCase();

        this.set('');
        content.scrollTo(0, content.scrollHeight);
    };

    setPassword(isPassword: boolean) {
        this.isPassword = isPassword;
        (command as any).type = this.isPassword ? 'password' : 'text';
    };

    setConfirm(confirm: boolean) {
        this.confirm = confirm;
    };

    insertAttachment(attachment: any) {
        // var element = $('<div class="attachment ' + (attachment.type || 'info') + '">');

        // attachment.md_text = attachment.md_text || attachment.text;
        // if (!Array.isArray(attachment.md_text)) {
        //     attachment.md_text = [attachment.md_text];
        // }
        // attachment.md_text = attachment.md_text
        //     .join('<br />')
        //     .replace(/<#([0-9]+)>/g, function (tag, id) {
        //         return '<span class="user-tag user-' + id + '">' + Game.lookup(tag) + '</span>'
        //     })
        //     .replace(/`(.*?)`/g, '<code>$1</code>')
        //     .replace(/\|\[(.*?)\](.*?)\|/g, function (string, cmd, text) {
        //         if (!text) {
        //             return '<span class="copypasta execute">' + cmd + '</span>';
        //         }
        //         return '<span class="copypasta execute" pasta="' + cmd + '">' + text + '</span>'
        //     })
        //     .replace(/\|(.*?)\|/g, '<span class="copypasta">$1</span>');
        // element.html(attachment.md_text);

        // element.insertBefore(this.div);

        // element.find('.copypasta').on('click', function () {
        //     var pasta = $(this).text().toUpperCase();
        //     var prefix = $(this).attr('pasta');
        //     if (prefix) {
        //         pasta = prefix + ' ' + pasta;
        //     }

        //     if ($(this).hasClass('execute')) {
        //         Input.set(pasta);
        //         Input.enter();
        //     }
        //     else {
        //         if (Input.str.length && Input.str[Input.str.length - 1] !== ' ') {
        //             pasta = ' ' + pasta;
        //         }

        //         Input.add(pasta);
        //     }
        // });

        // window.scrollTo(0, document.body.scrollHeight);
    };

    insertAttachments(attachments: any) {
        // while (attachments.length) {
        //     Input.insertAttachment(attachments.shift());
        // }
    }
};

const input = new Input();

// socket.on('attachment', function (attachment) {
//     input.insertAttachment(attachment);
// });

// socket.on('attachments', function (attachments) {
//     input.insertAttachments(attachments);
// });

// socket.on('password', function () {
//     input.setPassword(true);
// });

// socket.on('confirm', function () {
//     input.setConfirm(true);
// });