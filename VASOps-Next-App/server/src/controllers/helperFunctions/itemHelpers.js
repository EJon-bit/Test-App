const ItemEntry = require("../../models/ItemEntry")

const transform = require('lodash.transform')
const isEqual = require('lodash.isequal')
const isArray = require('lodash.isarray')
const isObject = require('lodash.isobject')
const isDate = require('lodash.isdate')


class ItemHelpers {
    /**
    * Handles the various APIs for displaying and managing Items
    * @param {ItemEntry} itemEntry
    **/
    constructor(itemEntry) {
      this.itemEntry = itemEntry      
    }

     /***  Helper Functions ***/
    async difference(origObj, newObj) {
        function changes(newObj, origObj) {
        let arrayIndexCounter = 0
        return transform(newObj, (result, value, key)=> {
            if (!isEqual(value, origObj[key])) {
            let resultKey = isArray(origObj) ? arrayIndexCounter++ : key
            result[resultKey] = (isObject(value) && isObject(origObj[key])) ? isDate(value) ? value : changes(value, origObj[key]) : value
            }
        });
        };
        return changes(newObj, origObj);   
    }

    async fileParse(file, operation){

    // const file = req.files.attachment
        let fileArray = []
        if (file.length > 1){
            for(let x = 0; x < file.length; x++){
                const files = file[x].data
                const fileName = file[x].name
                const stream = getStream(files)
                const streamLength = files.length
                const fileUri = await this.itemEntry.storeItem(stream, streamLength, fileName, operation)
                const relativePath = fileUri.replace(/.*\/vasfiles\//,"")       
                fileArray.push(relativePath) 
            }
            return fileArray
        }
        else{
            const files = file.data
            const fileName =file.name
            const stream = getStream(files)
            const streamLength = files.length
            const fileUri = await this.itemEntry.storeItem(stream, streamLength, fileName, operation);
            const relativePath = fileUri.replace(/.*\/vasfiles\//,"");
            return relativePath
        }
    }

    async processExistingFiles(body, doc, id){
        let retainedFiles=null
        let docInputIndexes=[];
        let matchedIndexes=[];
        let attachments=[];
        if("attachment" in body && body.attachment!==''){
            console.log("Unparsed Attachments", body.attachment)
            if(Array.isArray(body.attachment)){
                body.attachment.forEach((file)=>{
                attachments.push(JSON.parse(file))
                })
            }
            else{
                attachments= JSON.parse(body.attachment);
            }
            
            let files=null;

            console.log("attachments:", attachments);
            if (Array.isArray(attachments)){
                files = attachments
            }
            else{
                files=[attachments];
            }

            //forEach attachments in body filter attachments in doc.requestAttachments.input to return attachments tht match then push it to a final array
            files.forEach((file, i)=>{      
                console.log("The file is", file);
                retainedFiles=doc.requestAttachments.input.filter((input,index)=>{
                    if(i==0){
                        docInputIndexes.push(index);            
                    }
                    if(input.attachment.name===file.attachment.name){
                        matchedIndexes.push(index);           
                    }
                    
                    return input.attachment.name===file.attachment.name
                })       
            })
            console.log("doc Indexes", docInputIndexes);
            console.log("matched Indexes", matchedIndexes);
            console.log("retained Files", retainedFiles);

            let delFileIndexes= docInputIndexes.filter(docIndex => !matchedIndexes.includes(docIndex));      
            
            return {retainedFiles, delFileIndexes};//return this so that doc can be modified
        }
    }
}  

module.exports = ItemHelpers