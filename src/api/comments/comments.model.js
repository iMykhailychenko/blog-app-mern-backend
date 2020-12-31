import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
  edited: { type: Date, default: null },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  post: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Post' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  attachment: { type: String, default: null },
  feedback: {
    like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislike: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
});

export default mongoose.model('Comment', CommentSchema);
