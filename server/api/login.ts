import * as express from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { Writable } from 'stream';
import User from '../../engine/models/user';

const router = express.Router();

const serveLoginPage = (res: Writable, inject?: string) => {
    res.write(`
<html>
<head><title>Login</title></head>
<body>
${inject ?? ''}
<form method="post" action="/login">
<input type="text" name="username" />
<input type="submit" />
</form>
</body>
</html>
`);
    res.end();
}

router.get('/', (req, res) => {
    if (req.cookies.userId) {
        res.redirect('/');
        res.end();
    }
    else {
        serveLoginPage(res);
    }
});

router.post('/', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        serveLoginPage(res, `<p style="color: #a00">Error: username not provided</p>`);
        return;
    }

    const [user, _] = await User.findCreateFind({
        where: {
            username: username
        }
    });

    res.cookie('userId', user.id);
    res.redirect(302, '/');
    res.end();
});

export { router as LoginRouter };

declare global {
    namespace Express {
        interface Request {
            user: User;
        }
    }
}

const requireLogin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.cookies.userId) {
        res.redirect(302, '/login');
        return;
    }

    const user = await User.findOne({
        where: {
            id: req.cookies.userId
        }
    });

    if (!user) {
        res.clearCookie('userId');
        res.redirect(302, '/login');
        return;
    }

    req.user = user;
    next();
};

export { requireLogin };