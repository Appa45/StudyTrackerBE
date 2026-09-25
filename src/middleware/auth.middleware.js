import { User } from '../models/User.js';
import { verifyAuthToken } from '../utils/jwt.js';

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.studytrack_token;

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.userId);

    if (!user) {
      return res.status(401).json({ success: false, error: 'User account no longer exists.' });
    }

    req.user = user;
    req.userId = user._id;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session.' });
  }
}
