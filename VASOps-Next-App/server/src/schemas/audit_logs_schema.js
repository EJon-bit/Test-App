const Audit_Logs_Scheme = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Logs schema",
    "description": "",
    "type": "object",
    "additionalProperties": false,
    "properties": {               
      "user_id":{ "type": "string"},       
      "log_data":{
        "type":"array",
        "items":{
          "type":"object",
          "properties":{
            "affected_systems":{
              "type": "array",
              "items": {
                  "type": "string",
                  "pattern":"^(Database|Blob)$"
              }
            }, //whether db and/or blob storage      
            "action": { 
              "oneOf": [  //either Create/Update/Delete     
                {
                  "type":"object",
                  "properties": {  
                    "time":{ 
                      "type": "string",
                      "format": "date-time"
                    },           
                    "action_type":{
                      "type": "string",
                      "pattern": "^Delete$"
                    },
                    "document_deleted":{
                      "type":"object",
                      "properties": { 
                        "id":{ "type": "string" },
                        "name":{ "type": "string" },
                        "operation": { "type": "string" },
                        "section_affected":{
                          "type":"string",
                          "pattern": "^(ItemEntries|Settings)$"
                        },
                      },
                      "required": [ "id", "name", "section_affected" ]
                    }
                    
                  }
                },
                {
                  "type":"object",
                  "properties": {  
                    "time":{ 
                      "type": "string",
                      "format": "date-time"
                    },           
                    "action_type":{
                      "type": "string",
                      "pattern": "^Create$"
                    },
                    "document_created":{
                      "type":"object",
                      "properties": { 
                        "id":{ "type": "string" },
                        "name":{ "type": "string" },
                        "operation": { "type": "string" },
                        "section_affected":{
                          "type":"string",
                          "pattern": "^(ItemEntries|Settings)$"
                        },
                      },
                      "required": [ "id", "name", "section_affected" ]
                    }
                    
                  }
                },
                { 
                  "type":"object",
                  "properties": { 
                    "action_type":{
                      "type": "string",
                      "pattern": "^Update$"
                    },
                    "action_effects":{
                      "oneOf": [
                        {
                          "type":"object",
                          "properties": {
                            "time":{ 
                              "type": "string",
                              "format": "date-time"
                            },      
                            "section_affected":{
                              "type":"string",
                              "pattern": "^ItemEntries$"
                            },
                            "changes":{
                              "type":"array",
                              "items":{
                                "anyOf": [
                                  {
                                    "type":"object",
                                    "properties": {
                                      "change_type":{
                                        "type":"string",
                                        "pattern":"^file$"
                                      },
                                      "new_files":{
                                        "type":"array",
                                        "items":{"type":"string"}                                        
                                      },
                                      "old_files":{
                                        "type":"array",
                                        "items":{"type":"string"}                                        
                                      },
                                    },
                                    "required": [ "change_type", "new_files", "old_files" ]
                                  },
                                  {
                                    "type":"object",
                                    "properties": {
                                      "change_type":{
                                        "type":"string",
                                        "pattern":"^field$"
                                      },
                                      "fields":{
                                        "type":"array",
                                        "items":{
                                          "type":"object",
                                          "properties": {
                                            "name":{"type":"string"},
                                            "old_value":{"type":"string"},
                                            "new_value":{"type":"string"}
                                          }
                                        }
                                      },                               
                                    },
                                    "required": [ "change_type", "fields" ]
                                  }
                                ]
                              }                             
                            }
                          },
                          "required": [ "section_affected", "changes" ]            
                        },     
                        {
                          "type":"object",
                          "properties": {
                            "time":{ 
                              "type": "string",
                              "format": "date-time"
                            },      
                            "section_affected":{
                              "type":"string",
                              "pattern": "^Settings$"
                            },
                            "setting_type":{
                              "type":"string",
                              "pattern": "^(popular_links|operations_processes|modules|Model)$"
                            }
                          },
                          "required": ["section_affected", "setting_type", "time"]
                        }                  
                      ]
                    },
                    "document_updated":{
                      "type":"object",
                      "properties": { 
                        "id": { "type": "string"},
                        "name": { "type": "string"},
                        "operation": { "type": "string"},
                      }
                    }
                  }
                }
              ]
            },
          }
        }
      },
      "id": { "type": "string"},
      "_rid": { "type": "string"},
      "_self": { "type": "string"},
      "_etag": { "type": "string"},
      "_attachments": { "type": "string"},
      "_ts": { "type": "integer" }
    },
    "required":[ "user_id", "log_data" ]     
}

module.exports = Audit_Logs_Scheme;