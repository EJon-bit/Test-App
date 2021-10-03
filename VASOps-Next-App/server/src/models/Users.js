const CosmosClient = require('@azure/cosmos').CosmosClient
const { BlobServiceClient } = require('@azure/storage-blob')
const debug = require('debug')('vasops:users')
require('dotenv').config() 
const { v1: uuidv1} = require('uuid')
const {systemLogger, consoleLogger, debugLogger} = require('../utils/logger')

const partitionKey = undefined
class Users {
  /**
  * Manages reading, adding, and updating Tasks in Cosmos DB
  * @param {CosmosClient} cosmosClient
  * @param {string} databaseId
  * @param {string} containerId
  */
  constructor(cosmosClient, databaseId, containerId) {
    this.client = cosmosClient
    this.databaseId = databaseId
    this.collectionId = containerId

    this.database = null
    this.container = null
  }

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

    //Find function to enable the querySpec
    async find(querySpec) {
      debug('Querying for items from the database')
      if (!this.container) {
        throw new Error('Collection is not initialized.')
      }
      //Query function to search using SQL Query
      const { resources } = await this.container.items.query(querySpec).fetchAll()
      return resources
    }

    async addUser(user) {
    console.log(user)
    consoleLogger.info(user.userid)
    user.id = user.userid 
    const { resource: doc } = await this.container.items.create(user)
    return doc
    }

    async getUser(querySpec){
      // get user and compare passwords
      const { resource } = await this.container.items.query(querySpec).fetchAll();
       // Ur database has the info ? ||
      return resource

    }




}

module.exports = Users