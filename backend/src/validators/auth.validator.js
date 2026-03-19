export function validateSignup(body) {
  const { name, email, password, role, hostelBlock, room } = body;
  if (!name || !email || !password || !role) {
    return 'name, email, password, role are required';
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'invalid email';
  const roles = ['Student', 'Warden', 'Admin'];
  if (!roles.includes(role)) return 'invalid role';
  if ((role === 'Student' || role === 'Warden') && !hostelBlock) return 'hostelBlock required';
  if (role === 'Student' && !room) return 'room required for Student';
  return null;
}

export function validateLogin(body) {
  const { email, password } = body;
  if (!email || !password) return 'email and password are required';
  return null;
}


