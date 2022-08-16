const { isAuthorised } = require("../../configs/Globals");

module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../configs/Globals");
  const UsersController = require("../controllers/UsersController");
  const DropdownListController = require("../controllers/DropdownListController");
  const UserDateController = require("../controllers/UserDateController");

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

  router.post(
    "/update_user_profile_step_one",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new UsersController().boot(req, res);
      return userObj.updateUserProfileStepOne();
    }
  );

  router.post(
    "/update_user_profile_step_two",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new UsersController().boot(req, res);
      return userObj.updateUserProfileStepTwo();
    }
  );

  router.post(
    "/update_user_profile_step_three",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new UsersController().boot(req, res);
      return userObj.updateUserProfileStepThree();
    }
  );

  router.post(
    "/delete_profile_image",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new UsersController().boot(req, res);
      return userObj.deleteProfileImage();
    }
  );

  router.post(
    "/upload_profile_image",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new UsersController().boot(req, res);
      return userObj.uploadProfileImage();
    }
  );

  router.post(
    "/set_profile_image",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new UsersController().boot(req, res);
      return userObj.setProfileImage();
    }
  );

  router.post(
    "/sort_image",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new UsersController().boot(req, res);
      return userObj.sortImage();
    }
  );

  router.post(
    "/update_profile_image",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new UsersController().boot(req, res);
      return userObj.updateProfileImage();
    }
  );

  router.post(
    "/update_rest_image",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new UsersController().boot(req, res);
      return userObj.updateRestImage();
    }
  );

  router.post("/get_user_profile", Globals.isAuthorised, (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.getUserProfile(false);
  });

  router.post("/check_email_exist", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.checkEmailExist();
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
    return userObj.Register();
  });

  router.post("/user_login", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.UserSignIn();
  });

  router.post("/find_near_match", Globals.isAuthorised, (req, res) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.FindMatches();
  });

  router.post("/create_date", Globals.isAuthorised, (req, res) => {
    const userObj = new UserDateController().boot(req, res);
    return userObj.AddUserDate();
  });

  router.post("/get_date_detail", Globals.isAuthorised, (req, res) => {
    const userObj = new UserDateController().boot(req, res);
    return userObj.getDateDetail();
  });

  router.post("/get_date", Globals.isAuthorised, (req, res) => {
    const userObj = new UserDateController().boot(req, res);
    return userObj.GetUserDate();
  });

  router.post("/get_user_invitation", Globals.isAuthorised, (req, res) => {
    const userObj = new UserDateController().boot(req, res);
    return userObj.getUserInvitation();
  });

  router.post("/send_date_request", Globals.isAuthorised, (req, res) => {
    const userObj = new UserDateController().boot(req, res);
    return userObj.sendDateRequest();
  });

  router.post("/accept_date_request", Globals.isAuthorised, (req, res) => {
    const userObj = new UserDateController().boot(req, res);
    return userObj.AcceptDateRequest();
  });

  app.use(process.env.BASE_API_URL, router);
};
