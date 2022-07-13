var mongoose = require('mongoose');
var schema = mongoose.Schema;

var roleSchema = new schema({
    name : {type:String, default:"user"},
    status: {type:Boolean, default:true},
},{
    timestamps:true
});

var Roles = mongoose.model('roles', roleSchema);
module.exports = {
    Roles
}