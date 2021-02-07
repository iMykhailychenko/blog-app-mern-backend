import fs from 'fs';
import path from 'path';

import Joi from 'joi';
import bcrypt from 'bcrypt';
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

export const updateBio = errorWrapper(async (req, res) => {
    const user = await UserModel.findOne(req.user._id);
    user.bio = req.body.bio;
    await user.save();
    res.status(201).send(user.bio);
});

export const changePass = errorWrapper(async (req, res) => {
    const { oldPass, newPass } = req.body;
    const user = await UserModel.findOne(req.user._id);

    const isPasswordValid = await bcrypt.compare(oldPass, user.password);
    if (!isPasswordValid) throw newError('Wrong email or password', 400);

    const { error } = Joi.string()
        .pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[_#?!@$%^&*-]).{8,}$/)
        .validate(newPass);

    if (error) throw newError('Password is not valid', 422);

    user.password = newPass;
    await user.save();
    res.status(204).send();
});
