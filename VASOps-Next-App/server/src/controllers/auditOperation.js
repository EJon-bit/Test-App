const AuditLogs = require("../models/AuditLogs")
const merge = require('deepmerge')
require('dotenv').config()

const AuditLogsSchema = require('../schemas/audit_logs_schema')
const addFormats = require('ajv-formats').default;
const {systemLogger, consoleLogger} = require('../utils/logger')

const Ajv = require('ajv').default

//const dateTimeRegex = new RegExp('^(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})[+-](\d{2})\:(\d{2})$');
const ajv = new Ajv({ allErrors: true })  
addFormats(ajv)

var validate = ajv.compile(AuditLogsSchema);

var jobCount=0;
var auditJobs=null;

class AuditOperation {
  /**
  * Handles the various APIs for displaying and managing Items
  * @param {AuditLogs} auditLogs
  */
  constructor(auditLogs) {
    this.auditLogs = auditLogs 
  }

  //adds an audit log for created jobs to db doc for a specific user
  async auditCreate(job){
    var auditLogDoc=null
    var affectedSys=null
    if('requestAttachments' in job){
      affectedSys=['Database', 'Blob']
    }
    else{
      affectedSys['Blob']
    }
    const newLog= {
      "affected_systems":affectedSys,
      "action":{
        "time": new Date().toISOString(),
        "action_type":"Create",
        "document_created":{
          "id": job.id,
          "name":job.name,
          "operation": job.operationType,
          "section_affected":"ItemEntries"
        }
      }
    }
    auditLogDoc= await this.LogUpdate(job.source, newLog)

    return auditLogDoc
  }

  //adds an audit log for deleted jobs to db doc for a specific user
  async auditDelete(jobs){     
    auditJobs=jobs
    if(!(Array.isArray(jobs))){ 
      
      var logDoc= await this.deleteParse(jobs)      
      logDoc.auditLogDoc.log_data.push(...logDoc.filteredData)
      const updatedLog = await this.auditLogs.updateLog(logDoc.auditLogDoc);

      return updatedLog
    }
    else{
      for(const job of jobs){
        jobCount++;        
        var logDoc = await this.deleteParse(job)
        if(jobCount==auditJobs.length){
          logDoc.auditLogDoc.log_data.push(...logDoc.filteredData)
        }        
      }

      const updatedLog = await this.auditLogs.updateLog(logDoc.auditLogDoc);
      consoleLogger.verbose("Audit Los are %o", updatedLog);

      return updatedLog
    }
    
  }

  async auditSettingUpdate(userId, settingType){
    
    const newLog={ 
      "affected_systems":["Database"],
      "action":{
          "action_type":"Update",
          "action_effects":{
            "time": new Date().toISOString(),
            "section_affected":"Settings",
            "setting_type":settingType
          }
      }
    }

    return this.LogUpdate(userId, newLog)
   
  }

  async createLog(req, res){
    const log = req.body;   
    const time = { "time" : new Date().toISOString() }
    const mergedProps=merge(log, time);
    console.log(mergedProps);
    
    if (validate(mergedProps)) {
          //console.log(setting);
         const logAdded=  await this.auditLogs.addLog(mergedProps);
          //console.log(setting);
          res.json(logAdded);
    }
    else {
        res.status(500).json(validate.errors)   //response when body fails to validate w/schema
    }
  }

  async deleteParse(job){
    var auditLogDoc=null
    var affectedSys=null
    var filteredUpdateData=[];
    var filteredCreateData=[];

    if('requestAttachments' in job){
      affectedSys=['Database', 'Blob']
    }
    else{
      affectedSys['Blob']
    }
    const newLog= {
      "affected_systems":affectedSys,
      "action":{
        "time": new Date().toISOString(),
        "action_type":"Delete",
        "document_deleted":{
          "id": job.id,
          "name":job.name,
          "operation": job.operationType,
          "section_affected":"ItemEntries"
        }
      }
    }

    auditLogDoc= await this.LogUpdate(job.source, newLog)

    if((Array.isArray(auditJobs) && jobCount==auditJobs.length) || typeof auditJobs==="object"){     
      filteredUpdateData = auditLogDoc.log_data.filter((log)=>{       
        if("document_updated" in log.action){
          return log.action.document_updated.id!==job.id
        }      
      })

      filteredCreateData= auditLogDoc.log_data.filter((log)=>{
        if("document_created" in log.action){
          return log.action.document_created.id!==job.id
        }      
      })      
    }    

    const filteredDeleteData = auditLogDoc.log_data.filter((log)=>{
      if("document_deleted" in log.action){
        return log.action.document_deleted.id===job.id
      }      
    })

    if((Array.isArray(auditJobs) && jobCount==1) || typeof auditJobs==="object"){  
      auditLogDoc.log_data= filteredDeleteData
    }
    else{
      auditLogDoc.log_data.push(filteredDeleteData);
    }
    const filteredData= [...filteredUpdateData, ...filteredCreateData]

    return {auditLogDoc,filteredData}
  }

  async fetchAuditLogs(operation, auditType){
    const actionSubQuery= "(logs.action.action_type='Update' OR logs.action.action_type='Create')"
    const auditTypeQuery= 'AND (logs.action.action_effects.section_affected=@auditType OR logs.action.document_created.section_affected=@auditType)'
    const opTypeQuery= "AND (logs.action.document_created.operation=@opType OR logs.action.document_updated.operation=@opType)"
    const querySpec={
      query:"SELECT c.user_id, ARRAY(SELECT * FROM logs IN c.log_data WHERE"+ actionSubQuery + auditTypeQuery + opTypeQuery  + ") as logInfo FROM c",
      parameters: [
        {
          name: "@opType",
          value: operation
        },
        {
          name: "@auditType",
          value: auditType
        }
      ]
    }
    const auditLogData = await this.auditLogs.find(querySpec)

    return auditLogData
  }

 //adds an audit log for updated jobs to db doc for a specific user
  async auditUpdate(userId, oldDoc, changes){

  var affectedSys= []
  var changeTypes= null;
  const fileProps={
    "change_type":"file",
    "new_files":[],
    "old_files":[]
  }
  const fieldProps={
    "change_type":"field",
    "fields":[]
  }

    function upDateProps(stat) {
      if(stat ==='file'){
        for(const input of changes.requestAttachments.input){
          console.log("The input is", input)
          const fileName=input.attachment.link
          fileProps['new_files'].push(fileName.replace(/^.*\.\d{3}Z/, ""))
        }
        for(const oldInput of oldDoc.requestAttachments.input){
          fileProps['old_files'].push(oldInput.attachment.name)
        }
        delete changes.requestAttachments
      }
      else{
        delete changes.requestAttachments
        for (const key in changes){          
          if(key==='updatedAt' && oldDoc[key]==undefined){
            fieldProps.fields.push({"name": key, "old_value": "none", "new_value": changes[key]})
          }
          else{
            fieldProps.fields.push({"name": key, "old_value":oldDoc[key], "new_value": changes[key]})
          }         
        }
      }
    }

    if('requestAttachments' in changes && Object.entries(changes).length>1){
      affectedSys.push('Database', 'Blob')
      changeTypes='file and fields'
      upDateProps('file')
      upDateProps('fields')
      
    }
    else if ('requestAttachments' in changes){
      affectedSys.push('Database', 'Blob')
      changeTypes='file'
      upDateProps('file')
    }
    else{
      affectedSys.push('Database')
      changeTypes= 'fields'
      upDateProps('fields')
    }
    consoleLogger.info("The file props are %o", fileProps);
    consoleLogger.info("The field props are %o", fieldProps)

    const newLog={ 
      "affected_systems":affectedSys,
      "action":{
          "document_updated":{
            "id": oldDoc.id,
            "name": oldDoc.name,
            "operation": oldDoc.operationType,
          },
          "action_type":"Update",
          "action_effects":{
            "time": new Date().toISOString(),
            "section_affected":"ItemEntries",
            "changes":[
              changeTypes==="file"? fileProps
              :changeTypes==="fields"? fieldProps
              :fileProps, fieldProps
            ]            
          }
      }
    }
    consoleLogger.verbose("The new Log is %o", newLog);

    const log = await this.LogUpdate(userId, newLog)

    if('name' in changes){
      const logCreateIndex= log.log_data.findIndex((data)=> "document_created" in data.action && data.action.document_created.id===oldDoc.id)
      const logUpdateIndex= log.log_data.findIndex((data)=> "document_updated" in data.action && data.action.document_updated.id===oldDoc.id)

      log.log_data[logCreateIndex].action.document_created.name= changes.name
      log.log_data[logUpdateIndex].action.document_updated.name= changes.name
    }
    const updatedLog = await this.auditLogs.updateLog(log);
    return updatedLog
  }
  
  async LogUpdate(userId, newLog){
    var updatedLog=null;
    var newLogDoc=null;
    console.log("user Id", userId)
    const querySpec = {
      query: "SELECT * FROM c WHERE c.user_id=@userId",
      parameters: [
        {
          name: "@userId",
          value: userId
        }
      ]
    }       
  
    var logDoc = await this.auditLogs.find(querySpec);
    console.log("The logs are", logDoc);
    console.log("The new log is", newLog)

    if(logDoc.length<1){
      logDoc=[{
        "user_id": userId,
        "log_data":[
          newLog
        ]
      }]
      console.log("The logs are", logDoc[0]);  
     
      newLogDoc= await this.auditLogs.addLog(logDoc[0]);
      return newLogDoc;
    }
    else{
      logDoc[0].log_data.push(newLog); 
      console.log("The logs are", logDoc[0]);  
      updatedLog = await this.auditLogs.updateLog(logDoc[0]);
      return updatedLog
    }
   
  }
}
module.exports = AuditOperation