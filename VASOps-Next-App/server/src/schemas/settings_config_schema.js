const settings_config_scheme = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "VasOps Configuration Settings",
    "description": "",
    "type": "object",
    "properties": {
        "type": {
            "type": "string",
            "enum": [
                "popular_links",
                "operations_processes",
                "operations_models",
                "modules"
            ]
        },
        "data": {
            "anyOf": [
                {
                    "$ref": "#/definitions/popular_links"
                },
                {
                    "$ref": "#/definitions/operations_processes"
                },
                {
                    "$ref": "#/definitions/operations_models"
                },
                {
                    "$ref": "#/definitions/modules"
                }
            ]
        },
        "updatedAt": {
            "type": "string",
            "format": "date-time"
        }
    },
    "required": [
        "type",
        "updatedAt"
    ],
    "definitions": {
        "popular_links": {
            "type": "array",
            "items": {
                "$ref": "#/definitions/link"
            }
        },
        "operations_processes": {
            "type": "array",
            "items": {
                "$ref": "#/definitions/process"
            }
        },
        "operations_models": {
            "type": "array",
            "items": {
                "$ref": "#/definitions/model"
            }
        },
        "modules": {
            "type": "array",
            "items": {
                "$ref": "#/definitions/module_settings"
            }
        },
        "link": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "name": {
                    "type": "string"
                },
                "icon": {
                    "type": "string",

                },
                "link": {
                    "type": "string",

                }
            },
            "required": ["link"]
        },
        "process": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "id": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "description": {
                    "type": "string"
                },
                "request_template": {
                    "type": "object",
                    "properties": {
                        "request_statuses": {
                            "type": "object",
                            "properties": {
                                "default": {
                                    "type": "string"
                                },
                                "statuses": {
                                    "type": "array",
                                    "items": {
                                        "type": "string"
                                    }
                                }
                            }
                        },
                        "request_properties": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {
                                        "type": "string"
                                    },
                                    "data_type":{																						
                                        "oneOf": [
                                            {"type":"string","format":"date-time"},                                          
                                            {"type":"string"},
                                            {"type":"array","items" : {"type": "string"}},
                                            {"type":"boolean"}
                                        ]
                                    },			
                                    "required": {
                                        "type": "boolean"
                                    }
                                }
                            }
                        },
                        "request_attachments": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {
                                        "type": "string"

                                    },
                                    "name": {
                                        "type": "string"
                                    },
                                    "type": {
                                        "type": "string",
                                        "enum": [
                                            "input",
                                            "output"
                                        ]
                                    },
                                    "required": {
                                        "type": "boolean"
                                    }
                                }
                            }
                        }
                    }
                },
                "model": {
                    "type":"object",
                    "properties":{
                        "type": {
                            "type": "string"
                        },
                        "data": {
                            "type": "object",
                            "properties":{
                                "host":{
                                    "type":"string",
                                },
                                "file_transfers":{
                                    "type":"array",
                                    "items":{
                                        "type":"object",
                                        "properties":{
                                            "file_id":{
                                                "type":"string"
                                            },
                                            "destination":{
                                                "type":"string"
                                            },
                                            "source":{
                                                "type":"string"
                                            }
                                        }                                       
                                    }
                                },
                                "script_execution":{
                                    "type":"array",
                                    "items":{
                                        "type":"object",
                                        "properties":{
                                            "command":{
                                                "type":"string"
                                            },
                                            "args":{
                                                "type":"array",
                                                "items":{
                                                    "type":"string"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }                   
                }
            },
            "required": [
                "name",
                "model",
                "id",
                "request_template"
            ]
        },
        "model": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "name": {
                    "type": "string"
                },
                "description": {
                    "type": "string"
                },
                "model_data_template": {
                    "type": "object",
                    "properties":{
                        "current_system":{
                            "type": "string",
                            "enum": [
                                "HLR",
                                "SDP",
                                "AF"
                            ]
                        },
                        "scripts_involved":{
                            "type": "array",
                            "items":{
                                "type":"string"
                            }
                        },
                        "file_destination":{
                            "type":"string"
                        }
                    }
                },
                "endpoint": {
                    "type": "string"
                }
            },
            "required": [
                "name",
                "endpoint"
            ]
        },
        "module_settings" : {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "name": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "target": {
                "type": "array",
                "items": {
                    "type":"object",
                    "propertyNames": {
                        "pattern": "^[A-Za-z_][A-Za-z0-9_]*$"
                    }
                }
              },
              "endpoint": {
                "type": "string"
              }
            }
        }
    }
}

module.exports = settings_config_scheme;
