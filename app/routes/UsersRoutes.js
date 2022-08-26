const { isAuthorised } = require("../../configs/Globals");

module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../configs/Globals");
  const UsersController = require("../controllers/UsersController");
  const CourseController = require("../controllers/CourseController");
  router.post(
    "/update_user_profile",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new UsersController().boot(req, res);
      return userObj.updateUserProfile();
    }
  );
  router.post(
    "/update_user_details",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new UsersController().boot(req, res);
      return userObj.UpdateUserDetails();
    }
  );
  router.post(
    "/update_university_details",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new UsersController().boot(req, res);
      return userObj.UpdateUniversityDetails();
    }
  );

<<<<<<< HEAD
  router.post("/get_user_profile", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.GetUserProfile();
=======
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
>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab
  });

  router.post("/user_logout", (req, res, next) => {
    ////console.log("headers", req.headers)
    const userObj = new UsersController().boot(req, res);
    return userObj.userLogout();
  });

  router.post("/user_register", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.Register();
  });

  router.post("/user_login", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.UserSignIn();
  });
  router.post("/add_course", isAuthorised, (req, res, next) => {
    const userObj = new CourseController().boot(req, res);
    return userObj.AddCourse();
  });
<<<<<<< HEAD
  router.post("/get_course", (req, res, next) => {
    const userObj = new CourseController().boot(req, res);
    return userObj.GetCourse();
=======

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
>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab
  });

  app.use(process.env.BASE_API_URL, router);
};
