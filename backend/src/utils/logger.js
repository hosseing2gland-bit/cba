import pino from 'pino';

const level = process.env.LOG_LEVEL || 'info';
const isPretty = process.env.LOG_PRETTY === 'true';

const destination = isPretty
  ? pino.transport({
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'SYS:standard' },
  })
  : undefined;

const logger = pino({
  level,
  redact: ['req.headers.authorization', 'password', 'token', 'refreshToken'],
}, destination);

export default logger;
