import { errorWrapper, newError } from '../services/helpers';
import PostModel from '../api/posts/posts.model';

const postIdValidate = errorWrapper(async (req, _, next) => {
    const post = await PostModel.findById(req.params.postId, ['user', 'date', 'title', 'banner']);
    if (!post) newError(`Not found post with id: ${req.params.postId}`, 404);

    req.post = post;
    return next();
});

export default postIdValidate;
