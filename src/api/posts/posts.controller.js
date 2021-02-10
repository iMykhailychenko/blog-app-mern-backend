import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { errorWrapper, newError, generateTags } from '../../services/helpers';
import PostModel from './posts.model';
import CommentModel from '../comments/comments.model';

export const getPosts = errorWrapper(async (req, res) => {
    const page = req.query.page - 1 || 0;
    const limit = +req.query.limit || 15;

    let pipeline = [
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
        { $sort: { top: -1, date: -1 } },
        { $project: { content: 0, favorite: 0, user: 0, top: 0, __v: 0 } },
        {
            $facet: {
                pagination: [{ $count: 'total' }],
                data: [{ $skip: page * limit }, { $limit: limit }],
            },
        },
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
    res.status(201).json({ posts: posts[0].data, total: posts[0].pagination[0] ? posts[0].pagination[0].total : null });
});

export const getTopPost = errorWrapper(async (req, res) => {
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
        { $sort: { top: -1, date: -1 } },
        { $project: { content: 0, favorite: 0, user: 0, top: 0, __v: 0 } },
    ]);

    res.status(201).json({ posts: posts[0].data, total: posts[0].pagination[0] ? posts[0].pagination[0].total : null });
});

export const getUserPosts = errorWrapper(async (req, res) => {
    const page = req.query.page - 1 || 0;
    const limit = +req.query.limit || 15;

    const posts = await PostModel.aggregate([
        { $match: { user: mongoose.Types.ObjectId(req.params.userId) } },
        { $project: { content: 0, favorite: 0, user: 0, top: 0, __v: 0 } },
        { $sort: { date: -1 } },
        {
            $facet: {
                pagination: [{ $count: 'total' }],
                data: [{ $skip: page * limit }, { $limit: limit }],
            },
        },
    ]);

    res.status(201).json({ posts: posts[0].data, total: posts[0].pagination[0].total });
});

export const updatePost = errorWrapper(async (req, res) => {
    const post = await PostModel.findById(req.params.postId);

    if (!post) newError('Not found', 404);
    if (req.user._id.toString() !== post.user.toString()) newError('Post edit forbidden for this user', 403);

    post.title = req.body.title;
    post.desc = req.body.desc;
    post.tags = req.body.tags;
    post.content = req.body.content;
    await post.save();

    res.status(200).json(post);
});

export const getSinglePosts = errorWrapper(async (req, res) => {
    const post = await PostModel.findById(req.params.postId).populate('user', ['avatar', 'name', 'surname', 'nick']);

    if (req.query.user && !post.feedback.view.includes(req.query.user)) {
        post.feedback.view.push(req.query.user);
        post.top += 1;
        await post.save();
    }

    res.status(200).json(post);
});

export const createPost = errorWrapper(async (req, res) => {
    const post = await PostModel.create({
        ...req.body,
        tags: generateTags(req.body.tags),
        banner: (req.file && req.file.filename) || null,
        user: req.user._id,
    });

    req.user.posts.push(post._id);
    await req.user.save();

    res.status(201).json(post);
});

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
    const comments = await CommentModel.find({ post: req.post._id });
    comments.forEach(item => {
        if (item && item.attachment) {
            fs.unlink(path.join(process.cwd(), 'uploads', item.attachment), err => {
                if (err) newError('Error with comment attachment', 500);
            });
        }
    });
    await CommentModel.deleteMany({ post: req.post._id });

    // delete post
    await req.post.delete();

    res.status(200).send(req.post._id);
});

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
