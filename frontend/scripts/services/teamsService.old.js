import { getCounter } from '../utils/elementsUtil.js';

const counterTeamId = getCounter(10);

let teams = [
  {
    _id: '1',
    name: 'Team1',
    todos: [
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
    ],
    admins: [
      {
        _id: '1',
        nickname: 'User1',
        username: 'user1@todos.ch',
      },
    ],
    members: [
      {
        _id: '2',
        nickname: 'User2',
        username: 'user2@todos.ch',
      },
    ],
  },
  {
    _id: '2',
    name: 'Team2',
    todos: [
      {
        _id: '3',
        description: 'Todo3',
        isDone: false,
        responsible: {
          _id: '1',
          nickname: 'User 1',
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
    ],
    admins: [
      {
        _id: '2',
        nickname: 'User2',
        username: 'user2@todos.ch',
      },
    ],
    members: [
      {
        _id: '1',
        nickname: 'User1',
        username: 'user1@todos.ch',
      },
      {
        _id: '3',
        nickname: 'User3',
        username: 'user3@todos.ch',
      },
    ],
  },
];

const getAll = () => {
  return Promise.resolve(teams);
};

const create = (newTeam) => {
  const foundCreator = getUserById(newTeam.creator);
  if (foundCreator) {
    const saved = {
      _id: `${counterTeamId.next()}`,
      name: newTeam.name,
      admins: [foundCreator],
      members: [],
      todos: [],
    };
    teams.push(saved);
    return Promise.resolve(saved);
  }
  return Promise.reject({ message: 'Creator not found' });
};

const createMember = (id, user) => {
  const foundUser = getUserByUsername(user.username);
  if (foundUser) {
    const teamToUpdate = teams.find((team) => team._id === id);
    if (teamToUpdate) {
      teamToUpdate.members.push(foundUser);
      return Promise.resolve(teamToUpdate);
    }
    return Promise.reject({ message: 'Team not found' });
  }
  return Promise.reject({ message: 'User not found' });
};

const updateAdmins = (id, user) => {
  const userId = user._id;
  const foundUser = getUserById(userId);
  if (foundUser) {
    const teamToUpdate = teams.find((team) => team._id === id);
    if (teamToUpdate) {
      if (user.isAdmin) {
        const members = teamToUpdate.members;
        const index = members.findIndex((member) => member._id === userId);
        if (index !== -1) {
          members.splice(index, 1);
        }
        teamToUpdate.admins.push(foundUser);
      } else {
        const admins = teamToUpdate.admins;
        const index = admins.findIndex((admin) => admin._id === userId);
        if (index !== -1) {
          admins.splice(index, 1);
        }
        teamToUpdate.members.push(foundUser);
      }
      return Promise.resolve(teamToUpdate);
    }
    return Promise.reject({ message: 'Team not found' });
  }
  return Promise.reject({ message: 'User not found' });
};

const remove = (id) => {
  const index = teams.findIndex((team) => team._id === id);
  if (index !== -1) {
    const teamToRemove = teams[index];
    teams.splice(index, 1);
    return Promise.resolve(teamToRemove);
  }
  return Promise.reject({ message: 'Team not found' });
};

function removeUser(id, user) {
  const teamToUpdate = teams.find((team) => team._id === id);
  if (teamToUpdate) {
    const userId = user._id;
    const admins = teamToUpdate.admins;
    let index = admins.find((admin) => admin._id === userId);
    if (index !== -1) {
      admins.splice(index, 1);
    }
    const members = teamToUpdate.members;
    index = members.find((member) => {
      member._id === userId;
    });
    if (index !== -1) {
      members.splice(index, 1);
    }
    return Promise.resolve(teamToUpdate);
  }
  return Promise.reject({ message: 'Team not found' });
}

function getUserById(userId) {
  const teamWithUser = teams.find(
    (team) =>
      team.admins.filter((admin) => admin._id === userId).length > 0 ||
      team.members.filter((member) => member._id === userId).length > 0
  );
  if (teamWithUser) {
    return (
      teamWithUser.admins.find((admin) => admin._id === userId) ||
      teamWithUser.members.find((member) => member._id === userId)
    );
  }
  return null;
}

function getUserByUsername(username) {
  const teamWithUser = teams.find(
    (team) =>
      team.admins.filter((admin) => admin.username === username).length > 0 ||
      team.members.filter((member) => member.username === username).length > 0
  );
  if (teamWithUser) {
    return (
      teamWithUser.admins.find((admin) => admin.username === username) ||
      teamWithUser.members.find((member) => member.username === username)
    );
  }
  return null;
}

export { getAll, create, createMember, updateAdmins, remove, removeUser };
