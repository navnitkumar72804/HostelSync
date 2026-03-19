import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export async function listUsersController(_req, res) {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json({ users });
}

export async function createWardenController(req, res) {
  const { name, email, password, hostelBlock } = req.body;
  if (!name || !email || !password || !hostelBlock) return res.status(400).json({ message: 'Missing fields' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const warden = await User.create({ name, email, passwordHash, role: 'Warden', hostelBlock });
  res.status(201).json({ user: { id: warden.id, name: warden.name, email: warden.email, role: warden.role, hostelBlock: warden.hostelBlock } });
}

export async function deleteUserController(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  await user.deleteOne();
  res.json({ ok: true });
}


