import { errorWrapper, newError } from "../../services/helpers";
import UserModel from './users.model';

export const getUser = errorWrapper(async (req, res) => {
  const { _id, email, name, surname, nick, avatar } = req.user;
  res.status(200).json({ _id, name, surname, nick, email, avatar });
});

export const putFollowers = errorWrapper(async (req, res) => {
  const target = await UserModel.findById(req.params.userId);
  if (!target) newError(`Not found user with id: ${req.params.userId}`, 404);

  if (req.user.following.includes(req.params.userId)) {
    req.user.following.filter(id => id.toString() !== req.params.userId);
    await req.user.save();

    target.followers.filter(id => id.toString() !== req.params.userId);
    await target.save();

    res.status(200).json(target);
    return;
  }

  req.user.following.push(req.params.userId);
  await req.user.save();

  target.followers.push(req.params.userId);
  await target.save();

  res.status(200).json(target);
});

export const getUserById = errorWrapper(async (req, res) => {
  res.status(200).json(await UserModel.findById(req.params.userId));
});
