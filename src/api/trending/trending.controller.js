import { $addLVD, $lookupUser, errorWrapper } from '../../services/helpers';
import PostModel from '../posts/posts.model';

/*
 * @GET
 * @desc get trending post (random post, depends on day of the week)
 * @auth - optional
 * */
export const getTrendingPosts = errorWrapper(async (req, res) => {
    const posts = await PostModel.aggregate([
        $lookupUser(),
        $addLVD({ id: req.query.user, view: true, queue: true }),
        { $sort: { 'feedback.view': -1, 'feedback.like': -1, date: -1 } },
        { $project: { content: 0, user: 0, __v: 0 } },
        { $skip: new Date().getDay() },
        { $limit: 1 },
    ]);

    res.json(posts[0] || null);
});

/*
 * @GET
 * @desc get unique set of tags from first 15 posts in trending
 * @auth - not required
 * */
export const getTrendingTags = errorWrapper(async (req, res) => {
    const posts = await PostModel.aggregate([
        $lookupUser(),
        $addLVD({ id: req.query.user, view: true }),
        { $sort: { 'feedback.view': -1, 'feedback.like': -1, date: -1 } },
        { $limit: 15 },
        {
            $group: {
                _id: null,
                trending: { $addToSet: '$tags' },
            },
        },
    ]);

    const tags = new Set();
    if (posts[0].trending)
        posts[0].trending
            .flat()
            .slice(0, 20)
            .map(item => tags.add(item));
    res.json([...tags]);
});
