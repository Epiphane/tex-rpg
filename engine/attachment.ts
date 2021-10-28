export function Pasta(
    command: string,
    autoSubmit?: boolean,
    visibleString?: string,
) {
    const prefix = autoSubmit ? `[${command}]` : `]${command}[`;

    if (visibleString) {
        return `|${prefix}${visibleString}|`;
    }
    else {
        return `|${prefix}|`;
    }
}

export class Attachment {
    text: string[];

    constructor(
        text: string | string[],
        public readonly type: string,
    ) {
        if (typeof (text) === 'string') {
            text = [text];
        }

        this.text = text;
    }
}

export class Info extends Attachment {
    constructor(text: string | string[]) {
        super(text, 'Info');
    }
}

export class Good extends Attachment {
    constructor(text: string | string[]) {
        super(text, 'Good');
    }
}

export class Small extends Attachment {
    constructor(text: string | string[]) {
        super(text, 'Small');
    }
}

export class Warning extends Attachment {
    constructor(text: string | string[]) {
        super(text, 'Warning');
    }
}

export class Error extends Attachment {
    constructor(text: string | string[]) {
        super(text, 'Error');
    }
}