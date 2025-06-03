import winston from 'winston';
import morgan from 'morgan';
const { combine, timestamp, json } = winston.format;

export const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        json(),
    ),
    defaultMeta: { service: 'patient-service' },
    transports: [
        new winston.transports.Console(),
    ],
})

export const morganMiddleware = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    {
        stream: {
            write: (message) => logger.http(message.trim()),
        },
    },
);