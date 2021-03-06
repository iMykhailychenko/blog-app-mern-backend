import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { newError } from '../../services/helpers';
import config from '../../services/config';

const UserSchema = new mongoose.Schema({
    googleId: { type: String, default: null },
    facebookId: { type: String, default: null },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    nick: { type: String, required: true },
    avatar: { type: String, default: null },
    banner: { type: String, default: null },
    bio: { type: String, default: null },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    feedback: {
        like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        dislike: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    verified: { type: Boolean, default: false },
    email: {
        type: String,
        default: null,
        unique: true,
        validate: {
            validator(email) {
                if (email === null) return; // for facebook users without email

                const { error } = Joi.string()
                    .email()
                    .validate(email);

                if (error) throw newError('Email is not valid', 422);
            },
        },
    },
    password: { type: String, default: null },
    tokens: [
        {
            token: { type: String, required: true },
            expires: { type: Date, required: true },
        },
    ],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    queue: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
});

UserSchema.static('hashPassword', async password => {
    if (!password) return null;
    return await bcrypt.hash(password, config.auth.salt);
});

UserSchema.method('isPasswordValid', async function(password) {
    return await bcrypt.compare(password, this.password);
});

UserSchema.method('createToken', async function(remember = false) {
    const token = await jwt.sign({ id: this._id }, config.auth.accessKey);
    this.tokens = [
        ...(this.tokens || []),
        {
            token,
            expires: new Date().getTime() + (remember ? 7 : 1) * 24 * 60 * 60 * 1000,
        },
    ];
    await this.save();
    return token;
});

UserSchema.pre('save', async function() {
    if (this.isNew) {
        this.password = await this.constructor.hashPassword(this.password);
    }
});

export default mongoose.model('User', UserSchema);
