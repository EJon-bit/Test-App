// import { readFileSync } from 'fs';

//require('dotenv').config();
var Client = require('ssh2').Client;
var fs = require('fs');
const path = require('path');
const getStream = require('into-stream')
const SftpFileGet = require('../models/SftpFileGet');
const sshRequests = require("./sshRequests");
const {systemLogger, consoleLogger} = require('../utils/logger');



const localpath = path.dirname(__filename);
// Prints: /Users/Billy_Bob/projects

class SftpRequests {

    /**
  * Handles the various APIs for displaying and managing sftp reuqests
  * @param {SftpFileGet} sftpFileGet
  */
  constructor(sftpFile, sshReq){
      this.sftpFileGet= sftpFile
      this.sshReq= sshReq
  }
  
  sendFile(data){
    var conn = new Client();
    return new Promise ((resolve, reject) => {
      consoleLogger.warn("Inside SFTP Function");
      var kbInt = 0;
      var processCount = 0;
      var authFileData= null;
      var error = null; 
      var filePath = null;
      const moduleDetails = data;

      //retrieves path for file containing aut info for sftp client
      var absPath = path.resolve(__dirname,"../LoginFiles/loginInfo.txt")
      console.log(absPath)

      //stores authentication data from file as a string
      var fileData= fs.readFileSync(absPath, 'utf8');
      
      //convert fileData above to json
      authFileData= JSON.parse(fileData) 
      consoleLogger.info("The SFTP Auth file Data is %o", authFileData);

      //searches through json data to find the authentication info for that correlates to host ip defined in model module
      const authInfo= authFileData.find((info)=> info.host===moduleDetails.host)
      consoleLogger.silly("SFTP Auth Info %o %o %o", authInfo.host, authInfo.username,authInfo.password)
        

      var fileTransData = moduleDetails.file_transfers.filter((transferInfo)=> "destination" in transferInfo)
      consoleLogger.info("File Data %o", fileTransData)
      // var returnValue = null;

      //returns to caller function once all the job item files have een transferred
      const checkerFunction = (filePath)=>{
        if(processCount == fileTransData.length){
          if (error!=null){
            consoleLogger.error("%o",error);
            return reject(error);
          }
          else if(Object.keys(moduleDetails).includes("script_execution")){
            //tells caller function if a script is to be executed on file sent to host/server
            if(filePath!=null){
              moduleDetails.script_execution[0].args[0] = moduleDetails.script_execution[0].args[0].replace(/<\$.*>$/, filePath.file)        
            }
            consoleLogger.silly("Contains script execution")
            return {
              "host":moduleDetails.host, 
              "script_execution":moduleDetails.script_execution, 
              "job_id":moduleDetails.job_id
            }
          }
          else{ 
            //deletes the downloaded blob file and tells caller that no other ssh/sftp task needs to be performed
           consoleLogger.info("Job Files Sent")
           

             // block of code to remove file from blob from the folder
            const rmPath = filePath.absPath
            consoleLogger.info(rmPath)
            try {
              fs.unlinkSync(rmPath)
              //file removed
            } catch(err) {
              console.error(err)
            }
            return {"status": "Done", "id": moduleDetails.job_id}

          } 
        }     
      }
      conn.connect({
        host: authInfo.host,
        username : authInfo.username,
        password: authInfo.password,
        port : 22,
        tryKeyboard: true,
        authHandler : (methodsLeft, partialSuccess, callback) => {
          consoleLogger.silly("Methods Left: %o",methodsLeft)
          consoleLogger.silly("Partial Success: %o",partialSuccess)
          if(methodsLeft == null)
            return callback('keyboard-interactive');
          else
            return callback(false); 
        },
       // debug: console.log
      })
      conn.on('keyboard-interactive', (name, instructions, lang, prompts, finish) => {
        kbInt++;
        consoleLogger.verbose("KbInt: %i", kbInt)
        if (kbInt >= 2){
          consoleLogger.warn(" Already sent information")
        }
        else {
           // This is required to listen to the tryKeyboard: true 
        consoleLogger.warn("Name: %s, Instructions: %s", name,instructions)
        consoleLogger.warn("Lang: %o",lang)
        consoleLogger.verbose("Inside keyboard interactive")
        consoleLogger.warn("%o",prompts)
        finish([authInfo.password]);
        }
       
      })
      conn.on('ready', ()=> {
                  
        consoleLogger.verbose('Client :: ready');
        conn.sftp(async(err, sftp)=>{ 
        consoleLogger.warn("Inside conn.sftp");

          if (err){
              error = err;
          }       
          else{ //if sftp connection successful, upload each attachment corresponding to the job item
            for (const x of fileTransData){              
                consoleLogger.warn("repeating loop");
                // get the link 
                const link =  x.file
                consoleLogger.silly(link)
  
                //downloads attachment from Blob
                filePath =  await this.sftpFileGet.downloadBlob(link) 
                consoleLogger.warn("File paths %o", filePath)

                //file path provided from Model module in settings collection of the Db
                const destination =  `${x.destination}/${filePath.file}`
                consoleLogger.verbose(destination);
              
                //method to transfer file to sftp server
                const response = await new Promise((resolve)=>{
                  sftp.fastPut(filePath.absPath, destination, (err)=>{
                    if (err){             
                        consoleLogger.error("ERR : %o", err) 
                        error= err;                       
                    }
                    else{
                      processCount++;           
                      consoleLogger.warn("Check 1: process count %i", processCount);
                      return resolve("Done")                                          
                    }              
                  })                    
                })                 
               
                if (response == "Done" && processCount == fileTransData.length){
                  conn.end();
                }
                
            }
          }
        })      
      })
      .on('error', function(err) {
        consoleLogger.error("The error is %o", err)  
        conn.end()      
      })  
      .on('end', ()=>{             
        consoleLogger.silly("Conn End"); 
        return resolve(checkerFunction(filePath)) 
      }) 
      
    })
  }

  async getFile(data){
    var conn = new Client();
    return new Promise ((resolve, reject) => {
      consoleLogger.warn("Inside SFTP Function");
      var kbInt = 0;
      var processCount = 0;
      var authFileData= null;
      var error = null;
      var localOutputPaths = [];
      
      const moduleDetails = data;

      //retrieves path for file containing aut info for sftp client
      var absPath = path.resolve(__dirname,"../LoginFiles/loginInfo.txt")
      console.log(absPath)

      //stores authentication data from file as a string
      var fileData= fs.readFileSync(absPath, 'utf8');
      
      //convert fileData above to json
      authFileData= JSON.parse(fileData) 
      consoleLogger.info("The SFTP Auth file Data is %o", authFileData);

      //searches through json data to find the authentication info for that correlates to host ip defined in model module
      const authInfo= authFileData.find((info)=> info.host===moduleDetails.host)
      consoleLogger.silly("SFTP Auth Info %o %o %o", authInfo.host, authInfo.username,authInfo.password)
        
      //stores all output file objects defined in the operation process db doc
      var outputFiles = moduleDetails.file_transfers.filter(fileObj=> "source" in fileObj)
      consoleLogger.info("The output files are %o", outputFiles)

      /*append {"file":filename} (retrieved by doing ls -1t | head -10) to each 
      outputFile object whose file_id corresponds to  file type (i.e. log, txt,... etc) 
      */
      const checkerFunction = async(files)=>{
        consoleLogger.silly("Inside checker");
        var output = null
        var data = null;
        var uploadResponse = null
        const responses= [];
        if(processCount == outputFiles.length){
          if (error!=null){
            consoleLogger.error("%o",error);
            return reject(error);
          }
          else {
            for (const file of files){        
              const fileBody = fs.readFileSync(file.destination)  
              console.log("FileBody",fileBody)   
              output = getStream(fileBody);                              
              const streamLength = fileBody.length
              console.log("Stream Length", streamLength)
              const response = await new Promise(async(resolve)=>{
                uploadResponse = await this.sftpFileGet.storeItem(output, streamLength, file.blobPath)
                consoleLogger.info("Upload response is %s", uploadResponse)
                return resolve({
                  "job_id":moduleDetails.job_id, 
                  "output":{
                    "name":uploadResponse.replace(/^.*%2F/g, ""),
                    "link":uploadResponse,
                    "file_id":uploadResponse.replace(/^.*vasfiles%2FOutputFiles%2F/, "").replace(/%2F.*$/, "")
                  }
                })
              })
              responses.push(response);
            }
           
            return responses
          }
        }     
      }

      this.sshReq.outputCommand(outputFiles, authInfo).then((outputs)=>{
        consoleLogger.info("The outputs are %o", outputs);
        conn.connect({
          host: authInfo.host,
          username : authInfo.username,
          password: authInfo.password,
          port : 22,
          tryKeyboard: true,
          authHandler : (methodsLeft, partialSuccess, callback) => {
            consoleLogger.silly("Methods Left: %o",methodsLeft)
            consoleLogger.silly("Partial Success: %o",partialSuccess)
            if(methodsLeft == null)
              return callback('keyboard-interactive');
            else
              return callback(false); 
          },
         // debug: console.log
        })
        conn.on('keyboard-interactive', (name, instructions, lang, prompts, finish) => {
          kbInt++;
          consoleLogger.verbose("KbInt: %i", kbInt)
          if (kbInt >= 2){
            consoleLogger.warn(" Already sent information")
          }
          else {
             // This is required to listen to the tryKeyboard: true 
            consoleLogger.warn("Name: %s, Instructions: %s", name,instructions)
            consoleLogger.warn("Lang: %o",lang)
            consoleLogger.verbose("Inside keyboard interactive")
            consoleLogger.warn("%o",prompts)
            finish([authInfo.password]);
          }
         
        })
        conn.on('ready', ()=> {
                    
          consoleLogger.verbose('Client :: ready');
          conn.sftp(async(err, sftp)=>{ 
          consoleLogger.warn("Inside conn.sftp");
  
            if (err){
                error = err;
            }       
            else{ //if sftp connection successful, upload each attachment corresponding to the job item
              for (const x of outputs){
  
                //file path provided from Model module in settings collection of the Db
                const source =  `${x.source}/${x.file}`.replace(/\s/, "").replace(/\n/g,"")

                consoleLogger.verbose("The source is %s", source);
                
                const destination =  path.resolve(__dirname,`../BlobFiles/OutputFiles/${x.file_id}/${x.file}`).replace(/\n/g,"")
                const directory =path.resolve(__dirname,`../BlobFiles/OutputFiles/${x.file_id}`)
  
                try{
                  if (!fs.existsSync(directory)) {
                    fs.mkdirSync(directory)
                  }
                }
                catch(err){
                  return reject(err);
                }               
              
                //method to transfer file to sftp server
                sftp.fastGet(source, destination, (err)=>{
                  if (err){             
                      consoleLogger.error("%o", err) 
                      error= err;
                  }
                  else{
                    processCount++;        
                    localOutputPaths.push({"destination": `${destination}`, "blobPath": `${x.file_id}/${x.file}`})   
                    consoleLogger.warn("Check 1: process count %i", processCount); 

                    if(processCount == outputFiles.length){
                      consoleLogger.warn("Check 2: process count %i", processCount);
                      conn.end();              
                    }       
                  }    

                });  
                    
              }
            }
          })      
        })
        .on('end', ()=>{        
          consoleLogger.verbose("The output Paths are %o", localOutputPaths);     
          consoleLogger.silly("Conn End"); 
          return resolve(checkerFunction(localOutputPaths))
        }) 
        .on('error', function(err) {
          consoleLogger.error("The error is %o", err)        
        })  
      })

      
    })
  }
 
    
}
module.exports= SftpRequests;


