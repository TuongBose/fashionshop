import db from "../models"
import { Sequelize, where } from "sequelize";
const { Op } = Sequelize;

export const getCarts = async (req, res) => {
    const { session_id, user_id, page = 1 } = req.query;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;

    let whereClause = {};
    if (session_id) whereClause.session_id = session_id;
    if (user_id) whereClause.user_id = user_id;

    const [carts, totalCarts] = await Promise.all([
        db.Cart.findAll({
            where: whereClause,
            limit: pageSize,
            offset: offset,
            include: [{
                model: db.CartItem,
                as: 'cart_items',
            }],
        }),
        db.Cart.count({
            where: whereClause,
        })
    ]);

    return res.status(200).json({
        message: 'Get Cart successfully',
        data: carts,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalCarts / pageSize),
        totalCarts,
    });
}

export const getCartById = async (req, res) => {
    const { id } = req.params;
    const cart = await db.Cart.findByPk(id, {
        include: [{
            model: db.CartItem,
            as: 'cart_items',
        }],
    });

    if (!cart) {
        return res.status(404).json({
            message: 'Cart not found'
        })
    }
    return res.status(200).json({
        message: 'Get Cart by ID successfully',
        data: cart
    });
}

export const insertCart = async (req, res) => {
    const { session_id, user_id } = req.body;

    if ((!session_id && !user_id) || (session_id && user_id)) {
        return res.status(400).json({
            message: 'Either session_id or user_id must be provided, but not both'
        });
    }

    const existingCart = await db.Cart.findOne({
        where: {
            [Op.or]: [
                { session_id: session_id ? session_id : null },
                { user_id: user_id ? user_id : null }
            ]
        }
    });

    if (existingCart) {
        return res.status(409).json({
            message: 'Cart with this session_id/user_id already exists'
        });
    }

    const cart = await db.Cart.create(req.body)
    return res.status(201).json({
        message: 'Insert Cart successfully',
        data: cart
    });
}

export const deleteCart = async (req, res) => {
    const { id } = req.params;
    const deleted = await db.Cart.destroy({
        where: { id }
    });
    if (deleted) {
        res.status(200).json({
            message: 'Delete Cart successfully'
        });
    } else {
        res.status(404).json({
            message: 'Cart not found'
        });
    }
}

export const updateCart = async (req, res) => {
    const { id } = req.params;
    const updatedCart = await db.Cart.update(req.body, {
        where: { id }
    });

    if (updatedCart[0] > 0) {
        res.status(200).json({
            message: 'Update Cart successfully'
        });
    }
    else {
        res.status(404).json({
            message: 'Cart not found'
        })
    }
}
