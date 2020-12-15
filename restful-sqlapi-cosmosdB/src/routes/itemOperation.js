const ItemEntry = require("../models/ItemEntry");
const merge = require('deepmerge')

class ItemOperation {
  /**
  * Handles the various APIs for displaying and managing Items
  * @param {ItemEntry} itemEntry
  */
  constructor(itemEntry) {
    this.itemEntry = itemEntry;
  }

  // Get All Items
  async showItems(req, res) {
    const querySpec = {
      // This query gets everything in the database
      query: "SELECT * FROM c" 
    };
  
    const items = await this.itemEntry.find(querySpec);
     res.json(items);
    }

  // Get By ID
  async showByIdItems(req,res){
    const item = req.params.id;
    console.log("ID",item);
    
    // This query gets item by id
    const querySpec = {
      query: "SELECT * FROM c WHERE c.id=@id",
      parameters: [
        {
          name: "@id",
          value: item
        }
      ]
    };
    
    //Find function used in itemEntry to run SQL query
    const items = await this.itemEntry.find(querySpec);
    res.json(items)
  }

  // Post Method
  async addItem(req, res) {
    //Save JSON body to be posted in item constant
    const item = req.body;
    //console.log(item);
     
    await this.itemEntry.addItem(item);
    //console.log(item);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, content-type");
    res.json(item);
  }

  // Delete Method 
  async deleteItem(req,res){
    //Save ID of item to be delete in itemID constant
    const itemId = req.params.id;
    //console.log("ID:",itemId);
    await this.itemEntry.deleteItem(itemId);
    res.json({message : 'Item Deleted'})
  }

  // Update Method
  async updateItem(req,res){
    // Find item by id and Update the document 
    const body = req.body
    const itemId = req.params.id;
    console.log("ID:",itemId);

    const doc =  await this.itemEntry.getItem(itemId)
    console.log(doc)

    //Update time for document to ensure time records are current
    const updateTime = { "updatedAt" : Date()}

    //Merge function used to help partial update of document
    const rep = merge.all([doc, body, updateTime]);
    console.log(rep);

    await this.itemEntry.updateItem(itemId,rep);
    res.json({message : 'Item Updated'})

  }

}

module.exports = ItemOperation;