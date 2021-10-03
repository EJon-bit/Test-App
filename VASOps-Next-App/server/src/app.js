/* Module Dependencies*/
const CosmosClient = require('@azure/cosmos').CosmosClient
const config = require('./config')
const express = require('express') 
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const cors = require('cors')
const  fileupload = require('express-fileupload')
const {systemLogger, consoleLogger, debugLogger} = require('./utils/logger')

/* Controllers */ 
const AuditOperation = require('./controllers/auditOperation')
const ItemOperation = require('./controllers/itemOperation')
const ModuleOperation = require('./controllers/moduleOperation')
const SettingOperation = require('./controllers/settingOperation')
const UserOperation = require('./controllers/userOperation')
const ItemHelpers = require('./controllers/helperFunctions/itemHelpers')


/* Models */ 
const AuditLogs = require('./models/AuditLogs')
const ItemEntry = require('./models/ItemEntry')  
const Modules = require('./models/Modules')
const Setting = require('./models/Setting')
const Users = require('./models/Users')



/* Run Express */
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(fileupload())
app.use(cors())


/* Instantiation  */
const cosmosClient = new CosmosClient({
  endpoint: config.host,
  key: config.authKey
})


const auditLogs = new AuditLogs(cosmosClient, config.databaseId, config.containerIdAudits)
const auditOperation = new AuditOperation(auditLogs);

const setting = new Setting(cosmosClient, config.databaseId, config.containerIdSetting)
const settingOperation = new SettingOperation(setting, auditOperation)


const itemEntry = new ItemEntry(cosmosClient, config.databaseId, config.containerIdItem)
const itemHelpers = new ItemHelpers(itemEntry)
const itemOperation = new ItemOperation(itemEntry, auditOperation, settingOperation, itemHelpers)

const mod = new Modules(cosmosClient, config.databaseId, config.containerIdSetting)
const moduleOperation = new ModuleOperation(mod)


const users = new Users(cosmosClient, config.databaseId, config.containerIdUsers)
const userOperation = new UserOperation(users)




/* Database collection initialization */
const modelClassInstance = [itemEntry, setting, users, auditLogs]

modelClassInstance.forEach((modelInstance)=>{
  modelInstance
  .init(err => {
    consoleLogger.error(err)
    //console.error(err)
  }) 
  .catch(err => {
    consoleLogger.error("Shutting down because there was an error setting up the database.")
    consoleLogger.error(err)
    systemLogger.error(`Failed to initialize database ${err}`)
    //console.error(err)
    // console.error(
    //   'Shutting down because there was an error setting up the database.'
    // )
    process.exit(1)
  })
})

/* Login Operations */ 

app.get('/user/', (req, res, next) => {

  //userOperation.showItems(req, res).catch(next)
  systemLogger.info(`${req.originalUrl} - ${req.method} - ${req.ip}`)

})

app.post('/createUser', (req, res, next) => {
  
  userOperation.addUser(req, res).catch(next)
  systemLogger.info(`${req.originalUrl} - ${req.method} - ${req.ip} `)
})

app.post('/login', (req, res, next) => {
  
  userOperation.loginUser(req, res).catch(next)
  systemLogger.info(`${req.originalUrl} - ${req.method} - ${req.ip}`)
 
})

/* ITEM/JOB OPERATIONS */ 

/** Delete Requests **/
app.delete('/itemOperation/delItems', (req, res, next) => {
  itemOperation.deleteItem(req,res).catch(next)
  systemLogger.info(`${req.originalUrl} - ${req.method} - ${req.ip}`)

})

app.delete('/itemOperation/:id', (req, res, next) => {
  itemOperation.deleteItem(req,res).catch(next)
  systemLogger.info(`${req.originalUrl} - ${req.method} - ${req.ip}`)

})

/** Get Requests  **/

// Get all Items 
app.get('/itemOperation', (req, res, next) => {
  itemOperation.showItems(req, res).catch(next)
  systemLogger.info(`${req.originalUrl} - ${req.method} - ${req.ip}`)

})

// Get Item by Id
app.get('/itemOperation/:id', (req, res, next) => {
  itemOperation.showByIdItems(req, res).catch(next)
  systemLogger.info(`${req.originalUrl} - ${req.method} - ${req.ip}`)
})

// Get Item by Operation Type
app.get('/itemOperation/opType/:typeOp', (req, res, next) => {
  itemOperation.showByOperation(req, res).catch(next)
  systemLogger.info(`${req.originalUrl} - ${req.method} - ${req.ip}`)
})

/** Patch Request **/
app.patch('/itemOperation/:id', (req, res, next) => {
 
  itemOperation.replaceItem(req,res).catch(next)
  systemLogger.info(`${req.originalUrl} - ${req.method} - ${req.ip}`)

})

/** Post Requests**/
 
app.post('/itemOperation/addItem', async(req, res, next) => {
  
  const item = await itemOperation.addItem(req, res).catch(next)
  res.json(item)
  //trigger function
  itemOperation.executeItem(item).catch(next);
  systemLogger.info(`${req.originalUrl} - ${req.method} - ${req.ip}`)
})

app.post('/itemOperation/executeJob', async(req, res, next) => {
  const item = req.body
  console.log("item", item);
  const executeVal = await itemOperation.executeItem(item).catch(next);

  if (executeVal==="Done"){
    res.json("Done");
  }
  systemLogger.info(`${req.originalUrl} - ${req.method} - ${req.ip}`)
})

/** Put Requests **/

app.put('/itemOperation/:id', (req, res, next) => {
  
  itemOperation.updateItem(req,res).catch(next)
  systemLogger.info(`${req.originalUrl} - ${req.method} - ${req.ip}`)

})

app.put('/updateAttachment', (req, res, next) => {
  itemOperation.updateAttachments(req.body, res).catch(next)
  //systemLogger.info(`${req.originalUrl} - ${req.method} - ${req.ip}`)

})

/*AuditLog Requests*/ 
app.get('/auditOperation/opType/:typeOp', async(req, res, next) => {
  
  const itemAuditLogs = await auditOperation.fetchAuditLogs(req.params.typeOp, 'ItemEntries').catch(next)
  
  const settingAuditLogs= await auditOperation.fetchAuditLogs(req.params.typeOp, 'Settings').catch(next);
  
  res.json({itemAuditLogs, settingAuditLogs})
  //trigger function
  
  systemLogger.info(`${req.originalUrl} - ${req.method} - ${req.ip}`)
})


/* Settings Requests */

app.delete('/settingOperation/:id', (req, res, next) => settingOperation.deleteSetting(req,res).catch(next))

app.get('/settingOperation', (req, res, next) => settingOperation.showSettings(req, res).catch(next))

app.get('/settingOperation/:id', (req, res, next) => settingOperation.showByIdSettings(req, res).catch(next))

app.get('/settingOperation/opType/:type', (req, res, next) => settingOperation.showByType(req, res).catch(next))

app.patch('/settingOperation/:opType/:id', (req, res, next) => settingOperation.updateSetting(req,res).catch(next))

app.post('/settingOperation/addSetting', (req, res, next) => settingOperation.addSetting(req, res).catch(next))
 
app.put('/settingOperation/updateSettings', (req, res, next) => settingOperation.replaceSetting(req,res).catch(next))
 
/* Log operations */
app.post('/logOperation/addLog', (req, res, next) => auditOperation.createLog(req, res).catch(next))
 

/* Blob Operations */

app.delete('/blobOperation/:id/:link', (req, res, next) => itemOperation.deleteAttachment(req, res).catch(next))

app.patch('/blobOperation/:id', (req, res, next) => itemOperation.uploadAttachment(req, res).catch(next))


/* SSH request */
app.post('/sshReq/:id', (req, res, next) => {

  moduleOperation.getAuth(req, res).catch(next)
  systemLogger.info(`${req.originalUrl} - ${req.method} - ${req.ip}`)

})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function(err, req, res, next) {
  console.log("The error is", err);
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  
  // render the error page
  res.status(err.status || 500)
  res.json({
    message: err.message,
    error: err
  })
})

module.exports = app