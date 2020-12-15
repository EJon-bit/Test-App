// @ts-check
const CosmosClient = require('@azure/cosmos').CosmosClient
const debug = require('debug')('vasops:itemEntry')

// For simplicity we'll set a constant partition key
const partitionKey = undefined
class itemEntry {
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

  //Initialization of the database
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

//Function to add item
  async addItem(item) {
    debug('Adding an item to the database')
    item.submitDate = Date()
    item.updatedAt = Date()
    const { resource: doc } = await this.container.items.create(item)
    return doc
  }

//Function to update item
  async updateItem(itemId,rep) {
    // console.log(itemId)
    // console.log(rep)
    debug('Update an item in the database')
    const {resource : replacement} = await this.container
      .item(itemId)
      .replace(rep)
    return replacement
  }

  //Function to read all information as it relates to the item in the collection
  async getItem(itemId) {
    debug('Getting an item from the database')
    const { resource } = await this.container.item(itemId).read()
     return resource
  }

  //Function to delete item from collection
  async deleteItem(itemId){
   await this.container.item(itemId).delete()
  }
}

module.exports = itemEntry