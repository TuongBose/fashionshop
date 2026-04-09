import db from "../models"
import path from "path";
import fs from 'fs'
import { Sequelize } from "sequelize";
import { getStorage, uploadBytesResumable, getDownloadURL, ref } from "firebase/storage";
const { Op } = Sequelize;

export async function uploadImages(req, res) {
    if (req.files.length === 0) {
        throw new Error('No files uploaded')
    }

    const uploadedImagesPaths = req.files.map(file => path.basename(file.path));
    res.status(201).json({
        message: 'Images uploaded successfully',
        files: uploadedImagesPaths
    })
}

export async function uploadImageToGoogleStorage(req, res) {
    if (!req.file) {
        throw new Error('No files uploaded')
    }

    const storage = getStorage();
    const newFileName = `${Date.now()}-${req.file.originalname}`
    const storageRef = ref(storage, `images/${newFileName}`)
    const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, {
        contentType: req.file.mimetype
    })

    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log('File successfully uploaded to Firebase Storage. Download URL:', downloadURL);
    res.status(201).json({
        message: 'Image uploaded successfully to Firebase Storage',
        file: downloadURL
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