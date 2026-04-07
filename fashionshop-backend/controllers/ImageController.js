import db from "../models"
import path from "path";
import fs from 'fs'
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

export async function getImages(req, res) {
    const { fileName } = req.params;
    const imagePath = path.join(path.join(__dirname, '../uploads/'), fileName);
    fs.access(imagePath, fs.constants.F_OK, (error) => {
        if (error) {
            return res.status(404).send('Image not found');
        }
        res.sendFile(imagePath)
    })
}