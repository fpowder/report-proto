import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import * as process from 'process';

const logDir = `${process.cwd()}/logs`;
const appName = 'daily traffic-illegalParking data sync';

export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.ms(),
        format.simple(),
        format.prettyPrint()
    ),
    transports: [
        new DailyRotateFile({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: `${logDir}`,
            filename: `${appName}-out.log`,
            maxSize: null,
            maxFiles: 14
        }),
        new DailyRotateFile({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: `${logDir}`,
            filename: `${appName}-error.log`,
            maxSize: null,
            maxFiles: 14
        }),
       new transports.Console()
    ]
});



