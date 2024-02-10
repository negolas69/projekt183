const BASE_URL = '/auth';

const register = (user) => {
  const request = axios.post(`${BASE_URL}/register`, user);
  return request.then((response) => response.data);
};

const getLoggedInUser = () => {
  const request = axios.get(`${BASE_URL}/me`);
  return request.then((response) => response.data);
};

const login = (user) => {
  const request = axios.post(`${BASE_URL}/login`, user);
  return request.then((response) => response.data);
};

const logout = () => {
  const request = axios.post(`${BASE_URL}/logout`);
  return request.then((response) => response.data);
};

export { register, getLoggedInUser, login, logout };
