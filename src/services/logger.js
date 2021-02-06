import fs from 'fs';
import path from 'path';
import morgan from 'morgan';

const stream = fs.createWriteStream(path.join(process.cwd(), 'access.log'), { flags: 'a' });
morgan.token('auth', req => req.headers.authorization);

const logFilePath = path.join(process.cwd(), 'access.log');
const clearLogFile = async () => {
    const date = new Date();
    try {
        await fs.promises.writeFile(
            logFilePath,
            `info START NEW SESSION: ${date.getDate()}/${date.getMonth() +
                1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()} \n\n`,
            'utf8',
        );
        console.error('\x1b[32mLog file cleared\x1b[0m');
    } catch (e) {
        console.error('\x1b[31mError with access.log file\x1b[0m');
    }
};

const ONE_HOUR_IN_MS = 3600000;
const init = async () => {
    await clearLogFile();
    setInterval(clearLogFile, ONE_HOUR_IN_MS);
};

const middleware = morgan(
    'info :method :url HTTP/:http-version \nwarning :status :referrer \nuser-agent: :user-agent \nauth: :auth\n',
    {
        stream,
        skip: req => req.headers.accept.includes('image'),
    },
);

export default { init, middleware };
