import db from "../models"
import { Sequelize } from "sequelize";
const { Op } = Sequelize;

export async function getCategories(req, res) {
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

    const [categories, totalCategories] = await Promise.all([
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
        message: 'Get Categories successfully',
        data: categories,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalCategories / pageSize),
        totalCategories,
    });
}

export async function getCategoryById(req, res) {
    const { id } = req.params;
    const category = await db.Category.findByPk(id);

    if (!category) {
        return res.status(404).json({
            message: 'Not found'
        })
    }

    res.status(200).json({
        message: 'Get Category detail successfully',
        data: category
    });
}

export async function insertCategory(req, res) {
    const category = await db.Category.create(req.body)
    res.status(201).json({
        message: 'Insert Category successfully',
        data: category
    });
}

export async function deleteCategory(req, res) {
    const { id } = req.params;
    const deleted = await db.Category.destroy({
        where: { id }
    });
    if (deleted) {
        return res.status(200).json({
            message: 'Delete Category successfully'
        });
    }
    else {
        res.status(404).json({
            message: 'Category not found'
        })
    }
}

export async function updateCategory(req, res) {
    const { id } = req.params;
    const updatedCategory = await db.Category.update(req.body, {
        where: { id }
    });
    if (updatedCategory[0] > 0) {
        res.status(200).json({
            message: 'Update Category successfully'
        });
    }
    else {
        res.status(404).json({
            message: 'Category not found'
        })
    }
}
