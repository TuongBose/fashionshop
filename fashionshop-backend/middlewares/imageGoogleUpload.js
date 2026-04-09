import path from "path";
import multer from "multer";
import config from "../config/firebaseConfig"
import {getStorage} from "firebase/storage"

const storage = getStorage()

const fileFilter = function (req, file, callback) {
    if (file.mimetype.startsWith('image')) {
        callback(null, true)
    } else {
        callback(new Error('Only image files are allowed'), false)
    }
}

const upload = multer({
    storage:multer.memoryStorage(),
    fileFilter,
    limits:{
        fileSize:1024*1024*5 // 5Mb
    }
})

export default upload