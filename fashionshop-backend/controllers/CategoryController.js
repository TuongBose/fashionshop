import db from "../models"

export async function getCategories(req, res) {
    res.status(200).json({
        message: 'Get Categories successfully'
    });
}

export async function getCategoryById(req, res) {
    res.status(200).json({
        message: 'Get Category detail successfully'
    });
}

export async function insertCategory(req, res) {
    try {
        const category = await db.Category.create(req.body)
        res.status(201).json({
            message: 'Insert Category successfully',
            data: category
        });
    } catch (error) {
        res.status(500).json({
            message: "Insert Category failed",
            error: error.message
        })
    }
}

export async function deleteCategory(req, res) {
    res.status(200).json({
        message: 'Delete Category successfully'
    });
}

export async function updateCategory(req, res) {
    res.status(200).json({
        message: 'Update Category successfully'
    });
}
