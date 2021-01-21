import jwt from 'jsonwebtoken';
import { errorWrapper, newError } from '../services/helpers';
import UserModel from '../api/users/users.model';
import config from '../services/config';

const checkToken = errorWrapper(async (req, _, next) => {
    const token = req.get('Authorization') && req.get('Authorization').replace('Bearer ', '');
    if (!token) throw newError('No token provided', 401);

    const { id } = await jwt.verify(token, config.auth.accessKey);
    if (!id) throw newError('Not authorized', 401);

    const user = await UserModel.findById(id);
    if (!user) throw newError('Not authorized', 401);

    const currentToken = user.tokens.find(data => data.token === token);
    if (!currentToken) throw newError('Not authorized', 401);

    if (new Date() > new Date(currentToken.expires)) {
        user.tokens = user.tokens.filter(data => data.token !== token);
        await user.save();

        throw newError('Token expired', 403);
    }

    req.user = user;
    req.token = token;
    next();
});

export default checkToken;
