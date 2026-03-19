import db from "../models"
import { Sequelize } from "sequelize";
const { Op } = Sequelize;

export async function getBrands(req, res) {
    const { search = '', page = 1 } = req.query;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;

    let whereClause = {};
    if (search.trim() !== '') {
        whereClause = {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
            ]
        };
    }

    const [brands, totalBrands] = await Promise.all([
        db.Category.findAll({
            where: whereClause,
            limit: pageSize,
            offset: offset,
        }),
        db.Category.count({
            where: whereClause,
        })
    ]);
    return res.status(200).json({
        message: 'Get Brands successfully',
        data: brands,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalBrands / pageSize),
        totalBrands,
    });
}

export async function getBrandById(req, res) {
    const { id } = req.params;
    const brand = await db.Brand.findByPk(id);

    if (!brand) {
        return res.status(404).json({
            message: 'Not found'
        })
    }

    res.status(200).json({
        message: 'Get Brand detail successfully',
        data: brand
    });
}

export async function insertBrand(req, res) {
    try {
        const brand = await db.Brand.create(req.body);
        res.status(201).json({
            message: 'Insert Brand successfully',
            data: brand
        });
    } catch (error) {
        res.status(500).json({
            message: "Insert Brand failed",
            error: error.message
        })
    }
}

export async function updateBrand(req, res) {
    res.status(200).json({
        message: 'Update Brand successfully'
    });
}

export async function deleteBrand(req, res) {
    res.status(200).json({
        message: 'Delete Brand successfully'
    });
}
