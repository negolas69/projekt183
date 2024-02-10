function isUserAllowedToChangeTodo(userId, responsibleId, teamAdmins) {
  if (userId === responsibleId) {
    return true;
  }
  return isUserTeamAdmin(userId, teamAdmins);
}

function isUserTeamAdmin(userId, teamAdmins) {
  const teamAdminIds = teamAdmins.map((admin) => admin._id);
  return teamAdminIds.indexOf(userId) !== -1;
}

export { isUserAllowedToChangeTodo, isUserTeamAdmin };
