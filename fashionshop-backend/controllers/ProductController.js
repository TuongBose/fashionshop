import { Sequelize } from "sequelize";
import db from "../models"

export async function getProducts(req, res) {
    res.status(200).json({
        message: 'Get Products successfully'
    })
}

export async function getProductById(req, res) {
    res.status(200).json({
        message: 'Get Product detail successfully'
    })
}

export async function insertProduct(req, res) {
    try {
        const product = await db.Product.create(req.body);
        res.status(201).json({
            message: 'Insert Product successfully',
            data: product
        })
    }
    catch (error){
        res.status(500).json({
            message: "Insert Product failed",
            error: error.message
        })
    }
}

export async function deleteProduct(req, res) {
    res.status(200).json({
        message: 'Delete Product successfully'
    })
}

export async function updateProduct(req, res) {
    res.status(200).json({
        message: 'Update Product successfully'
    })
}