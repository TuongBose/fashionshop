import InsertUserRequest from "../dtos/requests/user/InsertUserRequest";
import ResponseUser from "../dtos/responses/user/ResponseUser";
import db from "../models"
import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import argon2 from 'argon2'

export async function insertUser(req, res) {
    const existingUser = await db.User.findOne({
        where: { email: req.body.email }
    })
    if(existingUser){
        return res.status(409).json({
            message:"Email existed"
        })
    }

    const hashedPassword = await argon2.hash(req.body.password);
    const user = await db.User.create({...req.body, password: hashedPassword});
    if (user) {
        return res.status(201).json({
            message: 'Insert user successfully',
            data: new ResponseUser(user)
        })
    } else {
        return res.status(404).json({
            message: 'Insert user failed',
        })
    }
}

export async function updateUser(req, res) {
    const { id } = req.params;
    const [updated] = await db.User.update(req.body, {
        where: { id }
    });

    if (updated) {
        return res.status(200).json({
            message: 'Update user successfully'
        })
    } else {
        return res.status(404).json({
            message: 'User not found'
        })
    }
}