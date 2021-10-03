/* Model Import */
const ItemEntry = require("../models/ItemEntry")

/* Controller Imports*/
const AuditOperation = require("./auditOperation")
const SettingOperation = require("./settingOperation")
const ItemHelpers = require("./helperFunctions/itemHelpers")

/* Schema Import*/
const ItemEntriesSchema = require('../schemas/item_entries_schema') 

/* Module Dependencies Import */
require('dotenv').config()
const Ajv = require('ajv').default
const addFormats = require('ajv-formats').default;
const fetch = require('node-fetch');
const fileupload = require('express-fileupload')
const getStream = require('into-stream')
const merge = require('deepmerge')

/*Logging Module Imports*/
const {systemLogger, consoleLogger} = require('../utils/logger')
const { inspect } = require('util')


/* AJV Instantiation & Validation */
const ajv = new Ajv({ allErrors: true }) 
ajv.addKeyword("attachment")   ///add keyword
addFormats(ajv); 
var validate = ajv.compile(ItemEntriesSchema)


class ItemOperation {
  /**
  * Handles the various APIs for displaying and managing Items
  * @param {ItemEntry} itemEntry
  * @param {AuditOperation} auditOperation
  * @param {SettingOperation} settingOperation
  * @param {ItemHelpers} itemHelpers
  */
  constructor(itemEntry, auditOperation, settingOperation, itemHelpers) {
    this.itemEntry = itemEntry
    this.auditOperation = auditOperation
    this.settingOperation = settingOperation
    this.itemHelpers = itemHelpers
  }

/********************************
 *    Item Operation Methods    *
 ********************************/
 
 /* Add Item Method */  
  async addItem(req, res) {
    //Save JSON body to be posted in item constant
    var operation = null
    const item = req.body
    consoleLogger.info("The Items are %o", item);    
    item.submitDate = new Date().toISOString();
    item.schedule_date_time = new Date(item.schedule_date_time).toISOString();
    if("uniqueFields" in item){
      item.uniqueFields = JSON.parse(item.uniqueFields)
    }
  
    // console.log(item.uniqueFields);
    //item.updatedAt = Date();
    item["status"] = "Submitted"      
    item["moduleStatus"]= "Unprocessed"
    
    //if form- data matches schema   
    if (validate(item)) {

      console.log("Attachment",req.files); 

      //if no files were added
      if (!req.files){
        console.log("Hello no files");
        await this.itemEntry.addItem(item) 
      }
      else{
        const file = req.files.attachment
      
        operation = await this.settingOperation.getOpId(item.operationType);
        console.log("Operation is", operation[0].info[0].id)
        let fileArray = []

        if (file.length > 1){
          for(let x = 0; x < file.length; x++){
            const files = file[x].data
            console.log("The file is", files)
            const fileName = file[x].name
            const stream = getStream(files)
            const streamLength = files.length
            const fileUri = await this.itemEntry.storeItem(stream, streamLength, fileName, operation[0].info[0].id)
            const relativePath = fileUri.replace(/.*\/vasfiles\//,"") 
            consoleLogger.verbose(relativePath)
            fileArray.push(relativePath) 
          }
          const jobAdded= await this.itemEntry.addItem(item,fileArray)
          const auditDoc= await this.auditOperation.auditCreate(jobAdded);
        }
        else{
            const files = file.data
            console.log("The file is", files)
            const fileName =file.name
            const stream = getStream(files)
            const streamLength = files.length
            const uri = await this.itemEntry.storeItem(stream, streamLength, fileName, operation[0].info[0].id) 
            const relativePath = uri.replace(/.*\/vasfiles\//,"") 
            consoleLogger.info(relativePath)
            const jobAdded=await this.itemEntry.addItem(item,relativePath)
            const auditDoc= await this.auditOperation.auditCreate(jobAdded);
        }
      }
      return item
    //res.json(item);
    }
    else{
      console.log(validate.errors);
      return Promise.reject(validate.errors);
    }
  }


  /* Delete Blob Attachment */
  async deleteAttachment(fileLink){
 
    // Delete from blob
    consoleLogger.verbose(fileLink)
    const parsedLink = fileLink.replace(/%2F/g,'/').replace(/%3A/g, ":").replace(/%20/g, " ");
    consoleLogger.verbose(parsedLink);
    console.log("The Parsed Link Array", parsedLink)
    console.log(`The container Name and Blob name is ${process.env.AZURE_STORAGE_CONTAINER} and ${parsedLink} respectively`);
    await this.itemEntry.deleteAttachment(process.env.AZURE_STORAGE_CONTAINER, parsedLink);  
  }


  /* Delete Item Method */ 
  async deleteItem(req,res){
    const body = req.body
    
    console.log("Items to be deleted", body)

    console.log("Number in here",body.id.length)

    if (Array.isArray(body.id)){
      var doc =null;
      
      for (let x = 0; x < body.id.length; x++){ // This only works for two or more selected files
        // Check the number of files in each body element
        var docs=[];
        doc= await this.itemEntry.getItem(body.id[x])
        consoleLogger.info("Attachments are %o", doc)

        for (let i=0; i< doc.requestAttachments.input.length; i++){
                      
          const link = doc.requestAttachments.input[i].attachment.link
          console.log(link)
          await this.deleteAttachment(link)
        }
        const id = body.id[x]
        console.log(id);
        await this.itemEntry.deleteItem(id);
        docs.push(doc);
                
      }
      const auditDoc= await this.auditOperation.auditDelete(docs);
      
    
    } 
    else{
      console.log("Only 1 chosen", body.id)
      
      const doc= await this.itemEntry.getItem(body.id)
      consoleLogger.info("Doc is %o", doc)

      if(Object.keys(doc.requestAttachments).includes("input")){
        if (doc.requestAttachments.input.length!=0){
          for (let x =0; x< doc.requestAttachments.input.length; x++){
            const link=doc.requestAttachments.input[x].attachment.link
            console.log("Link", link)
            await this.deleteAttachment(link)
            const id = body.id
            console.log(id);
            await this.itemEntry.deleteItem(id)        
            const auditDoc= await this.auditOperation.auditDelete(doc);
            console.log("Audit Log is", auditDoc)
          }
        }
        else{
          const id = body.id
          console.log(id);
          await this.itemEntry.deleteItem(id)        
          const auditDoc= await this.auditOperation.auditDelete(doc);
          console.log("Audit Log is", auditDoc)
        }
      }
    }
    res.json({message : 'Item Deleted'})
  }

  async executeItem(item){
    console.log("The item is:", item)

    /*query to filter through DB Items Container for job item/s provided id and return other details on the job*/
    const querySpec = {
      query: "SELECT c.id, c.operationType, c.requestAttachments.input FROM c WHERE (c.id = @itemId)",
      parameters: [      
        {
          name: "@itemId",
          value: item.id
        }
      ]
    }

    //stores value returned from filter
    const jobItems = await this.itemEntry.find(querySpec)
    consoleLogger.info("The Query results are %o", items)

    const requestBody = [];

    //loops through filtered list of jobs
    for(const job of jobItems){

      const itemsSetting = await this.settingOperation.getOpModelData(job.operationType);
      consoleLogger.silly("The Settings Query results are %o", itemsSetting);

      //stores access details for remote servers required for job execution
      const moduleDetails= itemsSetting[0].modelInfo[0].access_details

      const moduleModel= itemsSetting[0].modelInfo[0].actions_model

      //attaches id (to the remote server access details) of job item being executed for job progress tracking 
      moduleDetails["job_id"]= job.id
      moduleDetails["job_type"]= job.uniqueFields[0] 
      const settingsReqProps= itemsSetting[0].modelInfo[0].request_properties.find(prop=> prop.isSubType)

      if (job.input.length > 0){
        var i =0
        if("file_transfers" in moduleDetails){
          for(const input of job.input){
          // moduleDetails.file_transfers["file"]=[];         
            moduleDetails.file_transfers[i].file = input.attachment.link;
            i++
          }
        
          consoleLogger.info("Inputs are %o", ...moduleDetails.file_transfers); 
        }
      }
      
      requestBody.push({"remoteDetails": moduleDetails, "remoteModel": moduleModel, "itemType":settingsReqProps.name});
      consoleLogger.info("module details %o", requestBody);
    }  
    
    //stores body of HTTP post request 
    const requestOptions = {
      method: 'POST',                      
      body: JSON.stringify(requestBody),  
      headers: {
          'Content-Type': 'application/json'
      } 
    }

    //post request to ssh/Sftp server to perform remote processes
    const val= fetch('http://localhost:5100/sftpSsh', requestOptions).then(async(response)=>{
      const jsonRes = await response.json()

      if(!response.ok){
        const error = (jsonRes && jsonRes.message) || response.status;
        return Promise.reject(error);
      }
      else{
        console.log("Im here")
        consoleLogger.info("Json res %o", jsonRes)

        //update data for each job item that has been processed
        for(const id of jsonRes){
          const item = await this.itemEntry.getItem(id.job_id); 
          item.moduleStatus = "Processed"
          item.status = "Processing"
          const updatedItem = await this.itemEntry.updateItem(item.id, item)
        }

        systemLogger.info("The operations process has been completed successfully.\n The response is:\n %o", jsonRes)
        return "Done"
      } 
    })
    .catch((error)=>{    
      return Promise.reject("Something went wrong", error);
    })

    return val
  
  }

  //Replace Item Method
  async replaceItem(req, res){
    let body = req.body
    const itemId = req.params.id
    const id={"id":`${itemId}`}
    let requestAttachments = {
      "requestAttachments":{
        "input":[]
      }
    }
    console.log("The body is,", body)
    const updateTime = { "updatedAt" : Date() }

    let rep= null

    if(body.attachment.length>0){
      requestAttachments.requestAttachments.input.push(body.attachment)

     
      rep = merge.all([id, body, updateTime])
    }
    else{
      rep = merge.all([id, requestAttachments, body, updateTime])
    }
    
    await this.itemEntry.updateItem(itemId,rep)
    res.json({message : 'Item Updated'})
  }


  /* Show/Get By ID Method */
  async showByIdItems(req,res){
    const itemId = req.params.id
    const items = await this.itemEntry.getItem(itemId)
    res.json(items)
  }

  /* Show/Get by Operation */
  async showByOperation(req,res){
    const operation = req.params.typeOp
    console.log("Op Type is", operation)
    const querySpec = {
      query: "SELECT * FROM c WHERE c.operationType=@operationType",
      parameters: [
        {
          name: "@operationType",
          value: operation
        }
      ]
    };
    const items = await this.itemEntry.find(querySpec)
    consoleLogger.info("The Items are %o", items)
    
    const auditLogs= await this.auditOperation.fetchAuditLogs(operation, "ItemEntries")
    consoleLogger.info("The audit Logs are %o", auditLogs);

    res.json({items, auditLogs})
    //res.send("hello")
  }

  /* Get All Items */
  async showItems(req, res) {
    const querySpec = {
      // This query gets everything in the database
      query: "SELECT * FROM c" 
    }
    const items = await this.itemEntry.find(querySpec)

    //fetch all modification and creation data from every audit log doc
    const auditLogs= await this.auditOperation.fetchAuditLogs()
    consoleLogger.info("The audit Logs are %o", auditLogs);
    res.json(items)
  }
  
  
  //adds output file info to db and blob storage after script execution
  async updateAttachments(outputFileData, res){
    consoleLogger.info("Output Data: %o", outputFileData)
    var updatedItem= null
    const item = await this.itemEntry.getItem(outputFileData[0].job_id)
    item.requestAttachments.output = []
    for(const fileData of outputFileData){
      await new Promise(resolve=>{
        item.requestAttachments.output.push({"attachment": fileData.output}) 
        return resolve("Done");
      })     
    }
    updatedItem = await this.itemEntry.updateItem(outputFileData[0].job_id, item)

    res.json("Done")
  }

  /* Update Item Method */
  async updateItem(req,res){
    // Find item by id and Update the document 
    let body = req.body   
    var rep;
    const itemId = req.params.id
    body.schedule_date_time = new Date(body.schedule_date_time).toISOString();
    let doc =  await this.itemEntry.getItem(itemId)
    const updateTime = { "updatedAt" : new Date().toISOString() }
    console.log("Original Entry doc", doc);
    console.log("Unparsed Replacer: ", body);
    if('uniqueFields' in body){
      body.uniqueFields= JSON.parse(body.uniqueFields);
    }

    const operation = await this.settingOperation.getOpId(body.operationType);

    this.itemHelpers.processExistingFiles(body, doc, itemId).then(async(filesDetails)=>{
      doc.requestAttachments.input=filesDetails.retainedFiles;

      filesDetails.delFileIndexes.forEach(async(index)=>{
        await this.deleteAttachment(doc.requestAttachments.input[index].attachment.link);
      })

      if("attachment" in body || body.attachment==''){
        delete body.attachment;
        console.log("body after file Deletion", body.attachment)
      }
      if(req.files != null ){
        const file = req.files.attachment
       // console.log("file attachments", file);
      
        this.itemHelpers.fileParse(file, operation[0].info[0].id).then(async(value)=>{
          console.log("File stored to Blob:", value)
          
          let requestAttachments = await this.itemEntry.createReqAttachments(value)
          const reqAttach = { "requestAttachments" : requestAttachments }         
          
          console.log("Db attachments", reqAttach);
          rep = merge.all([ doc, body, updateTime, reqAttach]);
          console.log("New Body: ", rep);

          const oldItem = await this.itemEntry.getItem(itemId);
          var diff = await this.itemHelpers.difference(oldItem, rep);
          
          if('updatedAt' in diff || 'source' in diff){
            delete diff["updatedAt"]
            delete diff["source"]          
          }

          console.log("The fields changed are", diff);         
          
          if (validate(rep)) {            
            //get old item from db and compare fields with db fields/props        
            
            const updatedItem = await this.itemEntry.updateItem(itemId,rep)
            const itemLog= await this.auditOperation.auditUpdate(body.source, oldItem, diff)
            consoleLogger.verbose("New Audit Log is %o", itemLog);
            consoleLogger.verbose("New DB Doc is %o", updatedItem);
            res.json({message : 'Item Updated'})
            // Call a fxn to 
          }
          else{
            return Promise.reject(validate.errors);
          }
        })
        .catch(err=> console.log(err))        
      } 
      else {//runs if no new files are added
        console.log("Replacer: ", body)
         
        //Merge function used to help partial update of document
        rep = merge.all([doc, body, updateTime])
        console.log("New Body: ", rep)

        const oldItem = await this.itemEntry.getItem(itemId);
        var diff = await this.itemHelpers.difference(oldItem, rep);
         
        if('updatedAt' in diff || 'source' in diff){
          delete diff["updatedAt"]
          delete diff["source"]          
        }
        console.log("The fields changed are", diff); 
         
        if (validate(rep)) {
          const updatedItem= await this.itemEntry.updateItem(itemId,rep)
          const itemLog= await this.auditOperation.auditUpdate(body.source, oldItem, diff)
          res.json({message : 'Item Updated'})
        }
        else{
          return Promise.reject(validate.errors);
        }
      }
    })  
   
    
  }

  /* Upload Blob Attachment */
  async uploadAttachment(req, res){
    const id = req.params.id
    const item = await this.itemEntry.getItem(id)
    const files = req.files.file.data
    const fileName = req.files.file.name
    const stream = getStream(files)
    const streamLength = files.length
    const uri = await this.itemEntry.storeItem(stream,streamLength,fileName)
    const rep = merge(item, uri)
    await this.itemEntry.updateItem(id,rep)
    res.json({message : 'Attachment Updated'})
  }

 
 
  
 

  


 
}

module.exports = ItemOperation