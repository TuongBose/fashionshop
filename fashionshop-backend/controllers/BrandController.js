import db from "../models"

export async function getBrands(req, res) {
    res.status(200).json({
        message: 'Get Brands successfully'
    });
}

export async function getBrandById(req, res) {
    res.status(200).json({
        message: 'Get Brand detail successfully'
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
