import mongoose from 'mongoose';
import { errorWrapper, newError } from '../../services/helpers';
import UserModel from './users.model';

export const getUser = errorWrapper(async (req, res) => {
    const { _id, email, name, surname, nick, avatar } = req.user;
    res.status(200).json({ _id, name, surname, nick, email, avatar });
});

export const getUserById = errorWrapper(async (req, res) => {
    const user = await UserModel.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(req.params.userId) } },
        {
            $lookup: {
                from: 'users',
                localField: 'followers',
                foreignField: '_id',
                as: 'followers',
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'following',
                foreignField: '_id',
                as: 'following',
            },
        },
        {
            $project: {
                posts: 0,
                tokens: 0,
                password: 0,
                __v: 0,
                'followers.posts': 0,
                'followers.tokens': 0,
                'followers.password': 0,
                'followers.__v': 0,
                'followers.followers': 0,
                'followers.following': 0,
                'following.posts': 0,
                'following.tokens': 0,
                'following.password': 0,
                'following.__v': 0,
                'following.followers': 0,
                'following.following': 0,
            },
        },
    ]);

    res.status(200).json(user);
});

export const putFollowers = errorWrapper(async (req, res) => {
    const target = await UserModel.findById(req.params.userId);
    if (!target) newError(`Not found user with id: ${req.params.userId}`, 404);

    if (req.user.following.includes(req.params.userId)) {
        req.user.following = req.user.following.filter(id => id.toString() !== req.params.userId);
        await req.user.save();

        target.followers = target.followers.filter(id => id.toString() !== req.user._id.toString());
        await target.save();

        res.status(201).json({ type: 'unsubscribe' });
        return;
    }

    req.user.following.push(req.params.userId);
    await req.user.save();

    target.followers.push(req.user._id);
    await target.save();

    res.status(201).json({ type: 'subscribe' });
});

export const searchFollowers = errorWrapper(async (req, res) => {
    const page = req.query.page - 1 || 0;
    const limit = +req.query.limit || 15;

    let pipeline = [
        { $match: { following: req.params.userId } },
        {
            $project: {
                posts: 0,
                feedback: 0,
                tokens: 0,
                password: 0,
                followers: 0,
                following: 0,
                __v: 0,
            },
        },
        { $sort: { posts: -1 } },
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
                        { name: new RegExp(req.query.q, 'gi') },
                        { surname: new RegExp(req.query.q, 'gi') },
                        { nick: new RegExp(req.query.q, 'gi') },
                    ],
                },
            },
            ...pipeline,
        ];

    const followers = await UserModel.aggregate(pipeline);
    res.status(200).json(followers[0]);
});

export const searchFollowing = errorWrapper(async (req, res) => {
    const page = req.query.page - 1 || 0;
    const limit = +req.query.limit || 15;

    let pipeline = [
        { $match: { followers: req.params.userId } },
        {
            $project: {
                posts: 0,
                feedback: 0,
                tokens: 0,
                password: 0,
                followers: 0,
                following: 0,
                __v: 0,
            },
        },
        { $sort: { posts: -1 } },
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
                        { name: new RegExp(req.query.q, 'gi') },
                        { surname: new RegExp(req.query.q, 'gi') },
                        { nick: new RegExp(req.query.q, 'gi') },
                    ],
                },
            },
            ...pipeline,
        ];

    const following = await UserModel.aggregate(pipeline);
    res.status(200).json(following[0]);
});
