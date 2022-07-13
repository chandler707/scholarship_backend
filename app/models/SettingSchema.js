var mongoose = require('mongoose');
var schema = mongoose.Schema;

var settingSchema = new schema({
    cdn_url : {type:String, default:""},
    api_url : {type:String, default:""},
    web_url : {type:String, default:""},
},{
    timestamps:true
});

var Settings = mongoose.model('settings', settingSchema);

module.exports = {
    Settings
}