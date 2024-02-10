const BASE_URL = '/api/teams';

const getAll = () => {
  const request = axios.get(BASE_URL);
  return request.then((response) => response.data);
};

const create = (newTeam) => {
  const request = axios.post(BASE_URL, newTeam);
  return request.then((response) => response.data);
};

const createMember = (id, user) => {
  const request = axios.post(`${BASE_URL}/${id}/members`, user);
  return request.then((response) => response.data);
};

const updateAdmins = (id, user) => {
  const request = axios.patch(`${BASE_URL}/${id}/admins`, user);
  return request.then((response) => response.data);
};

const remove = (id) => {
  const request = axios.delete(`${BASE_URL}/${id}`);
  return request.then((response) => response.data);
};

function removeUser(teamId, userId) {
  const request = axios.delete(`${BASE_URL}/${teamId}/users/${userId}`);
  return request.then((response) => response.data);
}

export { getAll, create, createMember, updateAdmins, remove, removeUser };
