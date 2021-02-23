import axios from 'axios';
import bcrypt from 'bcrypt';
import * as querystring from 'querystring';

import UserModel from '../users/users.model';
import { errorWrapper, newError } from '../../services/helpers';
import config from '../../services/config';

/*
 * @POST
 * @desc registration
 * @auth - not required
 *
 * @body {password} - password
 * @body {email} - unique email
 * @body {name} - name
 * @body {surname} - surname
 * @body {avatar} - avatar / sting or null
 * */
export const registration = errorWrapper(async (req, res) => {
    const { password, email, name, surname, avatar } = req.body;

    const user = await UserModel.findOne({ email });
    if (user) throw newError('Email in use', 409);

    const nick = email.split('@')[0];
    await UserModel.create({ name, surname, email, password, nick });

    res.status(201).json({ name, surname, nick, email, avatar });
});

/*
 * @POST
 * @desc registration
 * @auth - not required
 *
 * @body {password} - password
 * @body {email} - unique email
 * @body {remember} - boolean to delay token expiration
 * */
export const login = errorWrapper(async (req, res) => {
    const { email, password, remember } = req.body;
    if (!password || !email) throw newError('Wrong email or password', 400);

    const user = await UserModel.findOne({ email });
    if (!user) throw newError('Wrong email or password', 400);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw newError('Wrong email or password', 400);

    const token = await user.createToken(remember);

    res.json({
        token,
        user: {
            _id: user._id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            nick: user.nick,
            avatar: user.avatar,
        },
    });
});

/*
 * @POST
 * @desc registration
 * @auth - required
 *
 * */
export const logout = errorWrapper(async (req, res) => {
    const { token, user } = req;
    user.tokens = user.tokens.filter(data => data.token !== token);
    await user.save();
    res.status(204).send();
});

/*
 * @GET
 * @desc google registration redirect
 * @auth - not required
 *
 * */
export const googleUrl = errorWrapper(async (req, res) => {
    res.redirect(
        `https://accounts.google.com/o/oauth2/v2/auth?${querystring.stringify({
            redirect_uri: `${config.back}/api/auth/google`,
            client_id: config.google.client.id,
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            scope: config.google.scope.join(' '),
        })}`,
    );
});

/*
 * @GET
 * @desc registration or login user with data from google
 * @auth - not required
 *
 * */
export const google = errorWrapper(async (req, res) => {
    // get google token
    const tokens = await axios.post('https://oauth2.googleapis.com/token', null, {
        params: {
            code: req.query.code,
            client_id: config.google.client.id,
            client_secret: config.google.client.secret,
            redirect_uri: `${config.back}/api/auth/google`,
            grant_type: 'authorization_code',
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // get user by token
    const googleUser = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        params: { alt: 'json', access_token: tokens.data.access_token },
        headers: { Authorization: `Bearer ${tokens.data.id_token}` },
    });

    // check if user with such id exist
    let user = await UserModel.findOne({ googleId: googleUser.data.id }, '_id');

    // create user if not exist
    if (!user) {
        const { id, email, given_name, family_name, picture } = googleUser.data;
        const nick = email.split('@')[0];

        // try catch in case we have user with such email
        try {
            // create user
            await UserModel.create({
                nick,
                email,
                googleId: id,
                avatar: picture,
                name: given_name,
                surname: family_name,
            });

            // check if user have been created
            user = await UserModel.findOne({ googleId: googleUser.data.id }, '_id');
        } catch (error) {
            res.redirect(`${config.front}/?${querystring.stringify({ error: error.message })}`);
            throw new Error(error);
        }
    }

    const token = await user.createToken(true);
    res.redirect(`${config.front}/?${querystring.stringify({ user: user._id.toString(), token })}`);
});

/*
 * @GET
 * @desc facebook registration redirect
 * @auth - not required
 *
 * */
export const facebookUrl = errorWrapper(async (req, res) => {
    res.redirect(
        `https://www.facebook.com/v9.0/dialog/oauth?${querystring.stringify({
            redirect_uri: `${config.back}/api/auth/facebook`,
            client_id: config.facebook.client.id,
            response_type: 'code',
            auth_type: 'rerequest',
            scope: config.facebook.scope.join(' '),
        })}`,
    );
});

/*
 * @GET
 * @desc registration or login user with data from facebook
 * @auth - not required
 *
 * */
export const facebook = errorWrapper(async (req, res) => {
    // handle facebook error
    if (req.query.error_code) {
        res.redirect(`${config.front}/?${querystring.stringify({ error: req.query.error_message })}`);
        throw new Error(req.query.error_message);
    }

    // get facebook token
    const tokens = await axios.get('https://graph.facebook.com/v9.0/oauth/access_token', {
        params: {
            code: req.query.code,
            client_id: config.facebook.client.id,
            client_secret: config.facebook.client.secret,
            redirect_uri: `${config.back}/api/auth/facebook`,
        },
    });

    // get user by token
    const facebookUser = await axios.get('https://graph.facebook.com/me', {
        params: { access_token: tokens.data.access_token, fields: 'id,email,first_name,last_name,picture.type(large)' },
    });

    // check if user with such id exist
    let user = await UserModel.findOne({ facebookId: facebookUser.data.id }, '_id');

    // create user if not exist
    console.dir(facebookUser.data.picture);
    if (!user) {
        const { id, email, first_name, last_name, picture } = facebookUser.data;
        const nick = email ? email.split('@')[0] : 'none';

        // try catch in case we have user with such email
        try {
            // create user
            const values = {
                nick,
                facebookId: id,
                avatar: (picture && picture.data && picture.data.url) || null,
                name: first_name,
                surname: last_name,
            };
            if (email) values.email = email;
            await UserModel.create(values);

            // check if user have been created
            user = await UserModel.findOne({ facebookId: id }, '_id');
        } catch (error) {
            res.redirect(`${config.front}/?${querystring.stringify({ error: error.message })}`);
            throw new Error(error);
        }
    }

    const token = await user.createToken(true);
    res.redirect(`${config.front}/?${querystring.stringify({ user: user._id.toString(), token })}`);
});
