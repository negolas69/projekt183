import { getCounter } from '../utils/elementsUtil.js';

const counterTodoId = getCounter(10);

let todos = [
  {
    _id: '1',
    description: 'Todo1',
    isDone: true,
    responsible: {
      _id: '1',
      nickname: 'User1',
      username: 'user1@todos.ch',
    },
  },
  {
    _id: '2',
    description: 'Todo2',
    isDone: false,
    responsible: {
      _id: '2',
      nickname: 'User2',
      username: 'user2@todos.ch',
    },
  },
  {
    _id: '3',
    description: 'Todo3',
    isDone: false,
    responsible: {
      _id: '1',
      nickname: 'User1',
      username: 'user1@todos.ch',
    },
  },
  {
    _id: '4',
    description: 'Todo4',
    isDone: false,
    responsible: {
      _id: '2',
      nickname: 'User2',
      username: 'user2@todos.ch',
    },
  },
  {
    _id: '5',
    description: 'Todo5',
    isDone: true,
    responsible: {
      _id: '3',
      nickname: 'User3',
      username: 'user3@todos.ch',
    },
  },
];

const create = (todoToCreate) => {
  const saved = {
    _id: `${counterTodoId.next()}`,
    description: todoToCreate.description,
    isDone: todoToCreate.isDone,
    responsible: todoToCreate.responsible,
  };
  todos.push(saved);
  return Promise.resolve(saved);
};

const update = (id, todoToUpdate) => {
  const foundTodos = todos.filter((todo) => todo._id === id);
  if (foundTodos && foundTodos.length === 1) {
    const foundTodo = foundTodos[0];
    foundTodo.isDone = todoToUpdate.isDone;
    return Promise.resolve(foundTodo);
  }
  return Promise.reject({ message: 'Todo not found' });
};

const remove = (id) => {
  const index = todos.findIndex((todo) => todo._id === id);
  if (index !== -1) {
    const todoToRemove = todos[index];
    todos.splice(index, 1);
    return Promise.resolve(todoToRemove);
  }
  return Promise.reject({ message: 'Todo not found' });
};

export { create, update, remove };
