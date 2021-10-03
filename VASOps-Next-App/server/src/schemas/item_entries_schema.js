const Item_Entries_Scheme = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "VasOps Operations Item",
    "description": "",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "name": {
            "type": "string"
        },
        "comments": {
            "type": "string"
        },
        "operationType": {
            "type": "string",
            "description": ""
        },
        "submitDate": {
            "type": "string",
            "format": "date-time"
        },
        "source": {
            "type": "string",
            "description": ""
        },
        "schedule_date_time": {
            "type": "string",
            "format": "date-time"
        },
        // "additional_properties": true,
        "requestAttachments": {
            "type": "object",
            "properties": {
                "input": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions"
                    }
                },
                "output": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions"
                    }
                }
            }
        },
        "status": {
            "type": "string"
        },
        "moduleStatus":{
            "type":"string",
            "pattern":"^(Processed|Unprocessed)$"
        },
        "uniqueFields":{
            "type": "array",
            "items":{
                "type": "object",
                "propertyNames": {
                    "pattern": "^[A-Za-z_][A-Za-z0-9_]*$"
                }

            }
        },
        "updatedAt": {
            "type": "string",
            "format": "date-time"
        },
        "id": { "type": "string"},
        "_rid": { "type": "string"},
        "_self": { "type": "string"},
        "_etag": { "type": "string"},
        "_attachments": { "type": "string"},
        "_ts": { "type": "integer" }
    },
    "required": ["name", "source", "status", "operationType",  "moduleStatus", "schedule_date_time"],

    "definitions": {
        "attachment": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "link": {
                    "type": "string",
                    "format": "uri-reference"
                },
                "file_id": {
                    "type": "string"
                }
            },
            "required":["name", "link", "file_id"]
        }
    }
}

module.exports = Item_Entries_Scheme;