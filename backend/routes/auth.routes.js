import { Router } from 'express';
import {
  registerUser,
  getUser,
  loginUser,
  logoutUser,
} from '../controllers/auth.controller.js';
import { isAuthenticated } from '../auth/authorization.js';

const router = Router();

router.post('/register', registerUser);
router.get('/me', getUser);
router.post('/login', loginUser);
router.post('/logout', isAuthenticated, logoutUser);

export { router };
