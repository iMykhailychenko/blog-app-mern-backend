import { errorWrapper } from '../../services/helpers';
import UserModel from './users.model';

export const getUser = errorWrapper(async (req, res) => {
  const { _id, email, name, surname, nick, avatar } = req.user;
  res.status(200).json({ _id, name, surname, nick, email, avatar });
});

export const getUserById = errorWrapper(async (req, res) => {
  res
    .status(200)
    .json(
      await UserModel.findById(req.params.userId, [
        'name',
        'surname',
        'nick',
        'email',
        'avatar',
      ]),
    );
});
