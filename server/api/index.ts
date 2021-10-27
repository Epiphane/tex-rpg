import * as express from 'express';
import { LoginRouter, requireLogin } from './login';
import { UsersRouter } from './users';

const router = express.Router();

router.use('/login', LoginRouter);
router.use(requireLogin);

router.use('/users', UsersRouter);
router.get('/', async (req, res) => {
    res.write(`Hi there ${req.user.displayName}!\nReady to have some fun?\n\n`);
    res.end();
});

export default router;