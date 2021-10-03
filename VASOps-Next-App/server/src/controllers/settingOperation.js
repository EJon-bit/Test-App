const Setting = require("../models/Setting")
const AuditOperation = require("./auditOperation")

const merge = require('deepmerge')
const { databaseId } = require("../config") 

const SettingsConfigSchema = require('../schemas/settings_config_schema');

const addFormats = require('ajv-formats').default;
const Ajv = require('ajv').default

const ajv = new Ajv({ allErrors: true })  //returns response with all errors

ajv.addKeyword("name")   ///add keyword
ajv.addKeyword("attachment")   ///add keyword
ajv.addKeyword("data")   ///add keyword
addFormats(ajv)

//AJV validation
var validate = ajv.compile(SettingsConfigSchema)


class SettingOperation {
  /**
  * Handles the various APIs for displaying and managing Settings
  * @param {Setting} setting
  * @param {AuditOperation} auditOperation
  */
  constructor(setting, auditOperation) {
    this.setting = setting
    this.auditOperation = auditOperation
  }

  // Get All Items
  async showSettings(req, res) {
    const querySpec = {
      query: "SELECT * FROM c"
      // This query gets everything in the database
    } 

    const settings = await this.setting.find(querySpec)   
   
    console.log(settings)
    res.json(settings)
  }

  // Get By ID
  async showByIdSettings(req,res){
    const settingId = req.params.id
    
    const settings = await this.setting.getSetting(settingId)
    
    
    res.json(settings)
  }

    // Post Method
  async addSetting(req, res) {
      const setting = req.body;
      const updateTime = { "updatedAt" : new Date().toISOString() }
      const mergedSetting=merge(setting, updateTime);
      console.log(mergedSetting);
      if (validate(mergedSetting)) {
          //console.log(setting);
          await this.setting.addSetting(mergedSetting);
          //console.log(setting);
          res.json(mergedSetting);
      }
      else {
          res.status(400).json(validate.errors)   //response when body fails to validate w/schema
      }
  }
    
  // Delete Method 
  async deleteSetting(req,res){
    const settingId = req.params.id
    
    await this.setting.deleteSetting(settingId)
    
    res.json({message : 'Setting Deleted'})
  }

  async getConfigId(configType){
    const querySpec = {          
      query: "SELECT c.id FROM c WHERE c.type=@type" ,
      parameters: [
        {
          name: "@type",
          value: configType
        }      
      ]
    }

    const settingsData = await this.setting.find(querySpec)   
    console.log("Settings", settingsData);
    
    return settingsData
  }

  async getOpId(opType){
    const querySpec = {          
      query: "SELECT c.id, ARRAY(SELECT op.id FROM op IN c.data WHERE op.name=@opType) AS info FROM c WHERE c.type=@type" ,
      parameters: [
        {
          name: "@type",
          value: "operations_processes"
        },
        {
          name: "@opType",
          value: opType
        }
      ]
    }

    const opSettings = await this.setting.find(querySpec)   
    console.log("Settings", opSettings);
    
    return opSettings
     
  }
  
  
  async getOpModelData(opType) {
    console.log("The operation is",opType)
    const querySpec = {
      //returns the id for the operations settings document
      query: "SELECT c.id AS op_id, ARRAY(SELECT op.id, op.request_template.request_properties, op.remote_actions.access_details, op.remote_actions.actions_model FROM op IN c.data WHERE op.name=@name) AS modelInfo FROM c WHERE c.type=@type", 
      parameters: [
        {
          name: "@type",
          value: "operations_processes"
        },
        {
          name: "@name",
          value: opType
        }
      ]
      // This query gets everything in the database
    } 

    const opSettings = await this.setting.find(querySpec)   
    console.log("Settings", opSettings);
    
    return opSettings
  }

  
  // Update Method
  async updateSetting(req, configId){
    // Find Setting by id and Update the document
    const body = {"id":configId.id, "data": req.body}   
    const userId = body.data.userId;
    delete body.data.userId;
    console.log("Body is", req.body);

    var doc =  await this.setting.getSetting(body.id)
    console.log("The doc is", doc)

    var filteredData=null

    const updateTime = { "updatedAt" : new Date().toISOString() }

    if('opName' in req.body){
      filteredData= await doc.data.filter((configObj)=>configObj.name!==req.body.opName)      
    }
    else if('linkName' in req.body){
      filteredData= await doc.data.filter((configObj)=>configObj.name!==req.body.linkName)
    }
    else{
      filteredData= await doc.data.filter((configObj)=>configObj.name!==req.body.name)
      filteredData.push(body.data);
    }
    
    console.log("Filtered Data", filteredData)
    doc.data= filteredData

    var rep = merge(doc,updateTime);
    console.log("The merged doc is", rep)
    
    if (validate(rep)) {
      const updatedSetting= await this.setting.updateSetting(body.id, rep)
      const settingLog= await this.auditOperation.addSettingLogUpdate(userId, updatedSetting.type)
      console.log("Setting PATCH update", updatedSetting)
    }
    else{
      return Promise.reject(validate.errors);
    }
  }

  async replaceSetting(req,res){
    console.log(typeof req.body)
    if(Array.isArray(req.body)){
      const body = {"data": req.body};
      var settingId = null
      console.log("Body", body);
      if('request_template' in req.body[0]){
        settingId= await this.getConfigId("operations_processes");
      }
      else if('link' in req.body[0]){
        settingId= await this.getConfigId("popular_links");
      }
      console.log("setting Id", settingId)
      //const id= {"id": `${settingId}`}
      const userId = body.data.pop().userId;
      console.log("userId", userId);
      const updateTime = { "updatedAt" : new Date().toISOString() }
      const rep1 = merge(updateTime, body);
      const rep2 = merge(rep1, settingId[0]);

      const replacer= await this.setting.updateSetting(settingId[0].id, rep2);   
      //const settingLog= await this.auditOperation.addSettingLogUpdate(userId, replacer.type)
     // console.log("setting log", settingLog)
      
    }
    else if(typeof req.body === 'object'){
      if('request_template' in req.body || 'opName' in req.body){
        settingId= await this.getConfigId("operations_processes");
        await this.updateSetting(req, settingId[0]);
      }
      else if('link' in req.body || 'linkName' in req.body){
        settingId= await this.getConfigId("popular_links");
        await this.updateSetting(req, settingId[0]);
      }
    
    }
    res.json({message : 'Setting Updated'})

  }
  
}

module.exports = SettingOperation