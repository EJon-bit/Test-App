const Setting = require("../models/setting");
const merge = require('deepmerge');
const { databaseId } = require("../config");

class SettingOperation {
  /**
  * Handles the various APIs for displaying and managing Settings
  * @param {Setting} setting
  */
  constructor(setting) {
    this.setting = setting;
  }

  // Get All Items
  async showSettings(req, res) {
    const querySpec = {
      query: "SELECT * FROM c"
      // This query gets everything in the database
    };

    const settings = await this.setting.find(querySpec);
     res.json(settings);
  }

  // Get By ID
  async showByIdSettings(req,res){
    const setting = req.params.id;
    console.log("ID",setting);
    // This query gets item by id
    const querySpec = {
      query: "SELECT * FROM c WHERE c.id=@id",
      parameters: [
        {
          name: "@id",
          value: setting
        }
      ]
    };
    const settings = await this.setting.find(querySpec);
    res.json(settings)
  }

  // Post Method
  async addSetting(req, res) {
    const setting = req.body;
    console.log(setting);
    await this.setting.addSetting(setting);
    console.log(setting);
    res.json(setting);
  }

  // Delete Method 
  async deleteSetting(req,res){
    const settingId = req.params.id;
    console.log("ID:",settingId);
    await this.setting.deleteSetting(settingId);
    res.json({message : 'Setting Deleted'})
  }

  // Update Method
  async updateSetting(req,res){
    // Find Setting by id and Update the document ??
    const body = req.body
    const settingId = req.params.id;
    console.log("ID:",settingId);

    const doc =  await this.setting.getSetting(settingId)
    console.log(doc)

    const updateTime = { "updatedAt" : Date()}
    const rep = merge.all([doc, body, updateTime]);
    console.log(rep);

    await this.setting.updateSetting(settingId,rep);

    res.json({message : 'Setting Updated'})
  }
}

module.exports = SettingOperation;