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

export const getCartItemByCartId = async (req, res) => {
    const { cart_id } = req.params;
    const cartItems = await db.CartItem.findAll({
        where: { cart_id }
    });

    // if (!cartItems || cartItems.length === 0) {
    //     return res.status(404).json({
    //         message: 'Cart Items not found for this Cart ID'
    //     })
    // }
    return res.status(200).json({
        message: 'Get Cart Items by Cart ID successfully',
        data: cartItems
    });
}

export const insertCartItem = async (req, res) => {
    const { cart_id, product_id, quantity } = req.body;
    const existingProduct = await db.Product.findByPk(product_id);
    if (!existingProduct) {
        return res.status(404).json({
            message: 'Product not found'
        });
    }
    if(existingProduct.quantity < quantity) {
        return res.status(400).json({
            message: 'Not enough product quantity available'
        });
    }

    const existingCart = await db.Cart.findByPk(cart_id);
    if (!existingCart) {
        return res.status(404).json({
            message: 'Cart not found'
        });
    }

    const existingCartItem = await db.CartItem.findOne({
        where: {
            cart_id,
            product_id
        }
    });

    if (existingCartItem) {
        if (quantity === 0) {
            await existingCartItem.destroy();
            return res.status(200).json({
                message: 'Cart Item deleted successfully'
            });
        } else {
            existingCartItem.quantity = quantity;
            await existingCartItem.save();
            return res.status(200).json({
                message: 'Cart Item updated successfully',
                data: existingCartItem
            });
        }
    } else {
        if (quantity > 0) {
            const cartItem = await db.CartItem.create(req.body)
            return res.status(201).json({
                message: 'Insert Cart Item successfully',
                data: cartItem
            });
        }

        // const cartItem = await db.CartItem.create(req.body)
        // res.status(201).json({
        //     message: 'Insert Cart Item successfully',
        //     data: cartItem
        // });
    }
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