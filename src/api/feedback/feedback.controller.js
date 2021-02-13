import mongoose from 'mongoose';

import { $addLVD, errorWrapper, newError } from '../../services/helpers';
import CommentModel from '../comments/comments.model';
import PostModel from '../posts/posts.model';
import UserModel from '../users/users.model';

/*
 * @desc local helper for
 * @auth - required
 *
 * @params {postId} - post id
 * */
const handleLike = async (model, req, res, id) => {
    const target = await model.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(id) } },
        $addLVD(req.user._id),
        { $project: { content: 0, desc: 0, user: 0, __v: 0 } },
    ]);

    // stop if no content
    if (target[0]) throw newError(`No post with id: ${id}`, 404);

    // if user have left dislike before
    if (target[0].feedback.isDisliked) {
        await model.update(
            { _id: mongoose.Types.ObjectId(id) },
            {
                $pull: { 'feedback.dislike': mongoose.Types.ObjectId(req.user._id) },
                $push: { 'feedback.like': mongoose.Types.ObjectId(req.user._id) },
            },
        );
        res.status(201).json({
            ...target[0].feedback,
            isLiked: 1,
            isDisliked: 0,
            like: target[0].feedback.like + 1,
            dislike: target[0].feedback.dislike - 1,
        });
        return;
    }
    // if user have left like before
    if (target[0].feedback.isLiked) {
        await model.update(
            { _id: mongoose.Types.ObjectId(id) },
            { $push: { 'feedback.like': mongoose.Types.ObjectId(req.user._id) } },
        );
        res.status(201).json({
            ...target[0].feedback,
            isLiked: 0,
            like: target[0].feedback.like - 1,
        });
        return;
    }
    // no likes from user before
    await model.update(
        { _id: mongoose.Types.ObjectId(id) },
        { $pull: { 'feedback.like': mongoose.Types.ObjectId(req.user._id) } },
    );
    res.status(201).json({
        ...target[0].feedback,
        isLiked: 1,
        like: target[0].feedback.like + 1,
    });
};

const handleDislike = async (model, req, res, id) => {
    const target = await model.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(id) } },
        $addLVD(req.user._id),
        { $project: { content: 0, desc: 0, user: 0, __v: 0 } },
    ]);
    // stop if no content
    if (target[0]) throw newError(`No post with id: ${id}`, 404);

    // if user have left like before
    if (target[0].feedback.isLiked) {
        await model.update(
            { _id: mongoose.Types.ObjectId(id) },
            {
                $pull: { 'feedback.like': mongoose.Types.ObjectId(req.user._id) },
                $push: { 'feedback.dislike': mongoose.Types.ObjectId(req.user._id) },
            },
        );
        res.status(201).json({
            ...target[0].feedback,
            isLiked: 0,
            isDisliked: 1,
            dislike: target[0].feedback.dislike + 1,
            like: target[0].feedback.like - 1,
        });
        return;
    }
    // if user have left dislike before
    if (target[0].feedback.isDisliked) {
        await model.update(
            { _id: mongoose.Types.ObjectId(id) },
            { $push: { 'feedback.dislike': mongoose.Types.ObjectId(req.user._id) } },
        );
        res.status(201).json({
            ...target[0].feedback,
            isDisliked: 0,
            dislike: target[0].feedback.dislike - 1,
        });
        return;
    }
    // no likes from user before
    await model.update(
        { _id: mongoose.Types.ObjectId(id) },
        { $pull: { 'feedback.dislike': mongoose.Types.ObjectId(req.user._id) } },
    );
    res.status(201).json({
        ...target[0].feedback,
        isDisliked: 1,
        dislike: target[0].feedback.dislike + 1,
    });
};

/*
 * @PUT
 * @desc put like on certain post, toggle it or invert dislike to like
 * @auth - required
 *
 * @params {postId} - post id
 * */
export const likePost = errorWrapper(async (req, res) => {
    await handleLike(PostModel, req, res, req.params.postId);
});

/*
 * @PUT
 * @desc put dislike on certain post, toggle it or convert like to dislike
 * @auth - required
 *
 * @params {postId} - post id
 * */
export const dislikePost = errorWrapper(async (req, res) => {
    await handleDislike(PostModel, req, res, req.params.postId);
});

/*
 * @PUT
 * @desc put like on certain comment, toggle it or convert dislike to like
 * @auth - required
 *
 * @params {commentId} - comment id
 * */
export const likeComment = errorWrapper(async (req, res) => {
    await handleLike(CommentModel, req, res, req.params.commentId);
});

/*
 * @PUT
 * @desc put dislike on certain comment, toggle it or convert like to dislike
 * @auth - required
 *
 * @params {commentId} - comment id
 * */
export const dislikeComment = errorWrapper(async (req, res) => {
    await handleDislike(CommentModel, req, res, req.params.commentId);
});

/*
 * @PUT
 * @desc put like on user profile, toggle it or convert dislike to like
 * @auth - required
 *
 * @params {userId} - user id
 * */
export const likeUser = errorWrapper(async (req, res) => {
    await handleLike(UserModel, req, res, req.params.userId);
});

/*
 * @PUT
 * @desc put dislike on user profile, toggle it or convert like to dislike
 * @auth - required
 *
 * @params {userId} - user id
 * */
export const dislikeUser = errorWrapper(async (req, res) => {
    await handleDislike(UserModel, req, res, req.params.userId);
});
