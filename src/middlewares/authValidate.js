import Joi from 'joi';
import { errorWrapper, newError } from '../services/helpers';

const authValidate = errorWrapper(async (req, _, next) => {
    const { error } = Joi.string()
        .pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[_#?!@$%^&*-]).{8,}$/)
        .validate(req.body.password);

    if (error) throw newError('Password is not valid', 422);
    next();
});

export default authValidate;
