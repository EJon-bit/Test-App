#VasOps SSH-SFTP Server

## This server uses Express, Node.js 

## Setup 
>> Instructions to Run the Sample:
 1) Clone the repository:
 - `https://dev.azure.com/Digicel-DevOps/JAM_VAS_Applications/_git/VASOps`
 2) Using a CMD terminal navigate (command: 'cd') into the `ssh-sftp-server` folder. `cd ssh-sftp-server`
 3) Install dependencies using:`npm i or npm install`
 4) Start the Server using the command, `npm start`

### Information 

>> Modules used:
+ [SSH2](https://www.npmjs.com/package/ssh2)
+ [Winston Logger](https://www.npmjs.com/package/winston)

>> Server information:

1) Server setup and Port information is given in the `src/bin/www.js` folder.
2) The `server.js` file contains all the routes .
3) Navigating to `src/controllers` will show `sshRequests.js` and `sftpRequests.js` files which contain ssh and sftp functions respectively.

>> Logging information

1) Navigating to `src/utils/logger.js` will show winston.js logger setup.
2) Navigating to `src/logs` will show a `system.log` file which shows logged information.