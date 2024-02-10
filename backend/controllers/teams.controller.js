import { model as Team } from '../models/teams.model.js';
import { model as Todo } from '../models/todo.model.js';
import {
  findUserByNameAndCheckThatItExists,
  handleError,
  removeIdFromArrayOfIds,
} from './controllerUtil.js';

const userSelect = '_id username nickname';
const populateOptionTeam = [
  { path: 'admins', select: userSelect },
  { path: 'members', select: userSelect },
  {
    path: 'todos',
    populate: {
      path: 'responsible',
      select: userSelect,
    },
  },
];

async function getUserTeams(request, response) {
  const userId = request.user._id;
  await Team.find({ $or: [{ admins: userId }, { members: userId }] })
    .populate(populateOptionTeam)
    .exec()
    .then((teams) => {
      response.json(teams);
    });
}

async function createTeam(request, response) {
  const newTeam = request.body;
  await Team.create({
    name: newTeam.name,
    admins: [request.user._id],
    members: [],
    todos: [],
  })
    .then((createdTeam) => createdTeam.populate(populateOptionTeam))
    .then((createdTeam) => {
      response.json(createdTeam);
    })
    .catch((error) => {
      handleError(error, response);
    });
}

async function createMember(request, response) {
  const foundTeam = request.team;
  const memberName = request.body.username;
  await findUserByNameAndCheckThatItExists(memberName)
    .then((foundUser) => {
      foundTeam.members.push(foundUser._id);
      return foundTeam.save();
    })
    .then((updatedTeam) => updatedTeam.populate(populateOptionTeam))
    .then((updatedTeam) => {
      response.json(updatedTeam);
    })
    .catch((error) => {
      handleError(error, response);
    });
}

async function updateAdmins(request, response) {
  const foundTeam = request.team;
  const userToUpdate = request.body;
  await Promise.resolve(foundTeam)
    .then((foundTeam) => {
      const userId = userToUpdate._id;
      // User entfernen
      removeUserFromTeamIfNeeded(foundTeam, userId);
      if (userToUpdate.isAdmin) {
        // User Admins hinzufügen
        foundTeam.admins.push(userId);
      } else {
        // User Members hinzufügen
        foundTeam.members.push(userId);
      }
      return foundTeam.save();
    })
    .then((updatedTeam) => updatedTeam.populate(populateOptionTeam))
    .then((updatedTeam) => {
      response.json(updatedTeam);
    })
    .catch((error) => {
      handleError(error, response);
    });
}

function removeUserFromTeamIfNeeded(team, userId) {
  // User aus Admins entfernen
  removeIdFromArrayOfIds(team.admins, userId);
  // User aus Members entfernen
  removeIdFromArrayOfIds(team.members, userId);
}

async function removeUser(request, response) {
  const foundTeam = request.team;
  const userId = request.params.userId;
  await Promise.resolve(foundTeam)
    .then((foundTeam) => {
      // User entfernen
      removeUserFromTeamIfNeeded(foundTeam, userId);
      return foundTeam.save();
    })
    .then((updatedTeam) => updatedTeam.populate(populateOptionTeam))
    .then((updatedTeam) => {
      response.json(updatedTeam);
    })
    .catch((error) => {
      handleError(error, response);
    });
}

async function removeTeam(request, response) {
  const foundTeam = request.team;
  await foundTeam
    .deleteOne()
    .then(async (deletedTeam) => {
      // Alle Todos von Team löschen
      await Todo.deleteMany({ _id: { $in: deletedTeam.todos } });
      return deletedTeam;
    })
    .then((deletedTeam) => {
      response.json(deletedTeam);
    })
    .catch((error) => {
      handleError(error, response);
    });
}

export {
  getUserTeams,
  createTeam,
  createMember,
  updateAdmins,
  removeUser,
  removeTeam,
};
