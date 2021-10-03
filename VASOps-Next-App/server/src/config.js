const config = {}
const { v1: uuidv1} = require('uuid')
const {systemLogger, consoleLogger} = require('./utils/logger')
require('dotenv').config() 

//URI of cosmosdb
config.host = process.env.HOST || "https://localhost:8081"
//Primary Key of cosmosdb
config.authKey =
    process.env.AUTH_KEY || "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=="
//Name of Database
config.databaseId = "VasOps"
//Name of Item collection
config.containerIdItem = "Items"
//Name of Setting collection
config.containerIdSetting = "Settings"
//Name of Users collection
config.containerIdUsers = "Users"
//Name of Audits collection
config.containerIdAudits = "Audits"


//Connection String for Blob Storage
config.blobConnectString = process.env.AZURE_STORAGE_CONNECTION_STRING || "AccountName=devstoreaccount1AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==DefaultEndpointsProtocol=httpBlobEndpoint=http://127.0.0.1:10000/devstoreaccount1QueueEndpoint=http://127.0.0.1:10001/devstoreaccount1TableEndpoint=http://127.0.0.1:10002/devstoreaccount1"
//Name of Blob contatiner
config.blobContainerName = "vasops" + uuidv1()
//Name of Blob
config.blobName = "blob" + uuidv1()



//Setup information
if (config.host.includes("https://localhost:")) {
  consoleLogger.info("Local environment detected")
  consoleLogger.warn("WARNING: Disabled checking of self-signed certs. Do not have this code in production.")
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
  //console.log(`Go to http://localhost:${process.env.PORT || '3000'}/itemOperation to run a Get Request.`)
  consoleLogger.info(`Go to http://localhost:${process.env.PORT || '3000'}/itemOperation to run a Get Request.`)
  // systemLogger.info(`Server Started on port:${process.env.PORT || '3000'}`)
}

//Export config parameters
module.exports = config