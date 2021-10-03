const { BlobServiceClient} = require('@azure/storage-blob')
const {systemLogger, consoleLogger, debugLogger} = require('../utils/logger')
var fs = require('fs');
const path = require('path')


require('dotenv').config() 


class sftpFileGet{
   
    async downloadBlob(filePath){

        const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING
        
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
        const containerName = 'vasfiles'; 

        //Need Container name
        const containerClient = blobServiceClient.getContainerClient(containerName)
        consoleLogger.silly(containerName);

        // SubscriberLoading%2F2021-03-24T20%3A58%3A10.761ZSub.subscriber_file.txt 

        //parse to produce appropriate blob name from relative path abstracted from db document
        const blobName = filePath.replace(/%2F/g,'/').replace(/%3A/g, ':').replace(/%20/g, ' ')
        consoleLogger.silly(blobName);
    
        const blockBlobClient = containerClient.getBlockBlobClient(blobName)

        var file = blobName.replace(/:/g, "_")

        const absPath = path.resolve(__dirname, `../BlobFiles/${file}`)

        var subPath = file.replace(/\/\d{4}-\d{2}-\d*T.*$/, "")
        consoleLogger.warn(subPath)

        const directory= path.resolve(__dirname, `../BlobFiles/${subPath}`)
        consoleLogger.warn(directory);

        try{
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory)
            }
        }
        catch(err){
            return Promise.reject(err);
        }
        
        var fileResponse = await blockBlobClient.downloadToFile(absPath);
        //consoleLogger.info("file Response, %o", fileResponse)

        file = file.replace(/^.*\//g, "")

        return {absPath, file}
        // to be completed for sftp file transfer
    }

    async storeItem(file, streamLength, destination){
      
        const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING    
        
        // Create the BlobServiceClient object which will be used to create a container client
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
    
       
        const containerName = 'vasfiles'

        // Get a reference to a container
        const containerClient = blobServiceClient.getContainerClient(containerName)
        console.log("Client Container", containerClient);
        // Create the container
        const createContainerResponse = await containerClient.createIfNotExists()
        console.log("Container was created successfully. requestId: ", createContainerResponse.requestId)
           
      
        const blobName =  'OutputFiles/' + destination.replace(/\n/g,"");   
        console.log("Blob Name: ", blobName)

     
        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName)
        console.log('\nUploading to Azure storage as blob:\n\t', blobName)
    
        const uri = blockBlobClient.url
        console.log("Blob URL: ", uri) 
        // Upload data to the blob
        const data = file  
        console.log("File is", file)
        console.log("Length is",streamLength)

        const length = streamLength
          
        const uploadBlobResponse = await blockBlobClient.uploadStream(data, length)
         
        return(uri)
    }

}

module.exports = sftpFileGet ;