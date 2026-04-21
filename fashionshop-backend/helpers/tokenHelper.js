import jwt from 'jsonwebtoken';
import db from '../models';
require('dotenv').config();

async function getUserFromToken(req,res){
    try{
        const token = req.headers.authorization.split(' ')[1];
        if(!token){
            return res.status(401).json({
                message: 'Unauthorized'
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await db.User.findByPk(decoded.id);
        if(!user){
            return res.status(401).json({
                message: 'Unauthorized'
            })
        }
        return user;
    }catch(error){
        res.status(401).json({
            message: 'Unauthorized'
        })
        return null;
    }
}

export { getUserFromToken }