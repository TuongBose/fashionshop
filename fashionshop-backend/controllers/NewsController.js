import { date } from "joi";
import db from "../models"
import { Sequelize } from "sequelize";
const { Op } = Sequelize;

export const getNewsArticle = async (req, res) => {
    const { search = '', page = 1 } = req.query;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;

    let whereClause = {};
    if (search.trim() !== '') {
        whereClause = {
            [Op.or]: [
                { title: { [Op.like]: `%${search}%` } },
                { content: { [Op.like]: `%${search}%` } },
            ]
        };
    }

    const [newsArticle, totalNews] = await Promise.all([
        db.News.findAll({
            where: whereClause,
            limit: pageSize,
            offset: offset
        }),
        db.News.count({
            where: whereClause
        })
    ]);

    return res.status(200).json({
        message: 'Get news successfully',
        data: newsArticle,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalNews / pageSize),
        totalNews
    })
}

export async function getNewsArticleById(req, res) {
    const { id } = req.params;
    const newsArticle = await db.News.findByPk(id);

    if (!newsArticle) {
        return res.status(404).json({
            message: 'News Article not found'
        })
    }

    res.status(200).json({
        message: 'Get news article successfully',
        data: newsArticle
    })
}

export async function insertNewsArticle(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
        const newsArticle = await db.News.create(req.body, { transaction });

        const productIds = req.body.product_ids;
        if (productIds && productIds.length) {
            const validProducts = await db.Product.findAll({
                where: { id: productIds },
                transaction
            });

            const validProductIds = validProducts.map(product => product.id);
            const filteredProductIds = productIds.filter(id => validProductIds.includes(id));

            const newDetailPromises = filteredProductIds.map(product_id =>
                db.NewsDetail.create({
                    product_id: product_id,
                    news_id: newsArticle.id
                }, { transaction })
            )

            await Promise.all(newDetailPromises);
        }

        await transaction.commit();

        res.status(201).json({
            message: 'Create news successfully',
            data: newsArticle
        })
    } catch (error) {
        await transaction.rollback();

        res.status(500).json({
            message: 'Create news failed',
            error: error.message
        })
    }
}

export async function deleteNewsArticle(req, res) {
    const { id } = req.params;
    const deleted = await db.News.destroy({
        where: { id }
    })
    if (deleted) {
        return res.status(200).json({
            message: 'Delete news article successfully'
        })
    } else {
        return res.status(404).json({
            message: 'News Article not found'
        })
    }
}

export async function updateNewsArticle(req, res) {
    const { id } = req.params;
    const updatedNewsArticle = await db.News.update(req.body, {
        where: { id }
    })

    if (updatedNewsArticle) {
        return res.status(200).json({
            message: 'Update news article successfully'
        })
    } else {
        return res.status(404), json({
            message: 'News Article not found'
        })
    }
}