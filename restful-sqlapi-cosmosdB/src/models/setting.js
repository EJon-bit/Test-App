// @ts-check
const CosmosClient = require('@azure/cosmos').CosmosClient
const debug = require('debug')('vasops:setting')

// For simplicity we'll set a constant partition key
const partitionKey = undefined
class setting {
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

  async addSetting(setting) {
    debug('Adding an setting to the database')
    setting.submitDate = Date()
    setting.updatedAt = Date()
    const { resource: doc } = await this.container.items.create(setting)
    return doc
  }

  async updateSetting(settingId,rep) {
    console.log(settingId)
    console.log(rep)
    debug('Update an setting in the database')
    const {resource : updated} = await this.container
      .item(settingId)
      .replace(rep)
    return updated
  }

  async getSetting(settingId) {
    debug('Getting an setting from the database')
    const { resource } = await this.container.item(settingId).read()
    return resource
  }

  async deleteSetting(settingId){
    await this.container.item(settingId).delete()
  }

}

module.exports = setting