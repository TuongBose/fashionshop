import { getAvatarUrl } from "../helpers/imageHelper";
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
        data: brands.map(brand => ({
            ...brand.get({ plain: true }),
            image: getAvatarUrl(brand.image)
        })),
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
        data: { ...brand.get({ plain: true }), image: getAvatarUrl(brand.image) }
    });
}

export async function insertBrand(req, res) {
    const brand = await db.Brand.create(req.body);
        res.status(201).json({
            message: 'Insert Brand successfully',
            data: {
                ...brand.get({ plain: true }),
                image: getAvatarUrl(brand.image)
            }
        });
}

export async function updateBrand(req, res) {
    const { id } = req.params;
    const { name } = req.body;
    const existingBrand = await db.Brand.findOne({
        where: {
            name: name,
            id: { [db.Sequelize.Op.ne]: id }
        }
    });
    if (existingBrand) {
        return res.status(400).json({
            message: 'Brand with the same name already exists'
        });
    }

    const updatedBrand = await db.Brand.update(req.body, {
        where: { id }
    });
    if (updatedBrand[0] > 0) {
        res.status(200).json({
            message: 'Update Brand successfully'
        });
    }
    else {
        res.status(404).json({
            message: 'Brand not found'
        })
    }
}

export async function deleteBrand(req, res) {
    const { id } = req.params;
    const deleted = await db.Brand.destroy({
        where: { id }
    });
    if (deleted) {
        return res.status(200).json({
            message: 'Delete Brand successfully'
        });
    }
    else {
        res.status(404).json({
            message: 'Brand not found'
        })
    }
}
