require('dotenv').config()
const {systemLogger, consoleLogger} = require('../utils/logger')
const Users = require("../models/Users")


class userOperation{

     /**
  * Handles the various APIs for displaying and managing Items
  * @param {Users} users
  */
  constructor(users) {
    this.users = users
  }

  async addUser(req, res){
    const user = req.body
    const username = req.body.userId

    await this.users.addUser(user)
    consoleLogger.info(`User ${username} created`)
    res.json(user)

  }
  async loginUser(req, res){
    // validate user input against database
    //var  = req.body
    console.log("The body is", req.body)
    var pwd = req.body.password
    consoleLogger.silly(pwd)
    var userId = req.body.username
    consoleLogger.silly(userId)
    const querySpec = {
      // This query gets everything in the database
      query: "SELECT c.password, c.userId FROM c WHERE (c.userId= @username AND c.password=@password)", 
      parameters: [
        {
          name: "@username",
          value: userId
        },
        {
          name: "@password",
          value: pwd
        }       
      ]
    
    }
    var accountUser = await this.users.find(querySpec)  
    consoleLogger.silly("%o Logged in",accountUser)
    
    if ( accountUser.length == 1 ){ 

      systemLogger.info(`${userId} logged in from ${req.ip}`)
      res.json("User Validated");

    }
    else{
      systemLogger.warn(`${userId} validation failed incorrect Username or Password`);
      res.status(400).send("Password invalid");      
    }
  }
   




}

module.exports = userOperation;