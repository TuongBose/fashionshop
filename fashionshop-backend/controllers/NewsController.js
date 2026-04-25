import { date } from "joi";
import db from "../models"
import { Sequelize } from "sequelize";
import { getAvatarUrl } from "../helpers/imageHelper";
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
        data: newsArticle.map(news => ({
            ...news.get({ plain: true }),
            image: getAvatarUrl(news.image)
        })),
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalNews / pageSize),
        total: totalNews
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
        data: {
            ...newsArticle.get({ plain: true }),
            image: getAvatarUrl(newsArticle.image)
        }
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
    const transaction = await db.sequelize.transaction();

    try {
        await db.NewsDetail.destroy({
            where: { news_id: id },
            transaction: transaction
        })

        const deleted = await db.News.destroy({
            where: { id },
            transaction: transaction
        })
        if (deleted) {
            await transaction.commit();
            return res.status(200).json({
                message: 'Delete news article successfully'
            })
        } else {
            await transaction.rollback();
            return res.status(404).json({
                message: 'News Article not found'
            })
        }
    } catch (error) {
        await transaction.rollback();
        return res.stauts(500).json({
            message: 'Delete news failed',
            error: error.message
        })
    }
}

export async function updateNewsArticle(req, res) {
    const { id } = req.params;
    const {title} = req.body;
    const existingNewsArticle = await db.News.findOne({
        where: {
            title: title,
            id: { [db.Sequelize.Op.ne]: id }
        }
    });
    if (existingNewsArticle) {
        return res.status(400).json({
            message: 'News Article with the same title already exists'
        })
    }
    
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