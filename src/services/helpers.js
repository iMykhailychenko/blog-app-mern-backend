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
