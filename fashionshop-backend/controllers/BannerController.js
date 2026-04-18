import { BannerStatus } from "../constants";
import db from "../models"
import { Sequelize } from "sequelize";
const { Op } = Sequelize;

export const getBanners = async (req, res) => {
    const { search = '', page = 1 } = req.query;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;

    let whereClause = {};
    if (search.trim() !== '') {
        whereClause = {
            name: { [Op.iLike]: `%${search}%` }
        };
    }

    const [banners, totalBanners] = await Promise.all([
        db.Banner.findAll({
            where: whereClause,
            limit: pageSize,
            offset: offset,
        }),
        db.Banner.count({
            where: whereClause
        })
    ]);

    return res.status(200).json({
        message: 'Get banners successfully',
        data: banners,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalBanners / pageSize),
        totalBanners
    });
};

export const getBannerById = async (req, res) => {
    const { id } = req.params;

    const banner = await db.Banner.findByPk(id, {
        include: [{ model: db.BannerDetail }]
    });

    if (!banner) {
        return res.status(404).json({
            message: 'Banner not found'
        });
    }

    return res.status(200).json({
        message: 'Get banner successfully',
        data: banner
    });
};

export const insertBanner = async (req, res) => {
    const { name } = req.body;

    const existingBanner = await db.Banner.findOne({
        where: {
            name: name.trim()
        }
    });
    if (existingBanner) {
        return res.status(409).json({
            message: 'Banner with the same name already exists'
        });
    }

    const bannerData = {
        ...req.body,
        status:BannerStatus.ACTIVE
    }

    const banner = await db.Banner.create(bannerData);
    return res.status(201).json({
        message: 'Insert banner successfully',
        data: banner
    });
};

export const deleteBanner = async (req, res) => {
    const { id } = req.params;
    const transaction = await db.sequelize.transaction();

    try {
        await db.BannerDetail.destroy({
            where: { banner_id: id },
            transaction
        });

        const deleted = await db.Banner.destroy({
            where: { id },
            transaction
        });

        if (deleted) {
            await transaction.commit();
            return res.status(200).json({
                message: 'Delete banner successfully'
            });
        } else {
            await transaction.rollback();
            return res.status(404).json({
                message: 'Image does not exist'
            });
        }

    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({
            message: 'Delete banner failed',
            error: error.message
        });
    }
};

export const updateBanner = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const existingBanner = await db.Banner.findOne({
        where: {
            name: name,
            id: { [Sequelize.Op.ne]: id }
        }
    })
    if (existingBanner) {
        return res.status(400).json({
            message: 'Banner with the same name already exists'
        })
    }

    const updated = await db.Banner.update(req.body, {
        where: { id }
    });
    return res.status(200).json({
        message: 'Update banner successfully'
    });
};