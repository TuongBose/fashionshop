import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import db from "../models"

export async function getOrderDetails(req, res) {
    res.status(200).json({
        message: 'Get Order Details successfully'
    });
}

export async function getOrderDetailById(req, res) {
    res.status(200).json({
        message: 'Get Order Detail successfully'
    });
}

export async function insertOrderDetail(req, res) {
    const newOrderDetail = await db.OrderDetail.create(req.body);
    res.status(201).json({
        message: 'Insert Order Detail successfully',
        data:newOrderDetail
    });
}

export async function updateOrderDetail(req, res) {
    res.status(200).json({
        message: 'Update Order Detail successfully'
    });
}

export async function deleteOrderDetail(req, res) {
    res.status(200).json({
        message: 'Delete Order Detail successfully'
    });
}
