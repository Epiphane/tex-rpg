export function Pasta(
    command: string,
    autoSubmit?: boolean,
    visibleString?: string,
) {
    const prefix = autoSubmit ? `[${command}]` : `]${command}[`;
    return `\`|${prefix}${visibleString ?? command}|\``;
}

// returns the index of the first letter in a string
export function FirstLetter(str: string) {
    let inLink = false;
    const letter = /[A-Za-z]/;
    const linker = /[\[\]]/;
    for (let index = 0; index < str.length; index++) {
        const c = str.charAt(index);
        if (!inLink) {
            if (letter.test(c)) {
                return index;
            }
            else if (c === '\|' && str.charAt(index + 1).match(linker)) {
                // Skip the [ or ]
                index++;
                inLink = true;
            }
        }
        else if (c.match(linker)) {
            inLink = false;
        }
    }

    return 0;
}

export function One(noun: string) {
    const firstLetter = noun.charAt(FirstLetter(noun)).toLowerCase();
    if (['a', 'e', 'i', 'o', 'u'].includes(firstLetter)) {
        return `an ${noun}`;
    }
    else {
        return `a ${noun}`;
    }
}

export function Plural(noun: string) {
    return `${noun}s`;
}

export function Quantity(noun: string, count: number = 1) {
    switch (count) {
        case 0:
        case 1:
            return One(noun);
        case 2:
            return `two ${Plural(noun)}`;
        default:
            return `${count} ${Plural(noun)}`;
    }
}

export function Sentence(str: string) {
    let firstChar = FirstLetter(str);
    return str.substr(0, firstChar) +
        str.charAt(firstChar).toUpperCase() +
        str.substr(firstChar + 1);
}

export function List(strings: string[], prefix: string = '') {
    if (strings.length === 0) {
        return ``;
    }

    if (strings.length === 1) {
        return strings[0];
    }

    const strs = [
        strings.slice(0, -1),
        `and ${strings[strings.length - 1]}`,
    ];
    if (strings.length === 2) {
        return `${prefix}${strs.join(' ')}`;
    }
    else {
        return `${prefix}${strs.join(', ')}`;
    }
}