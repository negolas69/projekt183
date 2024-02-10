import { getLoggedInUser } from './services/authService.js';
import { init as initLogin } from './ui-components/login.js';
import { init as initTodos } from './ui-components/todos.js';

getLoggedInUser()
  .then((user) => {
    if (!user) {
      return initLogin();
    }
    initTodos(user);
  })
  .catch(() => initLogin());
