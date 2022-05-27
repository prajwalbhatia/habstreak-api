import express from 'express';

//Controllers
import {
  writeMessage
} from './../controllers/support.js';

const router = express.Router();

router.post('/write-message', writeMessage);

export default router;
