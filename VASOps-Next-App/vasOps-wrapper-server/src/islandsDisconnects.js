const fetch = require('node-fetch');
const cron = require('node-cron');
const fs = require('fs');
const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');

//function to make fetch request to post new disconnects job to db 
const createJob=()=>{

    const requestBody={
        "name": `Monthly Batch Disconnects- Islands_${new Date()}`,
        "comments": "",
        "operationType": "Subscriber Disconnects",
        "submitDate": new Date(),
        "source": "Automated System",
        "schedule_date_time": new Date(),
        "status": "Submitted",
        "uniqueFields":[{}],
        "updatedAt": new Date(),

    }

    const requestOptions = {
        method: 'POST',                      
        body: JSON.stringify(requestBody),  
        headers: {
            'Content-Type': 'application/json'
        } 
    }

    const job= fetch('http://localhost:5000/itemOperation/addItem', requestOptions).then(async(response)=>{
      const jsonRes = await response.json()

      if(!response.ok){
        const error = (jsonRes && jsonRes.message) || response.status;
        return Promise.reject(error);
      }
      else{
        console.log("Im here")
        consoleLogger.info("Job created with data: %o", jsonRes)      
        return {"id": jsonRes.id, "status": "Job Successfully Created in DB"}
      } 
    })
    .catch((error)=>{    
      return Promise.reject("Something went wrong", error);
    })

    return job
}

const executeJob=(job)=>{
 
    const requestOptions = {
        method: 'POST',                      
        body: JSON.stringify({"id": job.id, "disconnectsType": job.uniqueFields[0]}),  
        headers: {
            'Content-Type': 'application/json'
        } 
    }

    const executionStatus= fetch('http://localhost:5000/itemOperation/executeJob', requestOptions).then(async(response)=>{
      const jobExeData = await response.json()

      if(!response.ok){
        const error = (jsonRes && jsonRes.message) || response.status;
        return Promise.reject(error);
      }
      else{
        console.log("Im here")
        consoleLogger.info("Json res %o", jobExeData)      
        return {"id": "","model":""}
      } 
    })
    .catch((error)=>{    
      return Promise.reject("Something went wrong", error);
    })

    return executionStatus
}


/****************************************************************************************
*                           Initiates Islands Removal                                   *
*       Creates Islands Disconnects Job monthly at 9.a.m. AND executes the job          * 
*****************************************************************************************/
cron.schedule('0 9 1 * *', ()=>{

    //STEP 1: Make POST request to DB using fetchAPI
    const jobCreationStat= createJob();
    consoleLogger.info("Job was just created. The details:\n %o",jobCreationStat);
    
    //STEP 2: Execute job on remote servers
    const jobExecutionStatus= executeJob();
    consoleLogger.info("Job was just created. The details:\n %o",jobCreationStat);
})


/****************************************************************************************
*                           HSS and SMS removal tracker.                                *
* Performs daily checks at 4.p.m. for email receipts confirming Island removals on HLR  *         
*****************************************************************************************/
cron.schedule('0 16 * * *', ()=>{
   
})