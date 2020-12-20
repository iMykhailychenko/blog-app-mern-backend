import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { newError } from '../../services/helpers';
import config from '../../services/config';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  nick: { type: String, required: true },
  avatar: { type: String, default: null },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(email) {
        const { error } = Joi.string()
          .email()
          .validate(email);

        if (error) throw newError('Email is not valid', 422);
      },
    },
  },
  password: { type: String, required: true },
  tokens: [
    {
      token: { type: String, required: true },
      expires: { type: Date, required: true },
    },
  ],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
});

UserSchema.static(
  'hashPassword',
  async password => await bcrypt.hash(password, config.auth.salt),
);

UserSchema.method('isPasswordValid', async function(password) {
  return await bcrypt.compare(password, this.password);
});

UserSchema.method('createToken', async function(remember = false) {
  const token = await jwt.sign({ id: this._id }, config.auth.accessKey);

  this.tokens = [
    ...this.tokens,
    {
      token,
      expires: new Date().getTime() + (remember ? 7 : 1) * 24 * 60 * 60 * 1000,
    },
  ];

  await this.save();

  return token;
});

UserSchema.pre('save', async function() {
  if (this.isNew) {
    this.password = await this.constructor.hashPassword(this.password);
  }
});

export default mongoose.model('User', UserSchema);
