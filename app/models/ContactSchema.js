var mongoose = require('mongoose');
var schema = mongoose.Schema;


var contact = new schema({
    name : {type:String,default:null},
    email : {type:String, default:null},
    phone : {type:String, default:null},
    description : {type:String, default:null},
},{
    timestamps:true
});

var Contacts = mongoose.model('Contact', contact);

module.exports = {
    Contacts
}