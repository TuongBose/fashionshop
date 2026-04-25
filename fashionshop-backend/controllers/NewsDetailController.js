import db from "../models"
import { Sequelize } from "sequelize";
const { Op } = Sequelize;

export const getNewsDetails = async (req, res) => {
    const { search = '', page = 1 } = req.query;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;

    const [newsDetails, totalNewsDetails] = await Promise.all([
        db.NewsDetail.findAll({
            limit: pageSize,
            offset: offset,
            include: [{ model: db.News }, { model: db.Product }]
        }),
        db.NewsDetail.count()
    ]);

    return res.status(200).json({
        message: 'Get NewsDetails successfully',
        data: newsDetails,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalNewsDetails / pageSize),
        total: totalNewsDetails
    })
}

export async function insertNewsDetail(req, res) {
    const { product_id, news_id } = req.body;
    const existingProduct = await db.Product.findByPk(product_id);
    if (!existingProduct) {
        return res.status(404).json({
            message: 'Product not found'
        })
    }

    const existingNews = await db.News.findByPk(news_id);
    if (!existingNews) {
        return res.status(404).json({
            message: 'News not found'
        })
    }

    const duplicateExists = await db.NewsDetail.findOne({
        where: { news_id, product_id }
    });
    if (duplicateExists) {
        return res.status(409).json({
            message: 'Insert News Detail failed'
        })
    }

    const newsDetail = await db.NewsDetail.create({ product_id, news_id });

    return res.status(201).json({
        message: 'Insert NewsDetail successfully',
        data: newsDetail
    });
}

export async function getNewsDetailById(req, res) {
    const { id } = req.params;

    const newsDetail = await db.NewsDetail.findByPk(id, {
        include: [
            { model: db.News },
            { model: db.Product }
        ]
    });

    if (!newsDetail) {
        return res.status(404).json({
            message: 'NewsDetail not found'
        });
    }

    return res.status(200).json({
        message: 'Get NewsDetail successfully',
        data: newsDetail
    });
}

export async function updateNewsDetail(req, res) {
    const { id } = req.params;
    const { product_id, news_id } = req.body;

    const existingDuplicate = await db.NewsDetail.findOne({
        where: {
            product_id,
            news_id,
            id: { [Sequelize.Op.ne]: id }
        }
    })
    if (existingDuplicate) {
        return res.status(409).json({
            message: "Update news detail failed"
        })
    }

    const updatedNewsDetail = await db.NewsDetail.update({ product_id, news_id }, {
        where: { id }
    });

    if (updatedNewsDetail[0] > 0) {
        return res.status(200).json({
            message: 'Update NewsDetail successfully',
        });
    } else {
        return res.status(404).json({
            message: 'NewsDetail not found'
        });
    }
}

export async function deleteNewsDetail(req, res) {
    const { id } = req.params;

    const deleted = await db.NewsDetail.destroy({
        where: { id }
    });

    if (deleted) {
        return res.status(200).json({
            message: 'Delete NewsDetail successfully'
        });
    }

    return res.status(404).json({
        message: 'NewsDetail not found'
    });
}