import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

import { errorWrapper, newError, $addLVD, $pagination, $lookupUser } from '../../services/helpers';
import CommentModel from './comments.model';

/*
 * @GET
 * @desc get nested comments list for certain post
 * @auth - not required
 * @sort - date
 *
 * @params {postId} - post id
 *
 * @query {page} - current page/pagination
 * @query {limit} - posts per page/pagination
 * */
export const getComments = errorWrapper(async (req, res) => {
    const page = req.query.page - 1 || 0;
    const limit = +req.query.limit || 15;

    const comments = await CommentModel.aggregate([
        { $match: { post: mongoose.Types.ObjectId(req.params.postId) } },
        $lookupUser(),
        {
            $lookup: {
                from: 'comments',
                let: { id: '$_id' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$parent', '$$id'] } } },
                    $lookupUser(),
                    $addLVD({ id: req.user && req.user._id }),
                    { $sort: { date: -1 } },
                    { $project: { posts: 0, tokens: 0, password: 0, comments: 0, __v: 0 } },
                ],
                as: 'answers',
            },
        },
        { $match: { parent: null } },
        $addLVD({ id: req.user && req.user._id }),
        { $project: { user: 0, __v: 0 } },
        $pagination(page, limit),
    ]);

    res.json({
        comments: comments[0].data,
        count: comments[0].pagination[0] ? comments[0].pagination[0].total : 0,
        total: comments[0].pagination[0] ? Math.ceil(comments[0].pagination[0].total / limit) : 1,
    });
});

/*
 * @POST
 * @desc create new comment
 * @auth - required
 *
 * @body {text} - comment text
 * @body {attachment} - comment images
 *
 * @params {postId} - post id
 * */
export const postComment = errorWrapper(async (req, res) => {
    const comment = await CommentModel.create({
        text: req.body.text,
        user: req.user._id,
        post: req.params.postId,
        attachment: (req.file && req.file.filename) || null,
    });

    res.status(201).json(comment);
});

/*
 * @DELETE
 * @desc delete comment
 * @auth - required
 *
 * @body {text} - post text
 * @body {attachment} - post images
 *
 * @params {postId} - post id
 * */
export const deleteComment = errorWrapper(async (req, res) => {
    const children = await CommentModel.find({ parent: req.params.commentId }, ['attachment']);
    const comment = await CommentModel.findById(req.params.commentId, ['attachment', 'post']);

    children.forEach(item => {
        if (item && item.attachment) {
            fs.unlink(path.join(process.cwd(), 'uploads', item.attachment), err => {
                if (err) newError('Error with comment attachment', 500);
            });
        }
    });

    if (comment && comment.attachment) {
        fs.unlink(path.join(process.cwd(), 'uploads', comment.attachment), err => {
            if (err) newError('Error with comment attachment', 500);
        });
    }

    await CommentModel.deleteMany({ parent: req.params.commentId });
    await CommentModel.findByIdAndDelete(req.params.commentId);

    res.status(201).send(comment);
});

/*
 * @PUT
 * @desc edit comment
 * @auth - required
 *
 * @body {text} - post text
 * @body {attachment} - post images
 *
 * @params {commentId} - comment id
 * */
export const editComment = errorWrapper(async (req, res) => {
    await CommentModel.update(
        { _id: req.params.commentId, user: req.user._id },
        {
            text: req.body.text,
            edited: new Date(),
        },
    );
    res.status(201).json({ _id: req.params.commentId });
});

/*
 * @POST
 * @desc answer comment
 * @auth - required
 *
 * @body {text} - post text
 * @body {attachment} - post images
 *
 * @params {postId} - post id for comment ref
 * @params {commentId} - parent comment id
 * */
export const answerComment = errorWrapper(async (req, res) => {
    const answer = await CommentModel.create({
        text: req.body.text,
        user: req.user._id,
        post: req.params.postId,
        parent: req.params.commentId,
        attachment: (req.file && req.file.filename) || null,
    });
    res.status(201).json(answer);
});
