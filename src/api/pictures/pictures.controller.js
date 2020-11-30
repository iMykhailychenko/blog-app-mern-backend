import path from 'path';
import { errorWrapper } from '../../services/helpers';

const imgDir = path.join(process.cwd(), 'static');

export const getPictures = errorWrapper(async (req, res) => {
  const pictures = Array(10).fill('');
  res
    .status(200)
    .json(pictures.map((_, index) => path.join(imgDir, `${index + 1}.jpeg`)));
});

export const randomPicture = errorWrapper(async (req, res) => {
  const num = Math.ceil(Math.random() * 10);
  res
    .status(200)
    .json({ url: path.join(process.cwd(), 'static', `${num + 1}.jpeg`) });
});
