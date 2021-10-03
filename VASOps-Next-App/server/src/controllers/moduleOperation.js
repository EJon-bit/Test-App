const Module = require("../models/Modules")
const { databaseId } = require("../config")
const fetch = require('node-fetch');
const {systemLogger, consoleLogger} = require('../utils/logger');

class ModuleOperation {
    /**
    * Handles the various APIs for displaying and managing Settings
    * @param {Module} module
    */
    constructor(module) {
      this.module = module
    }

  // Get All Items
  async getAuth(req, res) {

    const docId = req.params.id
    console.log(docId) 
    const name = req.body.name
    const hostIp = req.body.host
    const command = req.body.command
    consoleLogger.info(hostIp)

    const doc =  await this.module.getTarget(docId)
    console.log(doc);

    const moduleInfo= await doc.data.find((mod)=>mod.name === name)
    console.log("The module is", moduleInfo);

    const filteredData= await moduleInfo.target.find((userInfo)=> userInfo.host=== hostIp)
   
    const host = filteredData.host
    const username = filteredData.username
    const password = filteredData.password
    filteredData.command = command
    consoleLogger.warn( `${host}:${username}:${password}`)
  
    
    const requestOptions = {
        method: 'POST',                      
        body: JSON.stringify(filteredData),  
        headers: {
            'Content-Type': 'application/json'
        } 
    }
    
    fetch('http://localhost:5100/sshSess', requestOptions).then(async response => {
      // this logic is for ssh module (merge them!)
      const dataRes = await response.json(); 
      const outputCollect=[]
      
      dataRes.forEach(output => {
        outputCollect.push(Buffer.from(output.data).toString('utf8'))
      });  
         
      // check for error response
      if (!response.ok) {
          // get error message from body or default to response status
          const error = (data && data.message) || response.status;
          return Promise.reject(error);
      }  
      else{                
        res.json(outputCollect);     
      } 
    })
    .catch(error => {                  
        console.error('There was an error!', error);
    });
   // res.json(moduleInfo)
  }


}

module.exports = ModuleOperation;