import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

import PostModel from './posts.model';
import CommentModel from '../comments/comments.model';
import UserModel from '../users/users.model';
import { errorWrapper, newError, generateTags, $lookupUser, $addLVD, $pagination } from '../../services/helpers';

/*
 * @GET
 * @desc - get all posts with preview information and author data / can be used for search
 * @sort - by review count and date of publication
 * @auth - optional
 *
 * @query {page} - current page/pagination
 * @query {limit} - posts per page/pagination
 * @query {user} - user id if user is authenticated
 * @query {q} - search query
 * */
export const getPosts = errorWrapper(async (req, res) => {
    const page = req.query.page - 1 || 0;
    const limit = +req.query.limit || 15;

    let pipeline = [
        $lookupUser(),
        $addLVD({ id: req.query.user, view: true, queue: true }),
        { $sort: { 'feedback.view': -1, 'feedback.like': -1 } },
        { $project: { content: 0, user: 0, __v: 0 } },
        $pagination(page, limit),
    ];

    if (req.query.q)
        pipeline = [
            {
                $match: {
                    $or: [
                        { title: new RegExp(req.query.q, 'gi') },
                        { desc: new RegExp(req.query.q, 'gi') },
                        { tags: new RegExp(req.query.q, 'gi') },
                    ],
                },
            },
            ...pipeline,
        ];

    const posts = await PostModel.aggregate(pipeline);
    res.json({ posts: posts[0].data, total: posts[0].pagination[0] ? posts[0].pagination[0].total : null });
});

/*
 * @GET
 * @desc - get all posts related to certain user
 * @sort - by date of publication
 * @auth - required
 *
 * @params {userId} - user id
 *
 * @query {page} - current page/pagination
 * @query {limit} - posts per page/pagination
 * */
export const getUserPosts = errorWrapper(async (req, res) => {
    const page = req.query.page - 1 || 0;
    const limit = +req.query.limit || 15;

    const posts = await PostModel.aggregate([
        { $match: { user: mongoose.Types.ObjectId(req.params.userId) } },
        $addLVD({ id: req.params.userId, view: true, queue: true }),
        { $project: { content: 0, user: 0, __v: 0 } },
        { $sort: { date: -1 } },
        $pagination(page, limit),
    ]);

    res.json({ posts: posts[0].data, total: posts[0].pagination[0].total });
});

/*
 * @PUT
 * @desc update user post
 * @auth - required
 *
 * @body {title: string} - post title
 * @body {desc: string} - post desc
 * @body {tags: string[]} - post tags
 * @body {content: string} - post content
 *
 * @params {postId} - post id
 * */
export const updatePost = errorWrapper(async (req, res) => {
    await PostModel.update(
        { _id: req.params.postId, user: req.user._id },
        {
            title: req.body.title,
            desc: req.body.desc,
            tags: req.body.tags,
            content: req.body.content,
            edited: new Date(),
        },
    );
    res.status(201).json({ _id: req.params.postId });
});

/*
 * @GET
 * @desc get detail post view and push view into post Model if client is authenticated
 * @auth - optional
 *
 * @params {postId} - post id
 * */
export const getSinglePosts = errorWrapper(async (req, res) => {
    const posts = await PostModel.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(req.params.postId) } },
        $lookupUser(),
        $addLVD({ id: req.query.user, view: true, queue: true }),
        { $project: { user: 0, __v: 0 } },
    ]);

    if (req.query.user && posts[0] && !posts[0].feedback.isViewed) {
        await PostModel.update(
            { _id: mongoose.Types.ObjectId(req.params.postId) },
            { $push: { 'feedback.view': mongoose.Types.ObjectId(req.query.user) } },
        );
    }

    res.json(posts[0] || {});
});

/*
 * @POST
 * @desc create new post
 * @auth - required
 *
 * @params {postId} - post id
 * */
export const createPost = errorWrapper(async (req, res) => {
    const post = await PostModel.create({
        ...req.body,
        tags: generateTags(req.body.tags),
        banner: (req.file && req.file.filename) || null,
        user: req.user._id,
    });

    await UserModel.update({ _id: req.user._id }, { $push: { posts: mongoose.Types.ObjectId(post._id) } });
    res.status(201).json(post);
});

/*
 * @DELETE
 * @desc delete post
 * @auth - required
 *
 * @params {postId} - post id
 * */
export const deletePost = errorWrapper(async (req, res) => {
    if (req.post.user.toString() !== req.user._id.toString())
        newError('You dont have permission to delete this post', 403);

    // clean uploads
    if (req.post.banner) {
        fs.unlink(path.join(process.cwd(), 'uploads', req.post.banner), err => {
            if (err) newError('Error with comment attachment', 500);
        });
    }

    // clean user info
    req.user.posts = req.user.posts.filter(item => item.toString() !== req.params.postId);
    await req.user.save();

    // clean comments
    const comments = await CommentModel.find({ post: req.post._id }, ['attachment']);
    if (comments.length) {
        comments.forEach(item => {
            if (item && item.attachment) {
                fs.unlink(path.join(process.cwd(), 'uploads', item.attachment), err => {
                    if (err) newError('Error with comment attachment', 500);
                });
            }
        });
    }
    await CommentModel.deleteMany({ post: req.post._id });

    // delete post
    await req.post.delete();
    res.status(201).send(req.post._id);
});

/*
 * @PUT
 * @desc handle post banner actions update/delete
 * @auth - required
 *
 * @params {postId} - post id
 * */
export const updatePostBanner = errorWrapper(async (req, res) => {
    if (req.post.user.toString() !== req.user._id.toString())
        newError('You dont have permission to edit this post', 403);

    // clean uploads
    if (req.post.banner) {
        fs.unlink(path.join(process.cwd(), 'uploads', req.post.banner), err => {
            if (err) newError('Error with comment attachment', 500);
        });
    }

    req.post.banner = (req.file && req.file.filename) || null;
    await req.post.save();
    res.status(201).send(req.post.banner);
});
