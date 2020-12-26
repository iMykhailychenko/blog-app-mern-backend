import path from 'path';
import { errorWrapper } from '../../services/helpers';

const imgDir = path.join(process.cwd(), 'static');

export const getPictures = errorWrapper(async (req, res) => {
  const pictures = Array(10).fill('');
  res
    .status(200)
    .json(pictures.map((_, index) => path.join(imgDir, `${index + 1}.jpeg`)));
});

const pictures = [
  'https://pixabay.com/get/53e8d1444854a414f6d1867dda2e3477133cdee34e5077497d267cd2964dc0_1920.jpg',
  'https://pixabay.com/get/53e3d5414b5aa414f6d1867dda2e3477133cdee34e5077497d267cd2924dc5_1920.jpg',
  'https://pixabay.com/get/53e8d4474f55a414f6d1867dda2e3477133cdee34e5077497d267cd2964ac1_1920.jpg',
  'https://pixabay.com/get/55e9d2404a53a814f6d1867dda2e3477133cdee34e5077497d267cd2954cc6_1920.jpg',
  'https://pixabay.com/get/53e6d6464a54a914f6d1867dda2e3477133cdee34e5077497d267cd2954ec5_1920.jpg',
  'https://pixabay.com/get/52e2d2424954a814f6d1867dda2e3477133cdee34e5077497d267cd2944fcd_1920.jpg',
  'https://pixabay.com/get/52e7d3404352a814f6d1867dda2e3477133cdee34e5077497d267cd29448c3_1920.jpg',
  'https://pixabay.com/get/52e7d144495aae14f6d1867dda2e3477133cdee34e5077497d267cd2944ac5_1920.jpg',
  'https://pixabay.com/get/53e5d5444850ac14f6d1867dda2e3477133cdee34e5077497d267cd2934cc3_1920.jpg',
  'https://pixabay.com/get/53e3d34a4d57ae14f6d1867dda2e3477133cdee34e5077497d267cd29349c4_1920.jpg',
];

export const randomPicture = errorWrapper(async (req, res) => {
  const num = Math.ceil(Math.random() * 10);
  res.status(200).send(pictures[num]);
});
