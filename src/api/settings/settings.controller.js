import Joi from 'joi';
import bcrypt from 'bcrypt';
import { errorWrapper, newError, updateUserStatic } from '../../services/helpers';
import UserModel from '../users/users.model';

/*
 * @PUT
 * @desc update user avatar
 * @auth - required
 *
 * @body {avatar} - uploaded image
 * */
export const updateAvatar = errorWrapper(async (req, res) => {
    const file = (req.file && req.file.filename) || null;
    await updateUserStatic(req.user.avatar, req.user._id, file, 'avatar');
    res.status(201).send(file);
});

/*
 * @PUT
 * @desc update user banner
 * @auth - required
 *
 * @body {banner} - uploaded image
 * */
export const updateBanner = errorWrapper(async (req, res) => {
    const file = (req.file && req.file.filename) || null;
    await updateUserStatic(req.user.banner, req.user._id, file, 'banner');
    res.status(201).send(file);
});

/*
 * @PUT
 * @desc update user info
 * @auth - required
 *
 * @body {name} - user name
 * @body {surname} - user surname
 * @body {email} - user surname
 * */
export const updateUser = errorWrapper(async (req, res) => {
    const { name, surname, email } = req.body;
    const user = await UserModel.findOne(req.user._id, ['name', 'surname', 'email', 'nick']);

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

/*
 * @PUT
 * @desc update user bio
 * @auth - required
 *
 * @body {bio} - user bio
 * */
export const updateBio = errorWrapper(async (req, res) => {
    await UserModel.update({ _id: req.user._id }, { bio: req.body.bio });
    res.status(201).send(req.body.bio);
});

/*
 * @PUT
 * @desc change user pass
 * @auth - required
 *
 * @body {oldPass} - old password
 * @body {newPass} - new password
 * */
export const changePass = errorWrapper(async (req, res) => {
    const { oldPass, newPass } = req.body;
    const user = await UserModel.findOne(req.user._id, ['password']);

    const isPasswordValid = await bcrypt.compare(oldPass, user.password);
    if (!isPasswordValid) throw newError('Wrong old password', 400);

    const { error } = Joi.string()
        .pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[_#?!@$%^&*-]).{8,}$/)
        .validate(newPass);

    if (error) throw newError('Password is not valid', 422);

    user.password = newPass;
    await user.save();
    res.status(204).send();
});
