import { errorWrapper } from '../../services/helpers';
import PostModel from '../posts/posts.model';

export const getFavoritePosts = errorWrapper(async (req, res) => {
    const posts = await PostModel.aggregate([
        {
            $lookup: {
                from: 'users',
                let: { userId: '$user' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
                    {
                        $project: {
                            posts: 0,
                            feedback: 0,
                            banner: 0,
                            desc: 0,
                            following: 0,
                            followers: 0,
                            tokens: 0,
                            password: 0,
                            __v: 0,
                        },
                    },
                ],
                as: 'author',
            },
        },
        { $sort: { favorite: -1, top: -1, date: -1 } },
        { $project: { content: 0, favorite: 0, user: 0, top: 0, __v: 0 } },
        { $skip: new Date().getDay() },
        { $limit: 1 },
    ]);

    res.status(200).json(posts[0] || null);
});

export const getFavoriteTags = errorWrapper((req, res) => {
    res.json({});
});
