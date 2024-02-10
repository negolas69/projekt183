import { model as Team } from '../models/teams.model.js';
import { model as Todo } from '../models/todo.model.js';

function isAuthenticated(request, response, next) {
  if (!request.isAuthenticated()) {
    return response.status(401).json({ message: 'Not authenticated' });
  }
  next();
}

async function isAllowedToChangeTeam(request, response, next) {
  const userId = request.user._id;
  const teamId = request.params.id;
  const foundTeam = await Team.findById(teamId);
  if (!foundTeam) {
    return response
      .status(400)
      .json({ message: `Team with id ${teamId} does not exist.` });
  }
  if (!isUserTeamAdmin(userId, foundTeam)) {
    return response.status(401).json({ message: 'Not allowed to change team' });
  }
  // Aus Performance Gründen: In DB geladenes Document Request anhängen,
  // damit dies im Controller nicht nochamls gemacht werden muss
  request.team = foundTeam;
  next();
}

async function isAllowedToChangeTodo(request, response, next) {
  const user = request.user._id;
  const todoId = request.params.id;
  const [foundTodo, foundTeam] = await Promise.all([
    Todo.findById(todoId).exec(),
    Team.findOne({ todos: todoId }).exec(),
  ]);
  if (!foundTodo) {
    return response
      .status(400)
      .json({ message: `Todo with id ${todoId} does not exist.` });
  }
  if (!foundTeam) {
    return response.status(400).json({
      message: `Team that contains todo with id ${todoId} does not exist.`,
    });
  }
  if (!isUserAllowedToChangeTodo(user._id, foundTodo.responsible, foundTeam)) {
    return response.status(401).json({ message: 'Not allowed to change todo' });
  }
  // Aus Performance Gründen: In DB geladene Documents Request anhängen,
  // damit dies im Controller nicht nochamls gemacht werden muss
  request.todo = foundTodo;
  request.team = foundTeam;
  next();
}

function isUserAllowedToChangeTodo(userId, responsibleId, team) {
  if (userId.equals(responsibleId)) {
    return true;
  }
  return isUserTeamAdmin(userId, team);
}

function isUserTeamAdmin(userId, team) {
  const foundAdmin = team.admins.find((adminId) => adminId.equals(userId));
  return !!foundAdmin;
}

export { isAuthenticated, isAllowedToChangeTeam, isAllowedToChangeTodo };
