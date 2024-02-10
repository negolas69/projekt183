import { CLASS_CONTAINER_CONTENT } from '../utils/classesForStyling.js';
import { init as initLogin } from './login.js';
import { init as initTodos } from './todos.js';
import { init as initTeams } from './teams.js';
import {
  createElement,
  createButton,
  replaceElement,
} from '../utils/elementsUtil.js';
import { logout as logoutUser } from '../services/authService.js';

const TAB = {
  TODOS: 'todos',
  TEAMS: 'teams',
};

function create(selectedTab, loginUser) {
  const ID_TAB_TODOS = 'tab-todos';
  const ID_TAB_TEAMS = 'tab-teams';
  const ID_LOGOUT_BTN = 'btn-logout';
  const elHeader = document.createElement('header');
  elHeader.innerHTML = `
    <div class="${CLASS_CONTAINER_CONTENT}">
      <nav>
        <ul>
          <li id=${ID_TAB_TODOS}>
          <li id=${ID_TAB_TEAMS}>
        </ul>
      </nav>
    </div>
    <button id=${ID_LOGOUT_BTN}></button>`;
  replaceElement(
    elHeader,
    ID_TAB_TODOS,
    createTabItem(TAB.TODOS, 'Meine TODOs', selectedTab, loginUser)
  );
  replaceElement(
    elHeader,
    ID_TAB_TEAMS,
    createTabItem(TAB.TEAMS, 'Meine Teams', selectedTab, loginUser)
  );
  replaceElement(elHeader, ID_LOGOUT_BTN, createButton('', 'Logout', logout));
  return elHeader;
}

function createTabItem(tab, textContent, selectedTab, loginUser) {
  const elItem = createElement(
    'li',
    [
      {
        name: 'class',
        value: `site ${selectedTab === tab ? 'selected' : ''}`,
      },
    ],
    textContent
  );
  if (selectedTab !== tab) {
    elItem.addEventListener('click', () => navigate(selectedTab, loginUser));
  }
  return elItem;
}

function navigate(selectedTab, loginUser) {
  if (selectedTab === TAB.TEAMS) {
    initTodos(loginUser);
  } else {
    initTeams(loginUser);
  }
}

async function logout() {
  await logoutUser().then(() => initLogin());
}

export { TAB, create };
