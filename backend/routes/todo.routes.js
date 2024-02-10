import { Router } from 'express';
import {
  createTodo,
  updateTodo,
  removeTodo,
} from '../controllers/todo.controller.js';
import { isAllowedToChangeTodo } from '../auth/authorization.js';

const router = Router();

router.post('/', createTodo);
router.put('/:id', isAllowedToChangeTodo, updateTodo);
router.delete('/:id', isAllowedToChangeTodo, removeTodo);

export { router };
