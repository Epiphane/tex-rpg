import { Place } from ".";
import User from "../../models/user";

export const solar = new Place({
    id: 'solar',
    name: 'Grand solar',
    desc: (user: User) => {
        return 'You see before you the Grand Solar, '
    },
});