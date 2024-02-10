function getTeamUsers(team) {
  return team.admins.concat(team.members);
}

function getTeamUserByUsername(team, username) {
  const users = getTeamUsers(team);
  return users.find((user) => user.username === username);
}

export { getTeamUsers, getTeamUserByUsername };
