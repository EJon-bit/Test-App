const CosmosClient = require('@azure/cosmos').CosmosClient
const { BlobServiceClient } = require('@azure/storage-blob')
const debug = require('debug')('vasops:auditLogs')
require('dotenv').config() 
const { v1: uuidv1} = require('uuid')
const {systemLogger, consoleLogger, debugLogger} = require('../utils/logger')
const merge = require('deepmerge')
// For simplicity we'll set a constant partition key
// @ts-ignore 
const partitionKey = undefined
class AuditLogs {
  /**
  * Manages reading, adding, and updating Tasks in Cosmos DB
  * @param {CosmosClient} cosmosClient
  * @param {string} databaseId
  * @param {string} containerId
  * 
  */
  constructor(cosmosClient, databaseId, containerId) {
    this.client = cosmosClient
    this.databaseId = databaseId
    this.collectionId = containerId    
    
    this.database = null
    this.container = null
  }

  //Initialization of the database
  async init() {
    debugLogger.debug("Setting up database..")
    debug('Setting up the database...')
    const dbResponse = await this.client.databases.createIfNotExists({
      id: this.databaseId
    })

    this.database = dbResponse.database
    debugLogger.debug("Setting up database..done!")
    debug('Setting up the database...done!')
    debug('Setting up the container...')

    const coResponse = await this.database.containers.createIfNotExists({
      id: this.collectionId     
    })

    this.container = coResponse.container
    
    debugLogger.debug("Setting up database..done!")
    debug('Setting up the container...done!')
  }

  async find(querySpec) {
    debug('Querying for items from the database')
    if (!this.container) {
      throw new Error('Collection is not initialized.')
    }
    //Query function to search using SQL Query
    const { resources } = await this.container.items.query(querySpec).fetchAll()
    return resources
  }

  async getLog(userId) {
    debug('Getting an item from the database')
    const { resource } = await this.container.item(userId).read()
    return resource
  }

  async updateLog(updatedData){
    // console.log("The id is", id);   
    //fetch log from db based on user id and merge    
    const {resource : replacement} = await this.container.item(updatedData.id).replace(updatedData);
    return replacement
  }

  async addLog(log) {
    console.log(log)
    consoleLogger.info(log.user_id);
    //user.id = user.userid 
    const { resource: doc } = await this.container.items.create(log)
    return doc
  }
}
module.exports = AuditLogs
