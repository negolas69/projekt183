import { model as User } from '../models/user.model.js';
import { model as Team } from '../models/teams.model.js';

function findUserByIdAndCheckThatItExists(userId) {
  return findDocAndCheckThatItExists(
    User.findById(userId),
    `User with id ${userId} does not exist.`
  );
}

function findUserByNameAndCheckThatItExists(username) {
  return findDocAndCheckThatItExists(
    User.findOne({ username: username }),
    `User with username ${username} does not exist.`
  );
}

function findTeamByIdAndCheckThatItExists(teamId) {
  return findDocAndCheckThatItExists(
    Team.findById(teamId),
    `Team with id ${teamId} not found.`
  );
}

function findDocAndCheckThatItExists(query, errorMsg) {
  return query.exec().then((foundDocument) => {
    if (!foundDocument) {
      return Promise.reject({
        message: errorMsg,
        status: 400,
      });
    }
    return foundDocument;
  });
}

function handleError(error, response) {
  const status = error.status;
  if (status) {
    response.status(status);
  } else {
    response.status(500);
  }
  response.json({ message: error.message });
}

function removeIdFromArrayOfIds(ids, idToRemove) {
  const index = ids.findIndex((id) => id.equals(idToRemove));
  if (index >= 0) {
    ids.splice(index, 1);
  }
}

export {
  findUserByIdAndCheckThatItExists,
  findUserByNameAndCheckThatItExists,
  findTeamByIdAndCheckThatItExists,
  handleError,
  removeIdFromArrayOfIds,
};
