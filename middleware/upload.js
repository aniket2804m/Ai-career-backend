import multer from 'multer';
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Configure Cloudinary storage for multer

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'listings',
        allowed_formats: ['jpg', 'jpeg', "png", "webp"],
    },
});

const upload = multer({ storage});

export default upload;