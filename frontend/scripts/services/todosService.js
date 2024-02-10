const BASE_URL = '/api/todos';

const create = (newTodo) => {
  const request = axios.post(BASE_URL, newTodo);
  return request.then((response) => response.data);
};

const update = (id, todoToUpdate) => {
  const request = axios.put(`${BASE_URL}/${id}`, todoToUpdate);
  return request.then((response) => response.data);
};

const remove = (id) => {
  const request = axios.delete(`${BASE_URL}/${id}`);
  return request.then((response) => response.data);
};

export { create, update, remove };
