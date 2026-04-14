import db from "../models"
import { Sequelize } from "sequelize";
const { Op } = Sequelize;

export const getCartItems = async (req, res) => {
    const { cart_id, page = 1 } = req.query;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;

    let whereClause = {};
    if (cart_id) whereClause.cart_id = cart_id;

    const [cartItems, totalCartItems] = await Promise.all([
        db.CartItem.findAll({
            where: whereClause,
            limit: pageSize,
            offset: offset,
        }),
        db.CartItem.count({
            where: whereClause,
        })
    ]);

    return res.status(200).json({
        message: 'Get Cart Items successfully',
        data: cartItems,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalCartItems / pageSize),
        totalCartItems,
    });
}

export const getCartItemById = async (req, res) => {
    const { id } = req.params;
    const cartItem = await db.CartItem.findByPk(id);

    if (!cartItem) {
        return res.status(404).json({
            message: 'Cart Item not found'
        })
    }
    return res.status(200).json({
        message: 'Get Cart Item by ID successfully',
        data: cartItem
    });
}

export const insertCartItem = async (req, res) => {
    const cartItem = await db.CartItem.create(req.body)
    res.status(201).json({
        message: 'Insert Cart Item successfully',
        data: cartItem
    });
}

export const deleteCartItem = async (req, res) => {
    const { id } = req.params;
    const cartItem = await db.CartItem.findByPk(id);
    if (!cartItem) {
        return res.status(404).json({
            message: 'Cart Item not found'
        })
    }
    const deleted = await db.CartItem.destroy({
        where: { id }
    });
    if (deleted) {
        return res.status(200).json({
            message: 'Delete Cart Item successfully'
        })
    } else {
        return res.status(404).json({
            message: 'Cart Item not found'
        })
    }
}

export const updateCartItem = async (req, res) => {
    const { id } = req.params;
    const cartItem = await db.CartItem.findByPk(id);
    if (!cartItem) {
        return res.status(404).json({
            message: 'Cart Item not found'
        })
    }
    const updated = await db.CartItem.update(req.body, {
        where: { id }
    });
    if (updated) {
        const updatedCartItem = await db.CartItem.findByPk(id);
        return res.status(200).json({
            message: 'Update Cart Item successfully',
            data: updatedCartItem
        })
    } else {
        return res.status(404).json({
            message: 'Cart Item not found'
        })
    }
}