import { register as registerUser } from '../services/authService.js';
import { CLASS_DO_NOT_DISPLAY } from '../utils/classesForStyling.js';
import { displayError } from '../utils/elementsUtil.js';
import { init as initLogin } from './login.js';

const ID_FORM = 'form-register';
const ID_EMAIL = 'e-mail';
const ID_NICKNAME = 'nickname';
const ID_PASSWORD = 'password';
const ID_SUBMIT = 'submit';
const ID_TO_LOGIN = 'to-login';
const ID_FAILED_REGISTER = 'register-failed';

function init() {
  document.body.innerHTML = `<div class="container-form">
        <h1>Registrieren und TODOs erstellen</h1>
        <form class="form" id="${ID_FORM}">
          <label class="small-font" for="${ID_EMAIL}">Email</label>
          <br />
          <input 
            type="email"
            class="fit-container"
            name="email"
            id="${ID_EMAIL}" 
          />
          <br />
          <label class="small-font" for="${ID_NICKNAME}">Nickname</label>
          <br />
          <input 
            type="text"
            class="fit-container"
            name="nickname"
            id="${ID_NICKNAME}" 
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
            value="Registrieren"
          />
        <p id="${ID_FAILED_REGISTER}" class="error ${CLASS_DO_NOT_DISPLAY}"></p>
        </form>
        <button 
          id="${ID_TO_LOGIN}"
          class="link small-font center fit-container"
        >
            Schon ein Account? Zum Login.
        </button>
    </div>`;
  const elToLogin = document.getElementById(ID_TO_LOGIN);
  elToLogin.addEventListener('click', initLogin);
  const elRegister = document.getElementById(ID_SUBMIT);
  elRegister.addEventListener('click', (event) => {
    event.preventDefault();
    register(
      document.getElementById(ID_EMAIL).value,
      document.getElementById(ID_NICKNAME).value,
      document.getElementById(ID_PASSWORD).value
    );
  });
}

async function register(email, nickname, password) {
  const elError = document.getElementById(ID_FAILED_REGISTER);
  if (email && nickname && password) {
    await registerUser({ email, nickname, password })
      .then(() => {
        initLogin();
      })
      .catch(() => displayError('Registrierung fehlgeschlagen'), elError);
  } else {
    displayError('Angaben fehlen', elError);
  }
}

export { init };
