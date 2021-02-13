import { $addLVD, $lookupUser, errorWrapper } from '../../services/helpers';
import PostModel from '../posts/posts.model';

export const getTrendingPosts = errorWrapper(async (req, res) => {
    const posts = await PostModel.aggregate([
        $lookupUser(),
        $addLVD(req.query.user),
        { $sort: { 'feedback.view': -1, 'feedback.like': -1, date: -1 } },
        { $project: { content: 0, user: 0, __v: 0 } },
        { $skip: new Date().getDay() },
        { $limit: 1 },
    ]);

    res.status(200).json(posts[0] || null);
});

export const getTrendingTags = errorWrapper((req, res) => {
    res.json({});
});
