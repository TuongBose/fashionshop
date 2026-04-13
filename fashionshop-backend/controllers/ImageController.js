import db from "../models"
import path from "path";
import fs from 'fs'
import { Sequelize } from "sequelize";
import { getStorage, uploadBytesResumable, getDownloadURL, ref, deleteObject } from "firebase/storage";
import config from "../config/firebaseConfig"
const { Op } = Sequelize;
const storage = getStorage();

export async function uploadImages(req, res) {
    if (req.files.length === 0) {
        throw new Error('No files uploaded')
    }

    const uploadedImagesPaths = req.files.map(file => path.basename(file.path).trim());
    res.status(201).json({
        message: 'Images uploaded successfully',
        files: uploadedImagesPaths
    })
}

export async function uploadImageToGoogleStorage(req, res) {
    if (!req.file) {
        throw new Error('No files uploaded')
    }


    const newFileName = `${Date.now()}-${req.file.originalname}`
    const storageRef = ref(storage, `images/${newFileName}`)
    const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, {
        contentType: req.file.mimetype
    })

    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log('File successfully uploaded to Firebase Storage. Download URL:', downloadURL);
    res.status(201).json({
        message: 'Image uploaded successfully to Firebase Storage',
        file: downloadURL.trim()
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

async function checkImageInUse(imageUrl) {
    const modelFields = {
        User: 'avatar',
        Category: 'image',
        Brand: 'image',
        Product: 'image',
        News: 'image',
        Banner: 'image'
    }

    const models = [db.User, db.Category, db.Brand, db.Product, db.News, db.Banner];
    for (let model of models) {
        const fieldName = modelFields[model.name];

        let query = {};
        query[fieldName] = imageUrl;
        const result = await model.findOne({
            where: query
        });
        if (result) {
            console.log(
                `Image is in use in ${model.name}, 
                Field: ${fieldName},
                Image URL: ${imageUrl}`);
            return true;
        }
    }
    return false;
}

export async function deleteImage(req, res) {
    const { url: rawUrl } = req.body;
    const url = rawUrl.trim();

    try {
        const isInUser = await checkImageInUse(url);
        if (isInUser) {
            return res.status(500).json({
                message: 'Image is in use and cannot be deleted'
            })
        }

        if (url.includes('https://firebasestorage.googleapis.com/')) {

            const fileRef = ref(storage, url);

            await deleteObject(fileRef);
            return res.status(200).json({
                message: 'Delete image successfully'
            })
        } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
            const filePath = path.join(__dirname, '../uploads/', path.basename(url))
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            return res.status(200).json({
                message: 'Delete image successfully'
            })
        } else {
            return res.status(400).json({
                message: 'URL is invalid'
            })
        }
    }
    catch (error) {
        return res.status(500).json({
            message: 'Delete image failed',
            error: error.message
        })
    }
}