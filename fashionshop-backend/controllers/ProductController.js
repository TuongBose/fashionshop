import { Sequelize } from "sequelize";
import db from "../models"
import InsertProductRequest from "../dtos/requests/insertproductrequest";

export async function getProducts(req, res) {
    const products = await db.Product.findAll();
    res.status(200).json({
        message: 'Get Products successfully',
        data:products
    })
}

export async function getProductById(req, res) {
    const productId = req.params.id; // Cách 1: Lấy tham số id truyền vào từ params
    const { id } = req.params;       // Cách 2: tìm trong params có trường id thì lấy giá trị của nó 
    const product = await db.Product.findByPk(id);
    if(!product){
        // If not found product, return a 404 Not Found response
        return res.status(400).json({
            message:'Product does not exists'
        })
    }
    res.status(200).json({
        message: 'Get Product detail successfully',
        data:product
    })
}

export async function insertProduct(req, res) {
    // const { error } = InsertProductRequest.validate(req.body) // destructuring an object
    // if (error) {
    //     return res.status(400).json({
    //         message: 'Insert Product failed',
    //         // errors: error.details
    //         error: error.details[0]?.message
    //     });
    // }

    const product = await db.Product.create(req.body);
    return res.status(201).json({
        message: 'Insert Product successfully',
        data: product
    })
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