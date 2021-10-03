// @ts-nocheck
//Calling required libraries
const CosmosClient = require('@azure/cosmos').CosmosClient
const { BlobServiceClient } = require('@azure/storage-blob')
const debug = require('debug')('vasops:itemEntry')
require('dotenv').config() 
const { v1: uuidv1} = require('uuid')
const {systemLogger, consoleLogger, debugLogger} = require('../utils/logger')

// For simplicity we'll set a constant partition key
// @ts-ignore 
const partitionKey = undefined

class ItemEntry {
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

  /**
   * @param {Array} uri
   */
//Function to add item
  async addItem(item,uri) {

    debug('Adding an item to the database')
   
    //item.schedule_date_time = Date()
    let requestAttachments = {
      input:[]
    }
    item.requestAttachments = requestAttachments
    console.log("Time is",item.schedule_date_time)
  

    if (uri){
      console.log("Number of Uri's:",uri);

      // Create request Attachments section
     
      if (Array.isArray(uri)){
        for(let x=0; x < uri.length; x++){
          const name= uri[x].replace(/^.*\.[\d]{3}Z/,"") 
         // const file_id = name.replace(/\..*$/, "")
          console.log(name)
          requestAttachments.input.push({
            attachment: {
              "name": name,
              "link": uri[x],
              // "file_id": "subscriber_file"
            }
          })
        }
      }else{
        const name = uri.replace(/^.*\.[\d]{3}Z/,"")
        //const file_id = name.replace(/[^\.([^\.]+)\.]/,"")
        requestAttachments.input.push({
          attachment: {
            "name": name,
            "link": uri,
            // "file_id": "subscriber_file"
          }
        })
      }
  
      item.requestAttachments = requestAttachments
    }
   
    const { resource: doc } = await this.container.items.create(item)
    //fetch
    if (Date.now() == Date.parse(item.schedule_date_time) && item.opStatus==="Unprocessed"){
      
    }  
    return doc
  }

//Function to update item
  async updateItem(itemId,rep) {
    console.log("Body to be added to DB:", rep);
    // console.log(rep)
    debug('Update an item in the database')
    const {resource : replacement} = await this.container.item(itemId).replace(rep)
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
    const { resource: itemDeleted }= await this.container.item(itemId).delete()

    return itemDeleted
  }

  async getItemByOperation(operationType){
    // Get item based on Operation Type

    
  }

  //Function to store in blob
  /**
   * @param {any} file
   */
  async storeItem(file, streamLength, filename, operation){
    console.log('Welcome to Azure Storage')
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING

    // Create a container // 
    // Create the BlobServiceClient object which will be used to create a container client
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)

    // Create a uique name for the container
    // const containerName = 'testcontainer' + uuidv1()
    const containerName = 'vasfiles'
    // console.log('\nCreating container...')
    // console.log('\t', containerName)

    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName)
   // console.log("Client Container", containerClient);
    // Create the container
    const createContainerResponse = await containerClient.createIfNotExists()
    console.log("Container was created successfully. requestId: ", createContainerResponse.requestId)

    // Upload Blobs to container
    // Create a unique name for the blob
    const dateId = new Date().toISOString();
    console.log("The date is", dateId);
    const blobName =  `InputFiles/${operation}/${dateId}${filename}`   
 
    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)
    console.log('\nUploading to Azure storage as blob:\n\t', blobName)

    const uri = blockBlobClient.url
    console.log("Blob URL: ", uri) 
    // Upload data to the blob
    const data = file 
    const length = streamLength
    //console.log("This is the azure file: ",data)

    //console.log("File is", file)
    console.log("Length is",streamLength)

    const uploadBlobResponse = await blockBlobClient.uploadStream(data, length)
    //console.log("Blob was uploaded successfully. ", uploadBlobResponse)
    
    return(uri);
  }

  async deleteAttachment(containerName, blobName){
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
        
    //Need Container name
    const containerClient = blobServiceClient.getContainerClient(containerName);
    consoleLogger.silly(containerName);
    consoleLogger.silly(blobName);

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
    return `${blobName} was successfully Deleted`
  }

  async createReqAttachments(uri){
   
      console.log("Number of Uri's:",uri.length)

      // Create request Attachments section
      let requestAttachments = {
        input:[]
      }
      if (Array.isArray(uri)){
        for(let x=0; x < uri.length; x++){
          const name= uri[x].replace(/^.*\.[\d]{3}Z/,"") 
         // const file_id = name.replace(/\..*$/, "")
          console.log(name)
          requestAttachments.input.push({
            attachment: {
              "name": name,
              "link": uri[x],
              // "file_id": "subscriber_file"
            }
          })
        }
      }else{
        const name = uri.replace(/^.*\.[\d]{3}Z/,"")
        //const file_id = name.replace(/[^\.([^\.]+)\.]/,"")
        requestAttachments.input.push({
          attachment: {
            "name": name,
            "link": uri,
            // "file_id": "subscriber_file"
          }
        })
      }
  
      return(requestAttachments)
  }

   
}

module.exports = ItemEntry