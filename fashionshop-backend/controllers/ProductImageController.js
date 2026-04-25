import { getAvatarUrl } from "../helpers/imageHelper";
import db from "../models"
import { Sequelize } from "sequelize";
const { Op } = Sequelize;

export async function getProductImages(req, res) {
    const { product_id } = req.query;
    const page = parseInt(req.query.page) || 1;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;

    let whereClause = {};
    if (product_id) {
        whereClause.product_id = product_id;
    }

    const [productImages, totalProductImages] = await Promise.all([
        db.ProductImage.findAll({
            where: whereClause,
            limit: pageSize,
            offset: offset,
            // include: [{ model: db.Product, as: 'Product' }]
        }),
        db.ProductImage.count({
            where: whereClause
        })
    ]);

    return res.status(200).json({
        message: 'Get product images successfully',
        data: productImages.map(productImage => ({
            ...productImage.get({ plain: true }),
            image_url: getAvatarUrl(productImage.image_url)
        })),
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalProductImages / pageSize),
        totalProductImages
    });
}

export async function getProductImageById(req, res) {
    const { id } = req.params;
    const productImage = await db.ProductImage.findByPk(id);

    if (!productImage) {
        return res.status(404).json({
            message: 'Product image not found'
        });
    }

    return res.status(200).json({
        message: 'Get product image successfully',
        data: {
            ...productImage.get({ plain: true }),
            image_url: getAvatarUrl(productImage.image_url)
        }
    });
}

export async function insertProductImage(req, res) {
    const { product_id, image_url } = req.body;
    const product = await db.Product.findByPk(product_id);
    if (!product) {
        return res.status(404).json({
            message: 'Product not found'
        });
    }

    const existingImage = await db.ProductImage.findOne({
        where: {
            product_id: product_id,
            image_url: image_url
        }
    });

    if (existingImage) {
        return res.status(409).json({
            message: 'Product image already exists'
        });
    }

    const productImage = await db.ProductImage.create(req.body);
    return res.status(201).json({
        message: 'Product image created successfully',
        data: productImage
    });
}

export const deleteProductImage = async (req, res) => {
    const { id } = req.params;
    const deleted = await db.ProductImage.destroy({
        where: { id }
    });

    if (!deleted) {
        return res.status(404).json({
            message: 'Product image not found'
        });
    }

    return res.status(200).json({
        message: 'Product image deleted successfully'
    });
}

export async function updateProductImage(req, res) {
    const { id } = req.params;
    const updatedProductImage = await db.ProductImage.update(req.body, {
        where: { id }
    });

    if (updatedProductImage[0] > 0) {
        return res.status(200).json({
            message: 'Product image updated successfully',
        });
    } else {
        return res.status(404).json({
            message: 'Product image not found'
        });
    }
}