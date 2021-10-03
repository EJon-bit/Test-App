const fetch = require('node-fetch');
const cron = require('node-cron');
const fs = require('fs');
const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');


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

//monthly at 4 a.m.
cron.schedule('0 9 1 * *', function() {

})