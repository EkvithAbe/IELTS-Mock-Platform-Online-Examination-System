import jwt from 'jsonwebtoken';

// Verify JWT token
export function verifyToken(token) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

// Middleware to protect API routes
export function requireAuth(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      // Attach user info to request
      req.user = decoded;

      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
  };
}

// Middleware to check if user is admin
export function requireAdmin(handler) {
  return requireAuth(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    return handler(req, res);
  });
}

// Client-side: Check if user is logged in
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded = verifyToken(token);
    return decoded !== null;
  } catch {
    return false;
  }
}

// Client-side: Get current user
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
}

// Client-side: Logout
export function logout() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('rememberMe');
}
