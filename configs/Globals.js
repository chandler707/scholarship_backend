/****************************
 SECURITY TOKEN HANDLING
 ****************************/
let Authentication = require("../app/models/AuthenticationSchema").Authtokens;
let Users = require("../app/models/UserSchema").Users;
let Model = require("../app/models/Model");
const Errorlogs = require("../app/models/ErrorSchema").Errorlogs;
const Emaillogs = require("../app/models/EmailSchema").Emaillogs;
const guestToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmZTBkODU5ODExNTNiOWUwNWNiYjhmYyIsImFsZ29yaXRobSI6IkhTMjU2IiwiaWF0IjoxNjE0MjcxNDI5LCJleHAiOjg2NDAwMDg2NTYxNTEzNTUwMH0.xm57xoeEfryK9Qwn8_5jN2EORxO6xqjhptEpI02lCtQ";
class Globals {
  constructor() {}

  // Generate Token
  getToken(id) {
    let _this = this;

    return new Promise(async (resolve, reject) => {
      try {
        // Generate Token
        let token = jwt.sign(
          {
            id: id,
            algorithm: "HS256",
            //exp: Math.floor(new Date().getTime() / 1000) + process.env.tokenExpiry
          },
          process.env.SECURITY_TOKEN,
          { expiresIn: process.env.TOKEN_EXPERY }
        );

        let params = { userId: id, token: token };
        const authentication = await new Model(Authentication).store(params);
        return resolve(token);
      } catch (err) {
        ////console.log("Get token", err);
        return reject({ message: err, status: 0 });
      }
    });
  }

  generateToken(id, flag) {
    let _this = this;

    return new Promise(async (resolve, reject) => {
      try {
        // Generate Token
        let token = jwt.sign(
          {
            id: id,
            algorithm: "HS256",
            //exp: Math.floor(new Date().getTime() / 1000) + process.env.tokenExpiry
          },
          process.env.SECURITY_TOKEN,
          { expiresIn: flag }
        );

        // let params = {userId: id, token: token};
        //
        // const authentication = await Authentication.findOneAndUpdate({userId: id}, params, {upsert: true});

        return resolve(token);
      } catch (err) {
        ////console.log("Get token", err);
        return reject({ message: err, status: 0 });
      }
    });
  }

  // Validating Token
  static async isAuthorised(req, res, next) {
    try {
      const authenticate = new Globals();

      const token = req.headers.authorization;

      // console.log("req", token)

      if (token) {
        if (!token)
          return res
            .status(401)
            .json({ status: 0, message: "Please send token with api." });

        if (token == guestToken) {
          console.log("11111111111111");
          var tokenCheck = {
            _id: "6037d3c5964f052474986760",
            userId: "6037d3c5964f052474986760",
            token: guestToken,
          };
          req.user = tokenCheck;
          next();
        } else {
          const tokenCheck = await authenticate.checkTokenInDB(token);

          //   console.log("tokenCheck", tokenCheck);
          //   var decoded = jwt.verify(token, process.env.securityToken);
          const tokenExpire = await authenticate.checkExpiration(token);

          //   if (!tokenExpire)
          //     return res
          //       .status(401)
          //       .json({ status: 0, message: "Token is expired." });
          // console.log(decoded) // bar
          //   console.log("hello", tokenCheck);

          if (!tokenCheck) {
            var dataErrorObj = {
              is_from: "API Error",
              api_name: req.route.path,
              finction_name: "",
              error_title: "Token error",
              description: "Invalid token",
            };
            authenticate.addErrorLogInDB(dataErrorObj);
            return res
              .status(401)
              .json({ status: 0, message: "Invalid user." });
          } else {
            // console.log("tokenCheck", tokenCheck)
            req.user = tokenCheck;

            next();
          }
        }
      } else {
        var dataErrorObj = {
          is_from: "API Error",
          api_name: req.route.path,
          finction_name: "",
          error_title: "Parameter invalid error",
          description: "Please send token with api.",
        };
        authenticate.addErrorLogInDB(dataErrorObj);
        return res
          .status(401)
          .json({ status: 0, message: "Please send token with api." });
      }

      // if (!jabritoken) {
      //     return res.status(401).json({ status: 0, message: 'Please send token with api.' });
      // }
      // if (token) {
      //     //////console.log(token)
      //     if (!token) return res.status(401).json({ status: 0, message: 'Please send token with api.' });

      //     const authenticate = new Globals();

      //     // const userExist = await authenticate.checkUserInDB(token);
      //     // if (!userExist) return res.status(401).json({status: 3, message: 'User is blocked by Admin.' });

      //     const tokenCheck = await authenticate.checkTokenInDB(token);
      //     if (!tokenCheck) return res.status(401).json({ status: 2, message: 'Invalid token.', statusCode: 206 });

      //     // const tokenExpire = await authenticate.checkExpiration(token);
      //     // if (!tokenExpire) return res.status(401).json({status: 2, message: 'Token is expired.' });
      // }
    } catch (err) {
      ////console.log("Token authentication", err);
      return res.send({ status: 0, message: err });
    }
  }

  static async isEmailAuthorised(req, res, next) {
    try {
      const authenticate = new Globals();

      const token = req.headers.authorization;

      //console.log("isEmailAuthorised", token)
      if (token) {
        if (!token)
          return res
            .status(401)
            .json({ status: 0, message: "Please send token with api." });

        const tokenExpire = await authenticate.checkExpiration(token);
        console.log("getting");
        if (!tokenExpire)
          return res.status(401).json({
            status: 0,
            message: "Your email token is expired. Please try again.",
          });
        next();
      } else {
        var dataErrorObj = {
          is_from: "API Error",
          api_name: req.route.path,
          finction_name: "",
          error_title: "Parameter invalid error",
          description: "Please send email token with api.",
        };
        authenticate.addErrorLogInDB(dataErrorObj);
        return res
          .status(401)
          .json({ status: 0, message: "Please send email token with api." });
      }
    } catch (err) {
      ////console.log("Token authentication", err);
      return res.send({ status: 0, message: err });
    }
  }

  // Check User Existence in DB
  checkUserInDB(token) {
    return new Promise(async (resolve, reject) => {
      try {
        // Initialisation of variables
        let decoded = jwt.decode(token);
        if (!decoded) {
          return resolve(false);
        }
        let userId = decoded.id;

        const user = await Users.findOne({ _id: userId, isDeleted: false });
        if (user) return resolve(true);

        return resolve(false);
      } catch (err) {
        ////console.log("Check user in db")
        return reject({ message: err, status: 0 });
      }
    });
  }

  // Check token in DB
  checkTokenInDB(token) {
    return new Promise(async (resolve, reject) => {
      try {
        // Initialisation of variables

        let decoded = jwt.decode(token);

        if (!decoded) {
          return resolve(false);
        }
        let userId = decoded.id;

        const authenticate = await Authentication.findOne({
          userId: userId,
          token,
        });
        // console.log("sdsd", authenticate);
        // var authenticate = { userId: userId, token: token }
        if (authenticate) return resolve(authenticate);

        return resolve(false);
      } catch (err) {
        ////console.log("Check token in db")
        return reject({ message: err, status: 0 });
      }
    });
  }

  // Check Token Expiration
  checkExpiration(token) {
    return new Promise((resolve, reject) => {
      // Initialisation of variables
      var decoded = jwt.decode(token);
      //   console.log("decoded", decoded);
      let now = parseInt(new Date().getTime() / 1000);
      let expTime = decoded.exp;
      let status = false;

      if (expTime > now) {
        status = true;
        resolve(decoded);
      }

      resolve(status);
    });
  }

  decodeToken(token) {
    return new Promise((resolve, reject) => {
      var decoded = jwt.decode(token);
      //console.log("decoded*******", decoded)
      if (!decoded) {
        return reject("Link is expired.");
      }
      return resolve(decoded);
    });
  }

  async addErrorLogInDB(dataObj) {
    try {
      const errData = await new Model(Errorlogs).store(dataObj);
      if (_.isEmpty(errData)) return "Error Not Save";
      return "Error Saved";
    } catch (error) {
      return "Error in save log error";
    }
  }

  async addEmailLogInDB(dataObj) {
    try {
      const errData = await new Model(Emaillogs).store(dataObj);
      if (_.isEmpty(errData)) return "Error Not Save";
      return "Error Saved";
    } catch (error) {
      return "Error in save log error";
    }
  }
}

module.exports = Globals;
