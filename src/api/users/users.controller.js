import mongoose from 'mongoose';
import { $addLVD, $pagination, errorWrapper, newError } from '../../services/helpers';
import UserModel from './users.model';

/*
 * @GET
 * @desc get general user info
 * @auth - required
 * */
export const getUser = errorWrapper(async (req, res) => {
    const { _id, email, name, surname, nick, avatar } = req.user;
    res.status(200).json({ _id, name, surname, nick, email, avatar });
});

/*
 * @GET
 * @desc get all user info by id
 * @auth - not required
 *
 * @params {userId} - user id
 * */
export const getUserById = errorWrapper(async (req, res) => {
    const pipeline = [
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
            $addFields: {
                hasEmail: { $toBool: '$email' },
                hasPassword: { $toBool: '$password' },
            },
        },
        $addLVD({ id: req.params.userId, queue: true }),
        {
            $project: {
                posts: 0,
                tokens: 0,
                password: 0,
                queue: 0,
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
    ];

    console.log(req.user._id);

    const user = await UserModel.aggregate(pipeline);
    res.json(user);
});

/*
 * @PUT
 * @desc subscribe/unsubscribe on user updates
 * @auth - required
 *
 * @params {userId} - user id
 * */
export const putFollowers = errorWrapper(async (req, res) => {
    const target = await UserModel.findById(req.params.userId, ['following', 'followers']);
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

/*
 * @desc local helper that create pipeline array as it almost the sema for next endpoints
 *
 * @param type - type of request 'following'|'followers'
 * @param user - user id
 * @param page - page for pagination
 * @param limit - limit for pagination
 * */
const $searchPipeline = (type, user, page, limit) => [
    { $match: { [type]: mongoose.Types.ObjectId(user) } },
    {
        $project: {
            posts: 0,
            feedback: 0,
            queue: 0,
            tokens: 0,
            password: 0,
            followers: 0,
            following: 0,
            __v: 0,
        },
    },
    { $sort: { posts: -1 } },
    $pagination(page, limit),
];

/*
 * @desc local helper that create pipeline array for search query
 *
 * @param query - type of request 'following'|'followers'
 * */
const $searchQuery = query => [
    {
        $match: {
            $or: [
                { name: new RegExp(query, 'gi') },
                { surname: new RegExp(query, 'gi') },
                { nick: new RegExp(query, 'gi') },
            ],
        },
    },
];

/*
 * @GET
 * @desc search who user follows
 * @auth - required
 *
 * @params {userId} - user id
 *
 * @query {page} - current page/pagination
 * @query {limit} - posts per page/pagination
 * @query {q} - search query
 * */
export const searchFollowers = errorWrapper(async (req, res) => {
    const page = req.query.page - 1 || 0;
    const limit = +req.query.limit || 15;

    let pipeline = $searchPipeline('following', req.params.userId, page, limit);
    if (req.query.q) pipeline = [...$searchQuery(req.query.q), ...pipeline];

    const followers = await UserModel.aggregate(pipeline);
    res.json({
        users: followers[0].data,
        count: followers[0].pagination[0] ? followers[0].pagination[0].total : 0,
        total: followers[0].pagination[0] ? Math.ceil(followers[0].pagination[0].total / limit) : 1,
    });
});

/*
 * @GET
 * @desc search user followers
 * @auth - required
 *
 * @params {userId} - user id
 *
 * @query {page} - current page/pagination
 * @query {limit} - posts per page/pagination
 * @query {q} - search query
 * */
export const searchFollowing = errorWrapper(async (req, res) => {
    const page = req.query.page - 1 || 0;
    const limit = +req.query.limit || 14;

    let pipeline = $searchPipeline('followers', req.params.userId, page, limit);
    if (req.query.q) pipeline = [...$searchQuery(req.query.q), ...pipeline];

    const following = await UserModel.aggregate(pipeline);
    res.json({
        users: following[0].data,
        count: following[0].pagination[0].total,
        total: following[0].pagination[0] ? Math.ceil(following[0].pagination[0].total / limit) : 1,
    });
});
