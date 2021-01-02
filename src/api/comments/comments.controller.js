import mongoose from 'mongoose';

import fs from 'fs';
import path from 'path';
import { errorWrapper, newError } from '../../services/helpers';
import CommentModel from './comments.model';

export const getComments = errorWrapper(async (req, res) => {
  const comments = await CommentModel.aggregate([
    { $match: { post: mongoose.Types.ObjectId(req.params.postId) } },
    {
      $lookup: {
        from: 'users',
        let: { userId: '$user' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
          { $project: { posts: 0, tokens: 0, password: 0, comments: 0, __v: 0 } },
        ],
        as: 'author',
      },
    },
    {
      $lookup: {
        from: 'comments',
        let: { id: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$parent', '$$id'] } } },
          {
            $lookup: {
              from: 'users',
              let: { userId: '$user' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
                {
                  $project: {
                    posts: 0,
                    tokens: 0,
                    password: 0,
                    comments: 0,
                    __v: 0,
                  },
                },
              ],
              as: 'author',
            },
          },
          { $project: { posts: 0, tokens: 0, password: 0, comments: 0, __v: 0 } },
        ],
        as: 'answers',
      },
    },
    {
      $match: { parent: null },
    },
    {
      $project: { user: 0, __v: 0 },
    },
    {
      $sort: {
        date: -1,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        comments: { $push: '$$ROOT' },
      },
    },
  ]);
  // TODO add pagination

  res.status(200).json(comments);
});

export const postComment = errorWrapper(async (req, res) => {
  const comment = await CommentModel.create({
    text: req.body.text,
    user: req.user._id,
    post: req.params.postId,
    attachment: (req.file && req.file.filename) || null,
  });

  res.status(201).json(comment);
});

export const deleteComment = errorWrapper(async (req, res) => {
  const children = await CommentModel.find({ parent: req.params.commentId });
  const comment = await CommentModel.findById(req.params.commentId);

  children.forEach(item => {
    if (item && item.attachment) {
      fs.unlink(path.join(process.cwd(), 'uploads', item.attachment), err => {
        if (err) newError('Error with comment attachment', 500);
      });
    }
  });

  if (comment && comment.attachment) {
    fs.unlink(path.join(process.cwd(), 'uploads', comment.attachment), err => {
      if (err) newError('Error with comment attachment', 500);
    });
  }

  await CommentModel.deleteMany({ parent: req.params.commentId });
  await CommentModel.findByIdAndDelete(req.params.commentId);

  res.status(200).send(comment);
});

export const editComment = errorWrapper(async (req, res) => {
  const comment = await CommentModel.findById(req.params.commentId);
  // validate
  if (!comment) throw newError('Not found', 404);
  if (comment.user.toString() !== req.user._id.toString())
    throw newError('Not permitted', 403);
  // write data
  comment.text = req.body.text;
  comment.edited = Date.now();
  // action
  await comment.save();
  res.status(201).send(comment);
});

export const answerComment = errorWrapper(async (req, res) => {
  const parent = await CommentModel.findById(req.params.commentId);
  if (!parent) newError(`Not found comment with id: ${req.params.commentId}`, 404);
  // action
  const answer = await CommentModel.create({
    text: req.body.text,
    user: req.user._id,
    post: req.params.postId,
    parent: parent._id,
    attachment: (req.file && req.file.filename) || null,
  });
  res.status(201).json(answer);
});
