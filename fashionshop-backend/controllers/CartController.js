import db from "../models"
import { Sequelize } from "sequelize";
const { Op } = Sequelize;

export const getCart = async (req, res) => {
    const {session_id,user_id,page=1} = req.query;
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
                as: 'cartItems',
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
            as: 'cartItems',
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
    const cart = await db.Cart.create(req.body)
    res.status(201).json({
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
