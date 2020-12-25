import { errorWrapper } from '../../services/helpers';
import PostModel from '../posts/posts.model';

export const like = errorWrapper(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id.toString();
  const post = await PostModel.findById(postId);

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

export const dislike = errorWrapper(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id.toString();
  const post = await PostModel.findById(postId);

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
