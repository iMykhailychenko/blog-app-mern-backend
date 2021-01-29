import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const config = {
    port: process.env.PORT || 7000,
    db: {
        url: process.env.DB_URL,
    },
    auth: {
        accessKey: process.env.ACCESS_KEY,
        salt: +process.env.SALT,
    },
    uploads: multer({
        storage: multer.diskStorage({
            destination(req, file, cb) {
                cb(null, 'uploads/');
            },
            filename(req, file, cb) {
                cb(null, `IMG_${Date.now()}_${file.originalname}`);
            },
        }),
    }),
};

export default config;
