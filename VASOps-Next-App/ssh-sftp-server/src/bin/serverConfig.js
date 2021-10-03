#!/usr/bin/env node
// Server Config file sets up the server and uses the server.js file 

/**
 * Module dependencies.
 */
 const sshApp = require('../server');
 const http = require('http');

 
 const {systemLogger, consoleLogger} = require('../utils/logger')
 
 /**
  * Get port from environment and store in Express.
  */
 
 const port = normalizePort(process.env.PORT || '5100');
 sshApp.set('port', port);
 consoleLogger.info(`Server Running on ${port}`)
 
 /**
  * Create HTTP server.
  */
 
 const server = http.createServer(sshApp);
 
 /** 
  * Listen on provided port, on all network interfaces.
  */
 
 server.listen(port);
 server.on('error', onError);
 server.on('listening', onListening);
 
 /**
  * Normalize a port into a number, string, or false.
  */
 
 function normalizePort(val) {
   const port = parseInt(val, 10);
 
   if (isNaN(port)) {
     // named pipe
     return val;
   }
 
   if (port >= 0) {
     // port number
     return port;
   }
 
   return false;
 }
 
 /**
  * Event listener for HTTP server "error" event.
  */
 
 function onError(error) {
   if (error.syscall !== 'listen') {
     throw error;
   }
 
   const bind = typeof port === 'string'
     ? 'Pipe ' + port
     : 'Port ' + port;
 
   // handle specific listen errors with friendly messages
   switch (error.code) {
     case 'EACCES':
       console.error(bind + ' requires elevated privileges');
       process.exit(1);
       break;
     case 'EADDRINUSE':
       console.error(bind + ' is already in use');
       process.exit(1);
       break;
     default:
       throw error;
   }
 }
 
 /**
  * Event listener for HTTP server "listening" event.
  */
 
 function onListening() {
   const addr = server.address();
   const bind = typeof addr === 'string'
     ? 'pipe ' + addr
     : 'port ' + addr.port;
  // debug('Listening on ' + bind);
 }
 