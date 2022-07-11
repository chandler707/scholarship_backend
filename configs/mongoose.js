/****************************
 MONGOOSE SCHEMAS
 ****************************/
let mongoose = require('mongoose');
let mongoDBOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
}

module.exports = function() {
    // var db = mongoose.connect(config.db, config.mongoDBOptions).then(
    //     () => { console.log('MongoDB connected') },
    //     (err) => { console.log('MongoDB connection error') }
    // );
    //console.log(config.db)
    mongoose.Promise = global.Promise;
    var db = mongoose.connect(process.env.DB_URL, mongoDBOptions)

    //Load all Schemas
    require('../app/models/AuthenticationSchema');


    return db;
};
