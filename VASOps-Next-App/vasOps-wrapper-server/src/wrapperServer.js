const express = require('express') 
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const cors = require('cors')

const {systemLogger, consoleLogger, debugLogger} = require('./utils/logger')

const app = express()
app.use(cookieParser())
app.use(fileupload())
app.use(cors())