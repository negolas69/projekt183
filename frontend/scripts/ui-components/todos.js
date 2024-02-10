import {
  CLASS_CONTAINER_CONTENT,
  CLASS_SECTION_CONTENT,
  CLASS_HEADER_CONTENT,
  CLASS_FORM_CONTENT,
  CLASS_NICKNAME,
  CLASS_TODO_DONE,
  CLASS_INPUT_LONG,
  CLASS_INLINE,
} from '../utils/classesForStyling.js';
import { TAB, create as createHeader } from './header.js';
import { getAll as getTeams } from '../services/teamsService.js';
import {
  create as saveTodo,
  update as updateTodo,
  remove as deleteTodo,
} from '../services/todosService.js';
import {
  createElement,
  createAddButton,
  createOkButton,
  createDeleteButton,
  createDropdown,
  replaceElement,
  removeContentForm,
  getCounter,
} from '../utils/elementsUtil.js';
import {
  isUserAllowedToChangeTodo,
  isUserTeamAdmin,
} from '../utils/userAuthorization.js';
import { getTeamUsers } from '../utils/teamUtil.js';

const counterCheckboxId = getCounter(1);

async function init(loginUser) {
  const ID_HEADER = 'header';
  const ID_TODO_SECTIONS = 'todo-sections';
  const teams = await getTeams();
  document.body.innerHTML = `
    <header id=${ID_HEADER}></header>
    <div class="${CLASS_CONTAINER_CONTENT}">
      <h1>TODOs von ${loginUser.nickname}</h1>
      <div id=${ID_TODO_SECTIONS}></div>
    </div>`;
  replaceElement(document.body, ID_HEADER, createHeader(TAB.TODOS, loginUser));
  replaceElement(
    document.body,
    ID_TODO_SECTIONS,
    ...teams.map((team) => createTeamTodos(team, loginUser._id))
  );
}

function createTeamTodos(team, loginId) {
  const ID_BTN_ADD = 'add-btn';
  const ID_ITEMS_TODO = 'todo-items';
  const elSection = createElement('div', [
    { name: 'class', value: `${CLASS_SECTION_CONTENT} background` },
  ]);
  elSection.innerHTML = `
    <div class="${CLASS_HEADER_CONTENT}">
      <h2>TODOs von Team ${team.name}</h2>
      <button id=${ID_BTN_ADD}></button>
    </div>
    <ul>
      <li id=${ID_ITEMS_TODO}></li>
    </ul>`;
  replaceElement(
    elSection,
    ID_BTN_ADD,
    createAddButton(getAddTodoFormCb(elSection, loginId, team))
  );
  replaceElement(
    elSection,
    ID_ITEMS_TODO,
    ...team.todos.map((todo) => createTodo(todo, loginId, team.admins))
  );
  return elSection;
}

function createTodo(todo, loginId, teamAdmins) {
  const ID_BTN_DEL = 'btn-delete';
  const ID_CHECKBOX_LABEL = 'checkbox-label';
  const elItem = document.createElement('li');
  const responsible = todo.responsible;
  elItem.innerHTML = `
    <input id=${ID_CHECKBOX_LABEL}></input>
    <div class="${CLASS_NICKNAME} ${CLASS_INLINE}">
      ${responsible.nickname}
    </div>
    <button id="${ID_BTN_DEL}"></button>`;
  replaceElement(
    elItem,
    ID_CHECKBOX_LABEL,
    ...createTodoCheckboxWithLabel(elItem, todo, loginId, teamAdmins)
  );
  replaceElement(
    elItem,
    ID_BTN_DEL,
    todo.isDone &&
      isUserAllowedToChangeTodo(loginId, responsible._id, teamAdmins)
      ? createDeleteButton(getDeleteAndRemoveTodoCb(elItem, todo))
      : null
  );
  return elItem;
}

function createTodoCheckboxWithLabel(elItem, todo, loginId, teamAdmins) {
  function getCheckboxAttr(id) {
    let attr = [
      { name: 'type', value: 'checkbox' },
      { name: 'id', value: id },
    ];
    if (!isUserAllowedToChangeTodo(loginId, todo.responsible._id, teamAdmins)) {
      attr.push({ name: 'disabled', value: '' });
    }
    if (todo.isDone) {
      attr.push({ name: 'checked', value: '' });
    }
    return attr;
  }

  function getLabelAttr(id) {
    let attr = [{ name: 'for', value: id }];
    if (todo.isDone) {
      attr.push({ name: 'class', value: CLASS_TODO_DONE });
    }
    return attr;
  }

  const id = `${counterCheckboxId.next()}`;
  const elCheckbox = createElement('input', getCheckboxAttr(id));
  const elLabel = createElement('label', getLabelAttr(id), todo.description);
  elCheckbox.addEventListener(
    'change',
    getUpdateTodoCb(elItem, todo, loginId, teamAdmins)
  );
  return [elCheckbox, elLabel];
}

function getAddTodoFormCb(elSection, loginId, team) {
  const ID_SELECT_RESP = 'select-responsible';
  const ID_BTN_OK = 'btn-ok';
  const ID_BTN_CANCEL = 'btn-cancel';
  return () => {
    removeContentForm();
    const elForm = createElement('div', [
      { name: 'class', value: CLASS_FORM_CONTENT },
    ]);
    elForm.innerHTML = `
      <input 
        class="${CLASS_INPUT_LONG}"
        type="text"
        placeholder="Beschreibung neues Todo"
      />
      <select id="${ID_SELECT_RESP}"></select>
      <button id="${ID_BTN_OK}"></button>
      <button id="${ID_BTN_CANCEL}"></button>`;
    replaceElement(
      elForm,
      ID_SELECT_RESP,
      isUserTeamAdmin(loginId, team.admins)
        ? createDropdown(
            'Zuständige Person wählen',
            getTeamUsers(team).map((user) => {
              return {
                value: user._id,
                textContent: user.nickname,
              };
            })
          )
        : null
    );
    replaceElement(
      elForm,
      ID_BTN_OK,
      createOkButton(getSaveAndCreateTodoCb(elSection, elForm, loginId, team))
    );
    replaceElement(
      elForm,
      ID_BTN_CANCEL,
      createDeleteButton(() => elForm.remove())
    );
    // Formular nach Header einfügen
    const elHeader = elSection.querySelector(`.${CLASS_HEADER_CONTENT}`);
    elHeader.after(elForm);
  };
}

function getSaveAndCreateTodoCb(elSection, elForm, loginId, team) {
  return () => {
    const description = elForm.querySelector('input').value;
    let responsibleId = elForm.querySelector('select')?.value;
    if (description) {
      if (!responsibleId) {
        responsibleId = loginId;
      }
      const responsible = getTeamUsers(team).filter(
        (user) => user._id === responsibleId
      )[0];
      saveTodo({
        description,
        isDone: false,
        responsible: responsible._id,
        team: team._id,
      }).then((todo) => {
        const elList = elSection.querySelector('ul');
        elList.appendChild(createTodo(todo, loginId, team.admins));
        elForm.remove();
      });
    }
  };
}

function getUpdateTodoCb(elItem, todo, loginId, teamAdmins) {
  return () => {
    todo.isDone = !todo.isDone;
    updateTodo(todo._id, {
      description: todo.description,
      isDone: todo.isDone,
      responsible: todo.responsible._id,
    }).then((updatedTodo) => {
      elItem.replaceWith(createTodo(updatedTodo, loginId, teamAdmins));
    });
  };
}

function getDeleteAndRemoveTodoCb(elItem, todo) {
  return () => {
    deleteTodo(todo._id).then(() => {
      elItem.remove();
    });
  };
}

export { init };
