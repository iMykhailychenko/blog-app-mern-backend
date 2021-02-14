import { $addLVD, $lookupUser, errorWrapper } from '../../services/helpers';
import PostModel from '../posts/posts.model';

/*
 * @GET
 * @desc get all user post in queue
 * @auth - required
 * */
export const getQueue = errorWrapper(async (req, res) => {
    const posts = await PostModel.aggregate([
        $lookupUser(),
        $addLVD({ id: req.query.user, view: true, queue: true }),
        { $sort: { 'feedback.view': -1, 'feedback.like': -1, date: -1 } },
        { $project: { content: 0, queue: 0, user: 0, __v: 0 } },
        { $skip: new Date().getDay() },
        { $limit: 1 },
    ]);
    console.log(posts);

    res.json({});
});

/*
 * @PUT
 * @desc put post to queue
 * @auth - required
 * */
export const putQueue = errorWrapper(async (req, res) => {
    res.status(201).json({});
});
