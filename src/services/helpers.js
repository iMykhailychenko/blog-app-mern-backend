import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import UserModel from '../api/users/users.model';

/*
 * @navigation
 *
 * 1 GENERAL
 * 2 CONTROLLERS
 * 3 AGGREGATION
 * */

// GENERAL HELPERS
export const errorWrapper = func => async (req, res, next) => {
    try {
        await func(req, res, next);
    } catch (err) {
        res.status(err.code || 500).send({
            massage: err.message || 'Internal error',
        });
    }
};

export const newError = (message = '', code) => {
    const err = new Error(message);
    err.code = code;
    return err;
};

export const generateTags = str => {
    const arr = str
        .trim()
        .toLowerCase()
        .split(' ');
    const cutArr = arr.length > 15 ? arr.slice(0, 15) : arr;
    return cutArr.map(item => (item.length > 15 ? item.slice(0, 25) : item));
};

// CONTROLLERS HELPERS
export const updateUserStatic = file => {
    if (file) {
        fs.unlink(path.join(process.cwd(), 'uploads', file), err => {
            if (err) newError('Error with file', 500);
        });
    }
};

// AGGREGATION HELPERS
export const $addLVD = (id, view = true) => {
    const $addFields = {
        // count elements
        'feedback.like': { $size: '$feedback.like' },
        'feedback.dislike': { $size: '$feedback.dislike' },
        // user targeting
        'feedback.isLiked': {
            $size: {
                $setIntersection: ['$feedback.like', [mongoose.Types.ObjectId(id) || null]],
            },
        },
        'feedback.isDisliked': {
            $size: {
                $setIntersection: ['$feedback.dislike', [mongoose.Types.ObjectId(id) || null]],
            },
        },
    };

    if (view) {
        $addFields['feedback.view'] = { $size: '$feedback.view' };
        $addFields['feedback.isViewed'] = {
            $size: {
                $setIntersection: ['$feedback.view', [mongoose.Types.ObjectId(id) || null]],
            },
        };
    }

    return { $addFields };
};

export const $lookupUser = () => ({
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
});

export const $pagination = (page, limit) => ({
    $facet: {
        pagination: [{ $count: 'total' }],
        data: [{ $skip: page * limit }, { $limit: limit }],
    },
});
