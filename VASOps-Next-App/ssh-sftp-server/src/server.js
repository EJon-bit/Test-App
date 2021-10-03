/* Require Modules */
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const keygen = require('ssh-keygen');
const fetch = require('node-fetch');

/* Require exported JS Modules */
const {systemLogger, consoleLogger} = require('./utils/logger');
const SshRequests = require('./controllers/sshRequests');
const SftpRequests = require('./controllers/sftpRequests');
const SftpFileGet = require('./models/SftpFileGet');



/* Create Express Application */
const sshServer = express();
sshServer.use(cors());  
sshServer.use(bodyParser.json())
sshServer.use(bodyParser.urlencoded({ extended: false }))

const sftpFileGet = new SftpFileGet();
const sshReq = new SshRequests();
const sftpReq = new SftpRequests(sftpFileGet, sshReq);
//const place = __dirname + '/key_rsa'

var completedJobs=[];
const checkerFunction = ()=>{
  // if(authCount == authData.length){
    consoleLogger.info("These are complete %o", completedJobs)
    res.json(completedJobs) 
  //}
}

sshServer.post('/sftpSsh', (req, res, next) => { 
  // Runs Post Request on route http://localhost:<port>/sftpSess/sendFile
  // Calls the getFile method in sftpRequests.js
  consoleLogger.info("Request Body %o", req.body);
  const authData = req.body  
   
  var authCount = 0;
// for (const data of authData) {

//filter through  authData[0].remoteModel for "type" === job.type and return steps
//store return value or steps in variable called remote_procedure
 const remote_procedure= authData[0].remoteModel.find(model=>model.type === authData[0].itemType)

//for loop through the steps 
for(const step of remote_procedure.steps){

  //filters through authData[0].remoteDetails for object with host_id === step.id and returns index
  const detailObjIndex= authData[0].remoteDetails.findIndex(detailObj=> detailObj.host_id === step.id)

  if(Object.keys(authData[0].remoteDetails[detailObjIndex]).includes("file_transfers")){
    consoleLogger.verbose("File transfers")
    sftpReq.sendFile(authData[0]).then((value)=>{

      consoleLogger.info("Value %o", value)
      if((typeof value === "object") && ("status" in value)){
        if(value.status==="Done"){
          completedJobs.push({"job_id":value.id}) 
          consoleLogger.verbose("Value Returned: %o ", value)
          checkerFunction()
          
        }
      }       
      else if("script_execution" in value){
        consoleLogger.warn("Contains Script Execution as well")
        sshReq.executeCommand(value, res).then((dataRes)=>{
          
            consoleLogger.verbose("Value Returned: %s ", dataRes)
            // consoleLogger.silly(dataRes.job_id)
            completedJobs.push({"job_id": value.job_id}) 
            checkerFunction();

            if(authData[0].file_transfers.some(fileObj=> "source" in fileObj)){

              sftpReq.getFile(authData[0]).then((value)=>{
                consoleLogger.info("Value %o", value)
                  
                const requestOptions = {
                  method: 'PUT',                      
                  body: JSON.stringify(value),  
                  headers: {
                      'Content-Type': 'application/json'
                  } 
                }
            
                //api call to update attachments by adding output files generated via script execution for a job process 
                const val= fetch('http://localhost:5000/updateAttachment', requestOptions).then(async(response)=>{
                  const jsonRes = await response.json()
            
                  if(!response.ok){
                    const error = (jsonRes && jsonRes.message) || response.status;
                    return Promise.reject(error);
                  }
                  else{
                    console.log("Im here")
                    consoleLogger.info("Json res %s", jsonRes)     
            
                    systemLogger.info("The operations process has been completed successfully.\n The response is:\n %s", jsonRes)
                    return "Done"
                  } 
                })
                .catch(()=>{    
                  return Promise.reject("Something went wrong");
                })
                
                
              }) 
            }
        })
        .catch(next)
        
      }
      else{
        throw new Error(`Error with value returned from sftp function ${value}`)
      }
      
    }) 
    .catch(next)
  }
  else{
    consoleLogger.warn("No file transfer inside Item")
    consoleLogger.warn("SSH and script execution")
    

    sshReq.executeCommand(authData[0], res).then((value)=>{
      consoleLogger.verbose("The response is %o", value)
      
      completedJobs.push({"job_id": authData[0].job_id}) 
      checkerFunction()
    })
    .catch(next)

    
  }
}




  
 
  
}) 


sshServer.use(function(req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
sshServer.use(function(err, req, res, next) {
  console.log("The error is", err);
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  
  // render the error page
  res.status(err.status || 500)
  res.json({
    message: err.message,
    error: err
  })
})



module.exports = sshServer