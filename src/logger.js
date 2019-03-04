import winston from 'winston'

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console()
    ]
});

export default logger;