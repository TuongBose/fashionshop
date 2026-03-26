import { Sequelize } from "sequelize";
import db from "../models"

export async function getOrders(req, res) {
    res.status(200).json({
        message: 'Get Orders successfully'
    });
}

export async function getOrderById(req, res) {
    res.status(200).json({
        message: 'Get Order detail successfully'
    });
}

export async function insertOrder(req, res) {
    try {
        const newOrder = await db.Order.create(req.body);
        res.status(201).json({
            message: 'Insert Order successfully',
            data: newOrder
        });
    } catch (error) {
        res.status(500).json({
            message: 'Insert Order failed',
            error: error.message
        })
    }
}

export async function updateOrder(req, res) {
    const { id } = req.params;
    const [updated] = await db.Order.update(req.body, {
        where: { id }
    })
    if (updated) {
        res.status(200).json({
            message: 'Update Order successfully'
        });
    } else {
        res.status(404).json({
            message: 'Order not found'
        });
    }
}

export async function deleteOrder(req, res) {
    const { id } = req.params;
    const deleted = await db.Order.destroy({
        where: { id }
    });
    if (deleted) {
        res.status(200).json({
            message: 'Delete Order successfully'
        });
    } else {
        res.status(404).json({
            message: 'Order not found'
        })
    }
}
