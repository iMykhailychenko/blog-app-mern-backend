import { errorWrapper } from '../../services/helpers';
// import PostModel from '../posts/posts.model';

export const like = errorWrapper(async (req, res) => {
  res.status(204).send();
});

export const dislike = errorWrapper(async (req, res) => {
  res.status(204).send();
});
