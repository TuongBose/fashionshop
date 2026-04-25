import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import db from "../models"
import { OrderStatus } from "../constants";

export async function getOrders(req, res) {
    const {search='', page = 1,status} = req.query;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;
    
    let whereClause = {};
    if(search.trim() !== '') {
        whereClause = {
            [Op.or]: [
                {note: { [Op.like]: `%${search}%` }},
            ]
        }
    }
    if(status) {
        whereClause.status = status;
    }

    const [orders, totalOrders] = await Promise.all([
        db.Order.findAll({
            where: whereClause,
            limit: pageSize,
            offset: offset,
            order: [['created_at', 'DESC']],
        }),
        db.Order.count({
            where: whereClause,
        })
    ]);

    return res.status(200).json({
        message: 'Get Orders successfully',
        data: orders,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalOrders / pageSize),
        total: totalOrders,
    });
}

export async function getOrderById(req, res) {
    const {id} = req.params;
    const order = await db.Order.findByPk(id, {
        include: [{
            model: db.OrderDetail,
            as: 'order_details',
        }]
    });
    if (!order) {
        return res.status(404).json({
            message: 'Order not found'
        });
    }

    return res.status(200).json({ 
        message: 'Get Order detail successfully',
        data: order
    });
}

export async function insertOrder(req, res) {
    const userId = req.body.user_id;
    const existingUser = await db.User.findByPk(userId);
    if (!existingUser) {
        return res.status(404).json({
            message: "User not found"
        })
    }

    const newOrder = await db.Order.create(req.body);
    if (newOrder) {
        res.status(201).json({
            message: 'Insert Order successfully',
            data: newOrder
        });
    } else {
        res.status(400).json({
            message: 'Insert order failed'
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
    const [updated] = await db.Order.update({status:OrderStatus.FAILED}, {
        where: { id }
    });
    if (updated) {
        res.status(200).json({
            message: 'Delete Order successfully'
        });
    } else {
        res.status(404).json({
            message: 'Order not found'
        })
    }
}
