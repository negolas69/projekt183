import { login as loginUser } from '../services/authService.js';
import { CLASS_DO_NOT_DISPLAY } from '../utils/classesForStyling.js';
import { displayError } from '../utils/elementsUtil.js';
import { init as initRegister } from './register.js';
import { init as initTodos } from './todos.js';

const ID_FORM = 'form-login';
const ID_EMAIL = 'e-mail';
const ID_PASSWORD = 'password';
const ID_SUBMIT = 'submit';
const ID_TO_REGISTER = 'to-register';
const ID_FAILED_LOGIN = 'login-failed';

function init() {
  document.body.innerHTML = `<div class="container-form">
        <h1>Einloggen</h1>
        <form class="form" id="${ID_FORM}" autocomplete="new-password">
          <label class="small-font" for="${ID_EMAIL}">Email</label>
          <br />
          <input
            type="email"
            class="fit-container"
            name="email"
            id="${ID_EMAIL}"
          />
          <br />
          <label class="small-font" for="${ID_PASSWORD}">Password</label>
          <br />
          <input 
            type="password"
            class="fit-container"
            name="password"
            id="${ID_PASSWORD}"
            autocomplete="new-password"
          />
          <br />
          <input
            type="submit"
            class="btn fit-container"
            id="${ID_SUBMIT}"
            value="Login"
          />
          <p id="${ID_FAILED_LOGIN}" class="error ${CLASS_DO_NOT_DISPLAY}"></p>
        </form>
        <button 
          id="${ID_TO_REGISTER}"
          class="link small-font center fit-container"
        >
            Neu hier? Login erstellen.
        </button>
    </div>`;
  const elToRegister = document.getElementById(ID_TO_REGISTER);
  elToRegister.addEventListener('click', initRegister);
  const elLogin = document.getElementById(ID_SUBMIT);
  elLogin.addEventListener('click', (event) => {
    event.preventDefault();
    login(
      document.getElementById(ID_EMAIL).value,
      document.getElementById(ID_PASSWORD).value
    );
  });
}

async function login(email, password) {
  const elError = document.getElementById(ID_FAILED_LOGIN);
  if (email && password) {
    await loginUser({ email, password })
      .then((loggedInUser) => {
        initTodos(loggedInUser);
      })
      .catch(() => displayError('Login fehlgeschlagen', elError));
  } else {
    displayError('Angaben fehlen', elError);
  }
}

export { init };
