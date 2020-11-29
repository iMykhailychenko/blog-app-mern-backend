import { errorWrapper } from '../../services/helpers';
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
      $group: {
        _id: null,
        total: { $sum: 1 },
        posts: { $push: '$$ROOT' },
      },
    },
    {
      $project: { user: 0, __v: 0 },
    },
  ]);

  res.status(201).json(posts);
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
