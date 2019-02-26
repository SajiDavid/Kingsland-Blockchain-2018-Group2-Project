const {
  createLogger,
  format,
  transports
} = require('winston');
const fs = require('fs');
const path = require('path');
const winstonRotator = require('winston-daily-rotate-file');
const logDir = 'log';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const filename = path.join(logDir, 'chainlogger.log');
const logger = createLogger({
  // change level if in dev environment versus production
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize(),
        format.printf(
          info => `${info.timestamp} ${info.level} : ${info.message}`
        )
      )
    }),
    new transports.File({
      filename
    })
  ]
});
const successLogger = logger;

// const successLogger = logger;
// successLogger.add(winstonRotator, {
//   'name': 'access-file',
//   'level': 'info',
//   'filename': './logs/access.log',
//   'json': false,
//   'datePattern': 'yyyy-MM-dd-',
//   'prepend': true
// });

const errorLogger = logger;
// errorLogger.add(winstonRotator, {
//   'name': 'error-file',
//   'level': 'error',
//   'filename': './logs/error.log',
//   'json': false,
//   'datePattern': 'yyyy-MM-dd-',
//   'prepend': true
// });

module.exports = {
  'successlog': successLogger,
  'errorlog': errorLogger
};