import * as express from 'express';
import { LoginRouter, requireLogin } from './login';
import { UsersRouter } from './users';

const router = express.Router();

router.use('/login', LoginRouter);
router.use(requireLogin);

router.use('/users', UsersRouter);

export default router;