var mongoose = require('mongoose');
var schema = mongoose.Schema;

var sponcersDateIdeaSchema = new schema({
    sponcers_id : { type: mongoose.Schema.Types.ObjectId, ref: 'sponcers', index: true },  
    user_id : { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true },  
    status: {type:Boolean, default:true},
},{
    timestamps:true
});

var sponcersDateIdeas = mongoose.model('sponcers_date_ideas', sponcersDateIdeaSchema);
module.exports = {
    sponcersDateIdeas
}