import Joi from 'joi';
import { errorWrapper, newError } from '../../services/helpers';
import PostModel from './posts.model';

export const getPosts = errorWrapper(async (_, res) => {
  const posts = await PostModel.aggregate([
    {
      $lookup: {
        from: 'users',
        let: { userId: '$user' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
          { $project: { posts: 0, tokens: 0, password: 0, __v: 0 } },
        ],
        as: 'author',
      },
    },
    {
      $sort: {
        view: 1,
      },
    },
    {
      $project: { content: 0, user: 0, __v: 0 },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        posts: { $push: '$$ROOT' },
      },
    },
  ]);

  res.status(201).json(posts[0]);
});

export const updatePost = errorWrapper(async (req, res) => {
  const post = await PostModel.findById(req.params.postId);

  if (!post) newError('Not found', 404);

  if (req.user._id.toString() !== post.user.toString())
    newError('Post edit forbidden for this user', 403);

  const { error, value } = Joi.object({
    title: Joi.string(),
    desc: Joi.string(),
    banner: Joi.string(),
    tags: Joi.array().items(Joi.string()),
    content: Joi.string(),
  }).validate(req.body);

  if (error) newError('Bad request', 400);

  res
    .status(201)
    .json(
      await PostModel.findByIdAndUpdate(
        req.params.postId,
        { $set: value },
        { new: true },
      ),
    );
});

export const getSinglePosts = errorWrapper(async (req, res) => {
  const post = await PostModel.findById(req.params.postId);

  if (req.query.user && !post.feedback.view.includes(req.query.user)) {
    post.feedback.view.push(req.query.user);
    await post.save();
  }

  res.status(201).json(post);
});

export const createPost = errorWrapper(async (req, res) => {
  const post = await PostModel.create({ ...req.body, user: req.user._id });
  req.user.posts.push(post._id);
  await req.user.save();

  res.status(201).json(post);
});

export const uploadImg = errorWrapper(async (req, res) => {
  console.log(req.file);
  const post = await PostModel.findById(req.params.postId);
  post.banner = req.file.filename;
  await post.save();
  res.status(201).json({ post: 'new' });
});
