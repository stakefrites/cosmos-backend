import express from 'express';

import AuthRouter from './auth';
import AccountRouter from './account';

const router = express.Router();

router.use('/account', AccountRouter);
router.use('/', AuthRouter);

export default router;
