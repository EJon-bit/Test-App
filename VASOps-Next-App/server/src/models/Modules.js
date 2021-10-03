const CosmosClient = require('@azure/cosmos').CosmosClient
const { BlobServiceClient } = require('@azure/storage-blob')
const debug = require('debug')('vasops:Setting')
require('dotenv').config() 
const {systemLogger, consoleLogger, debugLogger} = require('../utils/logger')

// For simplicity we'll set a constant partition key
// @ts-ignore 
const partitionKey = undefined
class Modules {
  /**
  * Manages reading, adding, and updating Tasks in Cosmos DB
  * @param {CosmosClient} cosmosClient
  * @param {string} databaseId
  * @param {string} containerId
  * @param {Array} uri
  */
  constructor(cosmosClient, databaseId, containerId) {
    this.client = cosmosClient
    this.databaseId = databaseId
    this.collectionId = containerId

    this.database = null
    this.container = null
  }

  async init() {
    debug('Setting up the database...')
    const dbResponse = await this.client.databases.createIfNotExists({
      id: this.databaseId
    })
    this.database = dbResponse.database
    debug('Setting up the database...done!')
    debug('Setting up the container...')
    const coResponse = await this.database.containers.createIfNotExists({
      id: this.collectionId
    })
    this.container = coResponse.container
    debug('Setting up the container...done!')
  }

  async find(querySpec) {
    debug('Querying for items from the database')
    if (!this.container) {
      throw new Error('Collection is not initialized.')
    }
    
    const { resources } = await this.container.items.query(querySpec).fetchAll()
    
    return resources
  }

  async getTarget(id) {
    debug('Adding an setting to the database')
   
    const { resource } = await this.container.item(id).read()
    return resource
  }




}

module.exports = Modules