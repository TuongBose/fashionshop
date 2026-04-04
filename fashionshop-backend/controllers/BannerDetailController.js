import db from "../models"
import { Sequelize } from "sequelize";
const { Op } = Sequelize;

export const getBannerDetails = async (req, res) => {
    const { page = 1 } = req.query;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;

    const [bannerDetails, total] = await Promise.all([
        db.BannerDetail.findAll({
            limit: pageSize,
            offset,
            include: [
                { model: db.Banner },
                { model: db.Product }
            ]
        }),
        db.BannerDetail.count()
    ]);

    return res.status(200).json({
        message: 'Get banner details successfully',
        data: bannerDetails,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(total / pageSize),
        total
    });
};

export const getBannerDetailById = async (req, res) => {
    const { id } = req.params;

    const bannerDetail = await db.BannerDetail.findByPk(id, {
        include: [
            { model: db.Banner },
            { model: db.Product }
        ]
    });

    if (!bannerDetail) {
        return res.status(404).json({
            message: 'Banner detail not found'
        });
    }

    return res.status(200).json({
        message: 'Get banner detail successfully',
        data: bannerDetail
    });
};

export const insertBannerDetail = async (req, res) => {
    const { product_id, banner_id } = req.body;

    const productExists = await db.Product.findByPk(product_id);
    if (!productExists) {
        return res.status(404).json({
            message: 'Product not found'
        });
    }

    const bannerExists = await db.Banner.findByPk(banner_id);
    if (!bannerExists) {
        return res.status(404).json({
            message: 'Banner not found'
        });
    }

    const duplicateExists = await db.BannerDetail.findOne({
        where: {
            product_id,
            banner_id
        }
    });
    if (duplicateExists) {
        return res.status(409).json({
            message: 'This product is already associated with the banner'
        });
    }

    const newBannerDetail = await db.BannerDetail.create({
        product_id,
        banner_id
    });
    res.status(201).json({
        message: 'Insert banner detail successfully',
        data: newBannerDetail
    });
};

export const deleteBannerDetail = async (req, res) => {
    const { id } = req.params;

    const deleted = await db.BannerDetail.destroy({
        where: { id }
    });

    if (deleted) {
        return res.status(200).json({
            message: 'Delete banner detail successfully'
        });
    } else {
        return res.status(404).json({
            message: 'Banner detail not found'
        });
    }
};

export const updateBannerDetail = async (req, res) => {
    const { id } = req.params;
    const { product_id, banner_id } = req.body;

    const existingBannerDetail = await db.BannerDetail.findOne({
        where: {
            product_id,
            banner_id,
            id: { [db.Sequelize.Op.ne]: id }
        }
    });
    if (existingBannerDetail) {
        return res.status(409).json({
            message: 'This product is already associated with the banner'
        });
    }

    const [updated] = await db.BannerDetail.update(req.body, {
        where: { id }
    });

    if (updated > 0) {
        return res.status(200).json({
            message: 'Update banner detail successfully'
        });
    } else {
        return res.status(404).json({
            message: 'Banner detail not found'
        });
    }
};