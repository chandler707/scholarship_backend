/****************************
 EXPRESS AND ROUTING HANDLING
 ****************************/
let express = require('express');
morgan = require('morgan');
compress = require('compression');
bodyParser = require('body-parser');
methodOverride = require('method-override');
session = require('express-session');
jwt = require('jsonwebtoken');
multer = require('multer'); //middleware for handling multipart/form-data
multiparty = require('multiparty'); /*For File Upload*/
cors = require('cors'); //For cross domain error
// crypto = require('crypto');
//CryptoJS = require('node-cryptojs-aes').CryptoJS; //For Encryption and Decryption
//fs = require('file-system');
timeout = require('connect-timeout');
var cron = require('node-cron');
http = require('http');
var responseTime = require('response-time')

module.exports = function() {
    console.log('env' + process.env.NODE_ENV)
    var app = express();
    //console.log(__dirname)
    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    } else if (process.env.NODE_ENV === 'production') {
      app.use(compress({ threshold: 2 }));
    }

    app.use(bodyParser.urlencoded({limit:"500mb",
        extended: true
    }));

    app.use(bodyParser.json({limit: '500mb', extended: true}));

    //app.use(express.json({limit: '50mb'}));
    //app.use(express.urlencoded({limit: '50mb'}));


    app.use(methodOverride());

    app.use(cors());

    //app.use(cors({origin: 'https://172.16.87.57:4100'}));
    // app.use(morgan('combined')); // Just uncomment this line to show logs.

    // =======   Settings for CORS
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    //app.use(timeout(120000));
    app.use(timeout('1000s'));
    app.use(responseTime())
    app.use(haltOnTimedout);

    function haltOnTimedout(req, res, next){
      //console.log("haltOnTimedout")
      if (!req.timedout) next();
    }
    
    app.set('trust proxy', 1)
    app.use(session({
      cookie: { maxAge: 30000 },
      saveUninitialized: true,
      resave: true,
      secret: process.env.SESSION_SECRET,
      name: 'tindersagarsecuresession'
    }));

    // =======   Routing

    require('../app/routes/UsersRoutes')(app, express);
    require('../app/routes/AdminRoutes')(app, express);
    return app;
    
  };
