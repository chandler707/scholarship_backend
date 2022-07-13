module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../configs/Globals");
  const UsersController = require("../controllers/UsersController");
  const DropdownListController = require("../controllers/DropdownListController");

  router.get("/get_all_settings", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.getAllSettings();
  });

  router.post("/send_otp", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.sendOtp();
  });

  router.post("/resend_otp", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.resendOtp();
  });

  router.post("/otp_verify", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.otpVerify();
  });

  router.post(
    "/add_update_passcode",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new UsersController().boot(req, res);
      return userObj.addUpdatePasscode();
    }
  );

  router.post(
    "/signin_with_passcode",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new UsersController().boot(req, res);
      return userObj.signinPasscode();
    }
  );

  router.post(
    "/update_user_profile",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new UsersController().boot(req, res);
      return userObj.updateUserProfile();
    }
  );

  router.get("/get_user_profile", Globals.isAuthorised, (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.getUserProfile(false);
  });

  router.post("/get_user_profile_by_id", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.getUserProfile(true);
  });

  router.post("/check_showktid_exist", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.checkShowktidExist();
  });

  router.post("/user_logout", (req, res, next) => {
    ////console.log("headers", req.headers)
    const userObj = new UsersController().boot(req, res);
    return userObj.userLogout();
  });

  router.post("/social_login", (req, res, next) => {
    ////console.log("headers", req.headers)
    const userObj = new UsersController().boot(req, res);
    return userObj.socialLogin();
  });

  router.post("/user_listing", Globals.isAuthorised, (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.userListing();
  });

  router.post("/download_image", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.downloadImage();
  });

  router.post("/change_user", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.changeUser();
  });

  router.post("/get_popular_users", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.getPopularUser();
  });

  router.post("/get_countries", (req, res, next) => {
    const userObj = new DropdownListController().boot(req, res);
    return userObj.GetCountry();
  });
  router.post("/get_states", (req, res, next) => {
    const userObj = new DropdownListController().boot(req, res);
    return userObj.GetState();
  });
  router.post("/get_cities", (req, res, next) => {
    const userObj = new DropdownListController().boot(req, res);
    return userObj.GetCity();
  });
  router.post("/get_languages", (req, res, next) => {
    const userObj = new DropdownListController().boot(req, res);
    return userObj.Getlanguage();
  });

  router.post("/user_register", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.register();
  });

  router.post("/user_login", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.userSignIn();
  });

  app.use(process.env.BASE_API_URL, router);
};
