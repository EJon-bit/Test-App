const fetch = require('node-fetch');
const cron = require('node-cron');
const fs = require('fs');
const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');
var Imap = require('imap'),
inspect = require('util').inspect;
var fs = require('fs'), fileStream;


/*
* * * * * *
| | | | | |
| | | | | day of week
| | | | month
| | | day of month
| | hour
| minute
second ( optional )
*/

//daily at 4 p.m.
cron.schedule('0 16 * * *', function() {

})