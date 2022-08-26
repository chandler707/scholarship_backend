/****************************
 MONGOOSE SCHEMAS
 ****************************/
let mongoose = require("mongoose");
let mongoDBOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
};

module.exports = function () {
  // var db = mongoose.connect(config.db, config.mongoDBOptions).then(
  //     () => { console.log('MongoDB connected') },
  //     (err) => { console.log('MongoDB connection error') }
  // );
  //console.log(config.db)
  mongoose.Promise = global.Promise;
  var db = mongoose
    .connect(
      "mongodb://DBUser:DBUSERpassword@cluster0-shard-00-00.5tqct.mongodb.net:27017,cluster0-shard-00-01.5tqct.mongodb.net:27017,cluster0-shard-00-02.5tqct.mongodb.net:27017/scolarship?ssl=true&replicaSet=atlas-f4kqo6-shard-0&authSource=admin&retryWrites=true&w=majority",
      mongoDBOptions
    )
    .then(() => {
      console.log("Database connected!!");
    })
    .catch((error) => {
      console.log(error);
    });

  //Load all Schemas
  require("../app/models/AuthenticationSchema");

  return db;
};
