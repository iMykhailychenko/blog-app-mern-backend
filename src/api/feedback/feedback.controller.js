import { errorWrapper, newError } from '../../services/helpers';
import CommentModel from '../comments/comments.model';
import PostModel from '../posts/posts.model';
import UserModel from '../users/users.model';

// POSTS
export const likePost = errorWrapper(async (req, res) => {
  const userId = req.user._id.toString();
  const post = await PostModel.findById(req.params.postId);

  if (post.feedback.dislike.includes(userId)) {
    const dislikes = post.feedback.dislike.filter(id => id.toString() !== userId);
    post.feedback.dislike = dislikes;
  }

  if (post.feedback.like.includes(userId)) {
    const likes = post.feedback.like.filter(id => id.toString() !== userId);
    post.feedback.like = likes;
    await post.save();

    res.status(201).json(post);
    return;
  }

  post.feedback.like.push(userId);
  await post.save();
  res.status(201).json(post);
});

export const dislikePost = errorWrapper(async (req, res) => {
  const userId = req.user._id.toString();
  const post = await PostModel.findById(req.params.postId);

  if (post.feedback.like.includes(userId)) {
    const likes = post.feedback.like.filter(id => id.toString() !== userId);
    post.feedback.like = likes;
  }

  if (post.feedback.dislike.includes(userId)) {
    const dislikes = post.feedback.dislike.filter(id => id.toString() !== userId);
    post.feedback.dislike = dislikes;
    await post.save();

    res.status(201).json(post);
    return;
  }

  post.feedback.dislike.push(userId);
  await post.save();
  res.status(201).json(post);
});

// COMMENTS
export const likeComment = errorWrapper(async (req, res) => {
  const userId = req.user._id.toString();
  const comment = await CommentModel.findById(req.params.commentId);
  if (!comment) newError(`Not found comment with id: ${req.params.commentId}`, 404);

  if (comment.feedback.dislike.includes(userId)) {
    const dislikes = comment.feedback.dislike.filter(id => id.toString() !== userId);
    comment.feedback.dislike = dislikes;
  }

  if (comment.feedback.like.includes(userId)) {
    const likes = comment.feedback.like.filter(id => id.toString() !== userId);
    comment.feedback.like = likes;
    await comment.save();

    res.status(201).json(comment);
    return;
  }

  comment.feedback.like.push(userId);
  await comment.save();
  res.status(201).json(comment);
});

export const dislikeComment = errorWrapper(async (req, res) => {
  const userId = req.user._id.toString();
  const comment = await CommentModel.findById(req.params.commentId);
  if (!comment) newError(`Not found comment with id: ${req.params.commentId}`, 404);

  if (comment.feedback.like.includes(userId)) {
    const likes = comment.feedback.like.filter(id => id.toString() !== userId);
    comment.feedback.like = likes;
  }

  if (comment.feedback.dislike.includes(userId)) {
    const dislikes = comment.feedback.dislike.filter(id => id.toString() !== userId);
    comment.feedback.dislike = dislikes;
    await comment.save();

    res.status(201).json(comment);
    return;
  }

  comment.feedback.dislike.push(userId);
  await comment.save();
  res.status(201).json(comment);
});

// USERS
export const likeUser = errorWrapper(async (req, res) => {
  const userId = req.user._id.toString();
  const user = await UserModel.findById(req.params.userId);
  if (!user) newError(`Not found user with id: ${req.params.userId}`, 404);

  if (user.feedback.dislike.includes(userId)) {
    const dislikes = user.feedback.dislike.filter(id => id.toString() !== userId);
    user.feedback.dislike = dislikes;
  }

  if (user.feedback.like.includes(userId)) {
    const likes = user.feedback.like.filter(id => id.toString() !== userId);
    user.feedback.like = likes;
    await user.save();

    res.status(201).json(user.feedback);
    return;
  }

  user.feedback.like.push(userId);
  await user.save();
  res.status(201).json(user.feedback);
});

export const dislikeUser = errorWrapper(async (req, res) => {
  const userId = req.user._id.toString();
  const user = await UserModel.findById(req.params.userId);
  if (!user) newError(`Not found user with id: ${req.params.userId}`, 404);

  if (user.feedback.like.includes(userId)) {
    const likes = user.feedback.like.filter(id => id.toString() !== userId);
    user.feedback.like = likes;
  }

  if (user.feedback.dislike.includes(userId)) {
    const dislikes = user.feedback.dislike.filter(id => id.toString() !== userId);
    user.feedback.dislike = dislikes;
    await user.save();

    res.status(201).json(user.feedback);
    return;
  }

  user.feedback.dislike.push(userId);
  await user.save();
  res.status(201).json(user.feedback);
});
