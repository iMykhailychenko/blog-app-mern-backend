import jwt from 'jsonwebtoken';
import { errorWrapper } from '../services/helpers';
import UserModel from '../api/users/users.model';
import config from '../services/config';

const authCheck = errorWrapper(async (req, _, next) => {
    req.user = null;
    const token = req.get('Authorization') && req.get('Authorization').replace('Bearer ', '');
    if (!token) return next();

    const { id } = await jwt.verify(token, config.auth.accessKey);
    if (!id) return next();

    const user = await UserModel.findById(id);
    if (!user) return next();

    const currentToken = user.tokens.find(data => data.token === token);
    if (!currentToken) return next();

    req.user = user;
    return next();
});

export default authCheck;
