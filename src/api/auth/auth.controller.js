import bcrypt from 'bcrypt';
import UserModel from '../users/users.model';
import { errorWrapper, newError } from '../../services/helpers';

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

export const google = errorWrapper(async (req, res) => {
    console.log(req);
    res.send({});
});
