import * as express from 'express';
import User from '../../engine/models/user';

const router = express.Router();

router.get('/me', (req, res) => {
});

router.post('/', async (req, res) => {
});

export { router as UsersRouter };