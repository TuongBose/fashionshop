import InsertUserRequest from "../dtos/requests/user/InsertUserRequest";
import ResponseUser from "../dtos/responses/user/ResponseUser";
import db from "../models"
import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import argon2 from 'argon2'
import { UserRole } from "../constants";
import jwt from 'jsonwebtoken';
require('dotenv').config();
import { getAvatarUrl } from "../helpers/imageHelper";

export async function registerUser(req, res) {
    const { email, phone, password } = req.body;
    if (!email && !phone) {
        return res.status(400).json({
            message: "Email or phone is required"
        })
    }

    const condition = {};
    if (email) {
        condition.email = email;
    }
    if (phone) {
        condition.phone = phone;
    }

    const existingUser = await db.User.findOne({
        where: condition
    })
    if (existingUser) {
        return res.status(409).json({
            message: "Email or phone already exists"
        })
    }

    const hashedPassword = password ? await argon2.hash(password) : null;
    const user = await db.User.create({
        ...req.body,
        email,
        phone,
        password: hashedPassword,
        role: UserRole.USER,
    });
    if (user) {
        return res.status(201).json({
            message: 'Register user successfully',
            data: new ResponseUser(user)
        })
    } else {
        return res.status(404).json({
            message: 'Register user failed',
        })
    }
}

export async function loginUser(req, res) {
    const { email, phone, password } = req.body;
    if (!email && !phone) {
        return res.status(400).json({
            message: "Email or phone is required"
        })
    }

    const condition = {};
    if (email) {
        condition.email = email;
    }
    if (phone) {
        condition.phone = phone;
    }

    const user = await db.User.findOne({
        where: condition
    });
    if (!user) {
        return res.status(404).json({
            message: 'Username or password is incorrect',
        })
    }

    if (user.is_active === false) {
        return res.status(403).json({
            message: 'Account is deactivated'
        })
    }

    const passwordValid = password && await argon2.verify(user.password, password);
    if (!passwordValid) {
        return res.status(401).json({
            message: 'Username or password is incorrect',
        })
    }

    const token = jwt.sign(
        {
            id: user.id,
            // role: user.role 
            iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRATION
        }
    );

    return res.status(200).json({
        message: 'Login successfully',
        data: {
            user: new ResponseUser(user),
            token
        }
    })
}

export async function updateUser(req, res) {
    const { id } = req.params;
    const { name, avatar, old_password, new_password } = req.body;

    if (req.user.id != id) {
        return res.status(403).json({
            message: 'Forbidden'
        })
    }

    const user = await db.User.findByPk(id);
    if (!user) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    if (old_password && new_password) {
        const passwordValid = await argon2.verify(user.password, old_password);
        if (!passwordValid) {
            return res.status(401).json({
                message: 'Old password is incorrect'
            })
        }

        user.password = await argon2.hash(new_password);
        user.password_changed_at = new Date();
    } else if (new_password || old_password) {
        return res.status(400).json({
            message: 'Both old_password and new_password are required to change password'
        })
    }

    user.name = name || user.name;
    user.avatar = avatar || user.avatar;
    user.avatar = getAvatarUrl(user.avatar);
    
    await user.save();
    return res.status(200).json({
        message: 'Update user successfully'
    })
}