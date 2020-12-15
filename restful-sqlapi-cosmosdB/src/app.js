//Required documents
const CosmosClient = require('@azure/cosmos').CosmosClient

const config = require('./config')

const ItemOperation = require('./routes/itemOperation')
const SettingOperation = require('./routes/settingOperation')
const ItemEntry = require('./models/itemEntry')
const Setting = require('./models/setting')

const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

//Run express
const app = express()

// <-- Commented out
// view engine setup
// app.set('views', path.join(__dirname, 'views'))
// app.set('view engine', 'jade')

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
//app.use(express.static(path.join(__dirname, 'public')))

//New instances
const cosmosClient = new CosmosClient({
  endpoint: config.host,
  key: config.authKey
})

const itemEntry = new ItemEntry(cosmosClient, config.databaseId, config.containerIdItem)
const itemOperation = new ItemOperation(itemEntry)
const setting = new Setting(cosmosClient, config.databaseId, config.containerIdSetting)
const settingOperation = new SettingOperation(setting)

//Intialiaze itemEntry
itemEntry
  .init(err => {
    console.error(err)
  })
  .catch(err => {
    console.error(err)
    console.error(
      'Shutting down because there was an error setting up the database.'
    )
    process.exit(1)
  })

//Intialize Setting
setting
  .init(err => {
    console.error(err)
  })
  .catch(err => {
    console.error(err)
    console.error(
      'Shutting down because there was an error setting up the database.'
    )
    process.exit(1)
  })


//Item Operations
app.get('/item', (req, res, next) => itemOperation.showItems(req, res).catch(next))

app.get('/item/:id', (req, res, next) => itemOperation.showByIdItems(req, res).catch(next))

app.post('/item/addItem', (req, res, next) => itemOperation.addItem(req, res).catch(next))
 
app.delete('/item/:id', (req, res, next) => itemOperation.deleteItem(req,res).catch(next))

app.patch('/item/:id', (req, res, next) => itemOperation.updateItem(req,res).catch(next))

app.put('/item/:id/replaceItem', (req, res, next) => itemOperation.Item(req,res).catch(next))



//Settings Operations
app.get('/setting', (req, res, next) => settingOperation.showSettings(req, res).catch(next))

app.get('/setting/:id', (req, res, next) => settingOperation.showByIdSettings(req, res).catch(next))

app.post('/setting/addSetting', (req, res, next) => settingOperation.addSetting(req, res).catch(next))
 
app.delete('/setting/:id', (req, res, next) => settingOperation.deleteSetting(req,res).catch(next))

app.patch('/setting/:id', (req, res, next) => settingOperation.updateSetting(req,res).catch(next))

app.put('/setting/:id', (req, res, next) => settingOperation.replaceSetting(req,res).catch(next))
 

// <-- Commented out
// app.set('view engine', 'jade')

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.json({
    message: err.message,
    error: err
  });
})

module.exports = app