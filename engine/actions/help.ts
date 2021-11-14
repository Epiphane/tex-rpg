import { Actions, MakeAction, SortedActions } from ".";
import { Info } from "../attachment";

function ActualLength(str?: string) {
    if (!str) {
        return 0;
    }

    return str
        .replace(/`/g, '')
        .replace(/\|[\]\[](.*?)[\]\[](.*?)?\|/g, (_, cmd, text) => text ?? cmd)
        .length;
}

const PAD_HELP = false;

export const help = MakeAction({
    description: 'Get a list of available actions',
    priority: 99,
    fn(_, user) {
        const actions = SortedActions
            .map(cmd => Actions[cmd])
            .filter(action => !action.hidden);

        if (PAD_HELP) {
            const maxLength = actions.reduce((prev, action) =>
                Math.max(prev, ActualLength(action.shortFmt(user))), 0
            );

            return new Info(actions.map(action => {
                const pasta = action.shortFmt(user);
                const pad = new Array(maxLength - ActualLength(pasta) + 2).join('&nbsp;')
                return `- ${pasta}${pad} : ${action.longFmt(user)}`;
            }));
        }
        else {
            return new Info(actions.map(action => {
                const pasta = action.shortFmt(user);
                return `- ${pasta} : ${action.longFmt(user)}`;
            }));
        }
    },
});
