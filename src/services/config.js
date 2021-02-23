import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    back: process.env.NODE_ENV === 'dev' ? 'http://localhost:5000' : 'https://ihor-blog.herokuapp.com',
    front: process.env.NODE_ENV === 'dev' ? 'http://localhost:5050' : 'https://blog-eta-teal.vercel.app',
    google: {
        client: {
            id: process.env.GOOGLE_CLIENT_ID,
            secret: process.env.GOOGLE_CLIENT_SECRET,
        },
        url: 'https://oauth2.googleapis.com/token',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    },
    facebook: {
        client: {
            id: process.env.FACEBOOK_CLIENT_ID,
            secret: process.env.FACEBOOK_CLIENT_SECRET,
        },
        scope: ['email', 'public_profile'],
    },
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
