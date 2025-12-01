const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'secret';

module.exports = async function authMiddleware(req, res, next) {
  // Allow unauthenticated access to auth routes (signup/signin/reset)
  if (req.path.startsWith('/api/auth')) return next();

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      '-password -resetCode -resetCodeExpiry'
    );
    if (!user) {
      return res.status(401).json({ error: 'Invalid token user' });
    }
    req.user = user;          // <- this is what requireAdmin uses
    next();
  } catch (err) {
    console.error('authMiddleware error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
