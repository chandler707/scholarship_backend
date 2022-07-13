var mongoose = require('mongoose');
var schema = mongoose.Schema;

var transaction = new schema({
    stripe_transaction_id : {type:String, default:""},
    service_id : { type: mongoose.Schema.Types.ObjectId, ref: 'Services', index: true},
    user_id : { type: mongoose.Schema.Types.ObjectId, ref: 'Users', index: true },    
    card_id : { type: mongoose.Schema.Types.ObjectId, ref: 'SaveCards', index: true}, 
    clinic_id : { type: mongoose.Schema.Types.ObjectId, ref: 'Clinics', index: true},    
    promocode_id : { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCodes', index: true},    
    service_data : [],
    clinic_data : [],
    transaction_array : [], 
    card_number:{type:String, default:""},
    card_type:{type:String, default:""},
    invoice_id:{type:Number, default:""},
    actual_amount:{type:Number, default:""},
    amount_taken:{type:Number, default:""},
    discounted_amount:{type:Number, default:""},
    discount:{type:Number, default:""},
    is_promo_apply:{type:Boolean, default:false},
    promocode:{type:String, default:""},
    currency:{type:String, default:""},
    localization:{type:String, default:""},    
    device_type:{type:String, default:""},
    os_type:{type:String, default:""},
    location:{type:String, default:""},
    time:{type:String, default:""},    
    promocode_discount : {type:String, default:""},
    status : {type : Boolean, default: true},
    is_delete : {type : Boolean, default: false},
    is_save_card : {type : Boolean, default: false},
},{
    timestamps:true
});


var Transactions = mongoose.model('Transactions', transaction);

module.exports = {
    Transactions
}