import {
  createMember,
  getAll as getTeams,
  remove as deleteTeam,
  removeUser,
  create as saveTeam,
  updateAdmins,
} from '../services/teamsService.js';
import { TAB, create as createHeader } from './header.js';
import {
  createAddButton,
  createDeleteButton,
  createElement,
  createOkButton,
  replaceElement,
  removeContentForm,
  getCounter,
} from '../utils/elementsUtil.js';
import {
  CLASS_CONTAINER_CONTENT,
  CLASS_FORM_CONTENT,
  CLASS_HEADER_CONTENT,
  CLASS_INLINE,
  CLASS_MARGIN_LEFT_ONLY,
  CLASS_NICKNAME,
  CLASS_SECTION_CONTENT,
} from '../utils/classesForStyling.js';
import { isUserTeamAdmin } from '../utils/userAuthorization.js';
import { getTeamUserByUsername, getTeamUsers } from '../utils/teamUtil.js';

const counterCheckboxId = getCounter(1);

async function init(loginUser) {
  const ID_HEADER = 'header';
  const ID_BTN_ADD_TEAM = 'add-team';
  const ID_TEAMS_SECTIONS = 'teams-sections';
  const teams = await getTeams();
  document.body.innerHTML = `
    <header id=${ID_HEADER}></header>
    <div class="${CLASS_CONTAINER_CONTENT}">
      <h1 class="${CLASS_INLINE}">Teams von ${loginUser.nickname}</h1>
      <input
        type="text"
        class="${CLASS_MARGIN_LEFT_ONLY}"
        placeholder="Name von neuem Team"
      />
      <button id="${ID_BTN_ADD_TEAM}"></button>
      <div id=${ID_TEAMS_SECTIONS}></div>
    </div>`;
  replaceElement(document.body, ID_HEADER, createHeader(TAB.TEAMS, loginUser));
  replaceElement(
    document.body,
    ID_BTN_ADD_TEAM,
    createAddButton(getSaveAndCreateTeamCb(loginUser._id))
  );
  replaceElement(
    document.body,
    ID_TEAMS_SECTIONS,
    ...teams.map((team) => createTeamSection(team, loginUser._id))
  );
}

function createTeamSection(team, loginId) {
  const ID_BTN_ADD = 'add-btn';
  const ID_BTN_DEL = 'delete-btn';
  const ID_ITEMS_TEAM = 'team-items';
  const elSection = createElement('div', [
    { name: 'class', value: `${CLASS_SECTION_CONTENT} background` },
  ]);
  elSection.innerHTML = `
    <div class="${CLASS_HEADER_CONTENT}">
      <h2>Team ${team.name}</h2>
      <button id=${ID_BTN_ADD}></button>
      <button id=${ID_BTN_DEL}></button>
    </div>
    <ul>
      <li id=${ID_ITEMS_TEAM}></li>
    </ul>`;
  replaceElement(
    elSection,
    ID_BTN_ADD,
    isUserTeamAdmin(loginId, team.admins)
      ? createAddButton(getAddTeamFormCb(elSection, loginId, team))
      : null
  );
  replaceElement(
    elSection,
    ID_BTN_DEL,
    isUserTeamAdmin(loginId, team.admins)
      ? createDeleteButton(getDeleteTeamCb(elSection, team))
      : null
  );
  replaceElement(
    elSection,
    ID_ITEMS_TEAM,
    ...getTeamUsers(team).map((user) => createTeamUser(user, team, loginId))
  );
  return elSection;
}

function createTeamUser(user, team, loginId) {
  const ID_CHECKBOX_LABEL = 'checkbox-label';
  const ID_BTN_DEL = 'btn-delete';
  const elItem = document.createElement('li');
  elItem.innerHTML = `
    <div class="${CLASS_INLINE}">${user.username}</div>
    <div class="${CLASS_NICKNAME} ${CLASS_INLINE}">
      ${user.nickname}
    </div>
    <input id=${ID_CHECKBOX_LABEL}></input>
    <button id="${ID_BTN_DEL}"></button>`;
  replaceElement(
    elItem,
    ID_CHECKBOX_LABEL,
    ...createAdminCheckboxWithLabel(elItem, team, user, loginId)
  );
  replaceElement(
    elItem,
    ID_BTN_DEL,
    user._id === loginId || isUserTeamAdmin(loginId, team.admins)
      ? createDeleteButton(getDeleteAndRemoveTeamUserCb(elItem, team, user))
      : null
  );
  return elItem;
}

function createAdminCheckboxWithLabel(elItem, team, user, loginId) {
  function getCheckboxAttr(id) {
    let attr = [
      { name: 'type', value: 'checkbox' },
      { name: 'id', value: id },
      { name: 'class', value: CLASS_MARGIN_LEFT_ONLY },
    ];
    const teamAdmins = team.admins;
    if (!isUserTeamAdmin(loginId, teamAdmins)) {
      attr.push({ name: 'disabled', value: '' });
    }
    if (isUserTeamAdmin(user._id, teamAdmins)) {
      attr.push({ name: 'checked', value: '' });
    }
    return attr;
  }

  const id = `${counterCheckboxId.next()}`;
  const elCheckbox = createElement('input', getCheckboxAttr(id));
  const elLabel = createElement(
    'label',
    [{ name: 'for', value: id }],
    'Ist Admin'
  );
  elCheckbox.addEventListener(
    'change',
    getUpdateAdminsCb(elItem, team, user, loginId)
  );
  return [elCheckbox, elLabel];
}

function getSaveAndCreateTeamCb(loginId) {
  return () => {
    const elTeamName = document.body.querySelector('input');
    const teamName = elTeamName.value;
    if (teamName) {
      // Speichern von neuem Team im Backend
      saveTeam({
        name: teamName,
        // TODO 1.2.2024: remove
        creator: loginId,
      }).then((team) => {
        // Abschnitt für neues Team hinzufügen
        const elSection = createTeamSection(team, loginId);
        const elContent = document.querySelector(
          `body > .${CLASS_CONTAINER_CONTENT}`
        );
        elContent.appendChild(elSection);
        // Wert in Eingabefeld löschen
        elTeamName.value = '';
      });
    }
  };
}

function getAddTeamFormCb(elSection, loginId, team) {
  const ID_BTN_OK = 'btn-ok';
  const ID_BTN_CANCEL = 'btn-cancel';
  return () => {
    removeContentForm();
    const elForm = createElement('div', [
      { name: 'class', value: CLASS_FORM_CONTENT },
    ]);
    elForm.innerHTML = `
      <input
        type="text"
        placeholder="Email neues Mitglied"
      />
      <button id="${ID_BTN_OK}"></button>
      <button id="${ID_BTN_CANCEL}"></button>`;
    replaceElement(
      elForm,
      ID_BTN_OK,
      createOkButton(
        isUserTeamAdmin(loginId, team.admins)
          ? getSaveAndCreateMemberCb(elSection, elForm, loginId, team)
          : null
      )
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

function getDeleteTeamCb(elSection, team) {
  return () => {
    removeContentForm();
    deleteTeam(team._id).then((deleteTeam) => {
      elSection.remove();
    });
  };
}

function getSaveAndCreateMemberCb(elSection, elForm, loginId, team) {
  return () => {
    const addedUsername = elForm.querySelector('input').value;
    if (addedUsername) {
      createMember(team._id, { username: addedUsername }).then(
        (updatedTeam) => {
          const elList = elSection.querySelector('ul');
          elList.appendChild(
            createTeamUser(
              getTeamUserByUsername(updatedTeam, addedUsername),
              updatedTeam,
              loginId
            )
          );
          elForm.remove();
        }
      );
    }
  };
}

function getUpdateAdminsCb(elItem, team, user, loginId) {
  return (event) => {
    const isAdmin = event.currentTarget.checked;
    updateAdmins(team._id, { ...user, isAdmin });
  };
}

function getDeleteAndRemoveTeamUserCb(elItem, team, userToRemove) {
  return () => {
    removeUser(team._id, userToRemove._id).then(() => {
      elItem.remove();
    });
  };
}

export { init };
