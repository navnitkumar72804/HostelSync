import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import { User } from '../models/User.js';

export function requireAuth(allowedRoles) {
  return async (req, res, next) => {
    try {
      console.log('🔐 Auth middleware - Method:', req.method, 'Path:', req.path);
      console.log('🔐 Auth headers:', { authorization: req.headers.authorization ? 'Present' : 'Missing' });
      
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : null;
      
      if (!token) {
        console.error('❌ No token found in request');
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
      }

      console.log('🔐 Token found, verifying...');
      const payload = jwt.verify(token, JWT_SECRET);
      console.log('🔐 Token payload:', payload);
      
      const user = await User.findById(payload.sub);
      if (!user) {
        console.error('❌ User not found for token');
        return res.status(401).json({ message: 'Unauthorized - User not found' });
      }

      console.log('✅ User authenticated:', { id: user.id, role: user.role, hostelBlock: user.hostelBlock });
      req.user = { id: user.id, role: user.role, hostelBlock: user.hostelBlock };

      // If allowedRoles is provided and not empty, check role
      if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
        console.log('🔐 Checking role:', user.role, 'against allowed:', allowedRoles);
        if (!allowedRoles.includes(user.role)) {
          console.error('❌ Role mismatch:', user.role, 'not in', allowedRoles);
          return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
        }
      }

      console.log('✅ Auth passed, continuing...');
      next();
    } catch (err) {
      console.error('❌ Auth error:', err.message);
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
      }
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Unauthorized - Token expired' });
      }
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(403).json({ message: 'Forbidden' });
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    next();
  };
}


