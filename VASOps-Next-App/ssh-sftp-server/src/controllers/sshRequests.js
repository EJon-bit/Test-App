//require('dotenv').config();
var Client = require('ssh2').Client
var fs = require('fs');
const path = require('path');
const {systemLogger, consoleLogger} = require('../utils/logger');


class SshRequests {
  /* Create session Fxn- Starts a session using the conn ssh2 client and 
    .connect(with credentials) then after connecting conn.on('ready') is used
    to execute functions.    
  */
  /* Attempt for Passwordless Login
        var connectStat=false;
        consoleLogger.info("%o",connectObj)
         check 'res.body' for passwordless capability on destination server
        if passwordless connectObj['privateKey']= require('fs').readFileSync('/here/is/my/key')
        else connectObj['password']="stresthtrsd"
        var dataRes = []; 
        */
  executeCommand(req, res){   
    var conn = new Client();
    return new Promise((resolve, reject)=>{
      var kbInt =0;
      var authFileData= null;     
      consoleLogger.silly("%o", req);
      consoleLogger.warn("Inside SSH")

      var absPath = path.resolve(__dirname,"../LoginFiles/loginInfo.txt")
      console.log(absPath)

      var fileData= fs.readFileSync(absPath, 'utf8');
      authFileData= JSON.parse(fileData) 

      consoleLogger.info("The SSH Auth file Data is %o", authFileData);
      
      const authInfo= authFileData.find((info)=> info.host===req.host)
      
      consoleLogger.silly("SSH Auth Info %o %o %o", authInfo.host, authInfo.username,authInfo.password)
      console.log(authInfo)

    

      var dataRes = [];

      conn.connect({
        //Attempts a connection to a server using the information given 
        host: authInfo.host,
        username : authInfo.username,
        password: authInfo.password,
        port : 22,
        tryKeyboard: true,
        authHandler : (methodsLeft, partialSuccess, callback) => {
          consoleLogger.silly("Methods Left: %o",methodsLeft)
          consoleLogger.silly("Partial Success: %o",partialSuccess)
          if(methodsLeft == null)
            return callback('keyboard-interactive')
          else
            return callback(false)
        },
        //debug: console.log

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
      // if .connect() is successful conn.on('ready') runs
      conn.on('ready', function() { 
        consoleLogger.verbose('Client :: ready');
        // const command = req.body.command;
        // const argument = req.body.argument;

        const command = req.script_execution[0].command;
        const argument = req.script_execution[0].args;

        //consoleLogger.silly(`Command: ${command} Arg:${argument}`)
        //commands.join(" ; ")
        conn.exec( `${command} ${argument}`, (err, stream) => {
          if (err) {
            consoleLogger.error(err) 
            //throw err;
          }
          //consoleLogger.error(stream.stderr.read())
          stream.stderr.on('data',function(data){
            consoleLogger.error("stderr" + data)
            // throw data
            //res.json(" " + data)
          })  
          stream.on('close', function() { 
            consoleLogger.info('Stream :: close')
            stream.end('\n')
            conn.end()
          })
          stream.on('data', function(data) { 
            consoleLogger.silly('OUTPUT: ' + data)
            var data2 = " " + data
            dataRes = data2
            console.log("Collected data", data2)                
          });
            
        })

      })
                
      .on('end', ()=>{
        consoleLogger.info("Conn End")
        consoleLogger.verbose("Data Res is %s", dataRes)
        // Insert a check for a file and delete it if it exists
        return resolve(dataRes)       
      })
      .on('error', function(err) {
        consoleLogger.error("The error is %o", err)  
        return reject(err)
      })
      
    })      
  }

  outputCommand(outputs, authInfo){
    var conn = new Client();
    return new Promise((resolve, reject)=>{
      var kbInt =0;
      var processCount=0;
      var completeCount = 0;
      var dataRes = [];
      conn.connect({
        //Attempts a connection to a server using the information given 
        host: authInfo.host,
        username : authInfo.username,
        password: authInfo.password,
        port : 22,
        tryKeyboard: true,
        authHandler : (methodsLeft, partialSuccess, callback) => {
          consoleLogger.silly("Methods Left: %o",methodsLeft)
          consoleLogger.silly("Partial Success: %o",partialSuccess)
          if(methodsLeft == null)
            return callback('keyboard-interactive')
          else
            return callback(false)
        },
        //debug: console.log

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
      // if .connect() is successful conn.on('ready') runs
      conn.on('ready', async()=> { 
        consoleLogger.verbose('Client :: ready');
               
          for(const output of outputs){
            const command = `ls -1t ${output.source} | head -5`;
            var mainResponse = await new Promise(async(resolve)=>{             
              conn.exec( `${command}`, (err, stream) => {
                if (err) {
                  consoleLogger.error(err) 
                  //throw err;
                }
                //consoleLogger.error(stream.stderr.read())
                stream.stderr.on('data',function(data){
                  consoleLogger.error("stderr" + data)
                  // throw data
                  //res.json(" " + data)
                })  
                stream.on('close', ()=> { 
                  consoleLogger.info('Stream :: close')
                  //stream.end('\n')
                  processCount++                  
                  return resolve("Done")  
                                  
                })
                stream.on('data', (data)=> { 
                          
                  consoleLogger.silly('OUTPUT: ' + data)
                  var data2 = "" + data
                  dataRes.push({"file":data2, "source": output.source, "file_id": output.file_id})
                  console.log("Collected data", data2)
                                            
                });                 
              
              })
            })
               
            consoleLogger.silly("The main response is, %s", mainResponse)
            completeCount++
            if(mainResponse=="Done" && completeCount== outputs.length){
              conn.end()
            }
            

          }        
          
      })
      .on('end', ()=>{
        consoleLogger.info("Conn End")
        consoleLogger.verbose("Data Res is %s", dataRes)
        // Insert a check for a file and delete it if it exists
        return resolve(dataRes)       
      })
      .on('error', function(err) {
        consoleLogger.error("The error is %o", err)  
        return reject(err)
      })

    })
    
    
  }
        
  
  

    // async init(password, place){
    //   const publicKeySsh= require('fs').readFileSync(place)
    //   const addKeyCommand= `echo ${publicKeySsh} >> ~/.ssh/authorized_keys`
    //   connectObj['password']= password;
    //   conn.on('ready', function() {
                   
    //     console.log('Client :: ready');
        
    //     //Starts an interactive shell session on the server
    //     conn.exec(addKeyCommand, function(err, stream) {
    //       if (err) throw err;
    //       stream.on('close', function(code, signal) {
    //         console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
    //         conn.end();
    //       }).on('data', function(data) {
    //         console.log('STDOUT: ' + data);
    //       }).stderr.on('data', function(data) {
    //         console.log('STDERR: ' + data);
    //       });
    //     });
    //   })
    //   .connect({
    //       //Attempts a connection to a server using the information given 
    //       connectObj     
    //   });
    // }





}
module.exports= SshRequests;