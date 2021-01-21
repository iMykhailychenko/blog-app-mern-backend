import bcrypt from 'bcrypt';
import UserModel from '../users/users.model';
import { errorWrapper, newError } from '../../services/helpers';

export const registration = errorWrapper(async (req, res) => {
    const { password, email, name, surname, avatar } = req.body;

    const user = await UserModel.findOne({ email });
    if (user) throw newError('Email in use', 409);

    const nick = email.split('@')[0];
    await UserModel.create({ name, surname, email, password, nick });

    res.status(201).json({ name, surname, nick, email, avatar });
});

export const login = errorWrapper(async (req, res) => {
    const { email, password, remember } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) throw newError('Wrong email or password', 400);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw newError('Wrong email or password', 400);

    const token = await user.createToken(remember);

    res.status(200).json({
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

export const logout = errorWrapper(async (req, res) => {
    const { token, user } = req;
    user.tokens = user.tokens.filter(data => data.token !== token);
    await user.save();
    res.status(204).send();
});
