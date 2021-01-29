import fs from 'fs';
import path from 'path';

import Joi from 'joi';
import { errorWrapper, newError } from '../../services/helpers';
import UserModel from '../users/users.model';

export const updateAvatar = errorWrapper(async (req, res) => {
    if (req.user.avatar) {
        fs.unlink(path.join(process.cwd(), 'uploads', req.user.avatar), err => {
            if (err) newError('Error with comment attachment', 500);
        });
    }

    const user = await UserModel.findOne(req.user._id);
    user.avatar = (req.file && req.file.filename) || null;
    await user.save();
    res.status(201).send(user.avatar);
});

export const updateBanner = errorWrapper(async (req, res) => {
    if (req.user.banner) {
        fs.unlink(path.join(process.cwd(), 'uploads', req.user.banner), err => {
            if (err) newError('Error with comment attachment', 500);
        });
    }

    const user = await UserModel.findOne(req.user._id);
    user.banner = (req.file && req.file.filename) || null;
    await user.save();
    res.status(201).send(user.banner);
});

export const updateUser = errorWrapper(async (req, res) => {
    const { name, surname, email } = req.body;
    const user = await UserModel.findOne(req.user._id);

    if (name === user.name && surname === user.surname && email === user.surname) {
        res.status(201).json({ name, surname, email });
        return;
    }

    if (name) {
        const { error } = Joi.string()
            .min(2)
            .max(30)
            .validate(name);
        if (error) throw newError('Name is not valid', 422);
        user.name = name;
    }

    if (surname) {
        const { error } = Joi.string()
            .min(2)
            .max(30)
            .validate(surname);
        if (error) throw newError('Surname is not valid', 422);
        user.surname = surname;
    }

    if (email) {
        const { error } = Joi.string()
            .email()
            .validate(email);

        if (error) throw newError('Email is not valid', 422);

        user.email = email;
        user.nick = email.split('@')[0];
    }

    await user.save();
    res.status(201).json({ name: user.name, surname: user.surname, email: user.email, nick: user.nick });
});
