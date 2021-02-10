import mongoose from 'mongoose';
import { newError } from '../../services/helpers';

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    desc: { type: String, default: '' },
    top: { type: Number, default: 0 },
    edited: { type: Date, default: null },
    banner: { type: String, default: null },
    favorite: { type: Boolean, default: false },
    tags: {
        type: Array,
        default: null,
        validate: {
            validator(tags) {
                if (tags.length > 15) throw newError('To many tags', 400);
            },
        },
    },
    date: { type: Date, default: Date.now },
    content: { type: String, required: true },
    feedback: {
        view: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        dislike: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
});

export default mongoose.model('Post', PostSchema);
