const config = {};

//URI of cosmosdb
config.host = process.env.HOST || "https://localhost:8081";
//Primary Key of cosmosdb
config.authKey =
  process.env.AUTH_KEY || "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==";
//Name of Database
config.databaseId = "VasOps";
//Name of Item collection
config.containerIdItem = "Items";
//Name of Setting collection
config.containerIdSetting = "Settings";

//Setup information
if (config.host.includes("https://localhost:")) {
  console.log("Local environment detected");
  console.log("WARNING: Disabled checking of self-signed certs. Do not have this code in production.");
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.log(`Go to http://localhost:${process.env.PORT || '3000'} to try the sample.`);
}

//Export config parameters
module.exports = config;