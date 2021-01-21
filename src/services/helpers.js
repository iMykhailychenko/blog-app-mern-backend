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
