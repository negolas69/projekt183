import { model as Todo } from '../models/todo.model.js';
import {
  findTeamByIdAndCheckThatItExists,
  findUserByIdAndCheckThatItExists,
  handleError,
  removeIdFromArrayOfIds,
} from './controllerUtil.js';

const populateOptionTodo = {
  path: 'responsible',
  select: '_id username nickname',
};

async function createTodo(request, response) {
  const newTodo = request.body;
  await Promise.all([
    findUserByIdAndCheckThatItExists(newTodo.responsible),
    findTeamByIdAndCheckThatItExists(newTodo.team),
  ])
    .then(async ([foundUser, foundTeam]) => {
      let savedTodo = await Todo.create({
        description: newTodo.description,
        isDone: newTodo.isDone,
        responsible: newTodo.responsible,
      });
      foundTeam.todos.push(savedTodo._id);
      await foundTeam.save();
      return savedTodo;
    })
    .then((newTodo) => newTodo.populate(populateOptionTodo))
    .then((newTodo) => {
      response.json(newTodo);
    })
    .catch((error) => {
      handleError(error, response);
    });
}

async function updateTodo(request, response) {
  const foundTodo = request.todo;
  const todoToUpdate = request.body;
  await findUserByIdAndCheckThatItExists(todoToUpdate.responsible)
    .then(() => {
      foundTodo.description = todoToUpdate.description;
      foundTodo.isDone = todoToUpdate.isDone;
      foundTodo.responsible = todoToUpdate.responsible;
      return foundTodo.save();
    })
    .then((updatedTodo) => updatedTodo.populate(populateOptionTodo))
    .then((updatedTodo) => {
      response.json(updatedTodo);
    })
    .catch((error) => {
      handleError(error, response);
    });
}

async function removeTodo(request, response) {
  const foundTodo = request.todo;
  const foundTodoId = foundTodo._id;
  const foundTeam = request.team;
  await Promise.resolve(foundTodo)
    .then((foundTodo) => {
      if (!foundTodo.isDone) {
        // Nicht erledigtes Todo darf nicht gelöscht werden
        return Promise.reject({
          message: `TODO with id ${foundTodoId} is not done`,
          status: 400,
        });
      }
      return foundTodo.deleteOne();
    })
    .then((deletedTodo) => {
      // Todo in Team löschen
      removeIdFromArrayOfIds(foundTeam.todos, foundTodoId);
      foundTeam.save();
      return deletedTodo;
    })
    .then((deletedTodo) => {
      response.json(deletedTodo);
    })
    .catch((error) => {
      handleError(error, response);
    });
}

export { createTodo, updateTodo, removeTodo };
