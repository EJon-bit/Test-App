const { createLogger, format, transports, config} = require('winston');
//{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }

const systemLogger = createLogger({

    maxsize: 5242880, // 5MB
    maxFiles: 5,
    handleExceptions: true,
    json: true,

    transports: [
     new transports.File(
          { filename: './src/logs/system.log'})
    ],
 
    format: format.combine(
        format.splat(), 
        format.timestamp({
             format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.align(),
        format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`)
     )
});

const debugLogger = createLogger({

    maxsize: 5242880, // 5MB
    maxFiles: 5,
    transports: [
     new transports.Console()
    ],
 
    format: format.combine(
        format.timestamp({
             format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.align(),
        format.printf(debug => `${[debug.timestamp]}:${debug.level}: : ${debug.message}`)
     )
});

const consoleLogger = createLogger({

    transports: [
     new transports.Console({
          level : "silly"
     })
    ],
 
    format: format.combine(
        format.splat(), 
        format.timestamp({
             format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.align(),
        format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
        format.colorize({all: true})
     )
});

module.exports = {
    debugLogger: debugLogger,
    systemLogger: systemLogger,
    consoleLogger: consoleLogger
};