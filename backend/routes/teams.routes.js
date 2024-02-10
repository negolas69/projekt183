import { Router } from 'express';
import {
  getUserTeams,
  createTeam,
  createMember,
  updateAdmins,
  removeUser,
  removeTeam,
} from '../controllers/teams.controller.js';
import { isAllowedToChangeTeam } from '../auth/authorization.js';

const router = Router();

router.get('/', getUserTeams);
router.post('/', createTeam);
router.post('/:id/members', isAllowedToChangeTeam, createMember);
router.patch('/:id/admins', isAllowedToChangeTeam, updateAdmins);
router.delete('/:id/users/:userId', isAllowedToChangeTeam, removeUser);
router.delete('/:id', isAllowedToChangeTeam, removeTeam);

export { router };
