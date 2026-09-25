// Keep response fields explicit so secrets such as passwordHash are never returned by accident.
export function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    preferences: user.preferences,
    notifications: user.notifications,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}
