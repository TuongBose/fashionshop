import db from "../models"
import path from "path";
import { Sequelize } from "sequelize";
const { Op } = Sequelize;

export async function uploadImages(req, res) {
    if (req.files.length === 0) {
        throw new Error('No files uploaded')
    }

    const uploadedImagesPaths = req.files.map(file => path.basename(file.path));
    res.status(201).json({
        message: 'Images uploaded successfully',
        data: uploadedImagesPaths
    })
}