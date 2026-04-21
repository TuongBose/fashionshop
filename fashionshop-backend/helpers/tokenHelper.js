import jwt from 'jsonwebtoken';
import db from '../models';
require('dotenv').config();

async function getUserFromToken(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Unauthorized'
        })
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.User.findByPk(decoded.id);

    if (!user) {
        throw new Error('User not found');
    }

    if (user.password_changed_at && decoded.iat < new Date(user.password_changed_at).getTime() / 1000) {
        throw new Error('Token is invalid');
    }
    
    return user;
}

export { getUserFromToken }