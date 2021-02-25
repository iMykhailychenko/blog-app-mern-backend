import mongoose from 'mongoose';
import { $addLVD, $pagination, errorWrapper } from '../../services/helpers';
import PostModel from '../posts/posts.model';

/*
 * @GET
 * @desc get all user post in queue
 * @auth - required
 * */
export const getQueue = errorWrapper(async (req, res) => {
    const page = req.query.page - 1 || 0;
    const limit = +req.query.limit || 15;

    const posts = await PostModel.aggregate([
        { $match: { queue: mongoose.Types.ObjectId(req.user._id) } },
        $addLVD({ id: req.user._id, view: true, queue: true }),
        { $project: { content: 0, user: 0, __v: 0 } },
        $pagination(page, limit),
    ]);

    res.json({
        posts: posts[0].data,
        count: posts[0].pagination[0].total,
        total: posts[0].pagination[0] ? Math.ceil(posts[0].pagination[0].total / limit) : 1,
    });
});

/*
 * @PUT
 * @desc put post to queue
 * @auth - required
 * */
export const putQueue = errorWrapper(async (req, res) => {
    const queue = await PostModel.find({ _id: req.params.postId, queue: req.user._id });

    if (queue.length) {
        await PostModel.update(
            { _id: mongoose.Types.ObjectId(req.params.postId) },
            { $pull: { queue: mongoose.Types.ObjectId(req.user._id) } },
        );

        res.status(201).json({ queue: 0 });
        return;
    }

    await PostModel.update(
        { _id: mongoose.Types.ObjectId(req.params.postId) },
        { $push: { queue: mongoose.Types.ObjectId(req.user._id) } },
    );

    res.status(201).json({ queue: 1 });
});
