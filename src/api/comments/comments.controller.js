import mongoose from 'mongoose';

import { errorWrapper, newError } from '../../services/helpers';
import CommentModel from './comments.model';

export const getComments = errorWrapper(async (req, res) => {
  const comments = await CommentModel.aggregate([
    { $match: { post: mongoose.Types.ObjectId(req.params.postId) } },
    {
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'parent',
        as: 'answers',
      },
    },
    {
      $match: { parent: null },
    },
  ]);
  // TODO add pagination

  res.status(201).json(comments);
});

export const postComment = errorWrapper(async (req, res) => {
  res.status(201).json(
    await CommentModel.create({
      text: req.body.text,
      user: req.user._id,
      post: req.params.postId,
      attachment: (req.file && req.file.filename) || null,
    }),
  );
});

export const answerComment = errorWrapper(async (req, res) => {
  const parent = await CommentModel.findById(req.params.commentId);
  if (!parent) newError(`Not found comment with id: ${req.params.commentId}`, 404);

  const answer = await CommentModel.create({
    text: req.body.text,
    user: req.user._id,
    post: req.params.postId,
    parent: parent._id,
    attachment: (req.file && req.file.filename) || null,
  });

  res.status(201).json(answer);
});
