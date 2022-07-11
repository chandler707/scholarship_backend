/**************************
 AUTHENTICATION SCHEMA INITIALISATION
 **************************/
var Schema = require('mongoose').Schema;
var bcrypt = require('bcrypt');
var mongoose = require('mongoose');

var authtokensSchema = new Schema({

    userId:   { type: Schema.Types.ObjectId, ref: 'User', index: true },
    token:  String,


},
    {timestamps:true});

var Authtokens = mongoose.model('authtokens', authtokensSchema);

module.exports = {
    Authtokens: Authtokens,
}

