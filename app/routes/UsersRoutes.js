const { isAuthorised } = require("../../configs/Globals");

module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../configs/Globals");
  const UsersController = require("../controllers/UsersController");
  const CourseController = require("../controllers/CourseController");
  const LocationController = require("../controllers/LocationController");
  const ApplicationController = require("../controllers/ApplicationController");
  const BulkEntryController = require("../controllers/BulkEntryController");
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

  router.post("/get_user_profile", isAuthorised, (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.GetUserProfile();
  });

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

  router.post("/set_profile_image", Globals.isAuthorised, (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.setProfileImage();
  });

  router.post("/sort_image", Globals.isAuthorised, (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.sortImage();
  });

  router.post(
    "/update_profile_image",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new UsersController().boot(req, res);
      return userObj.updateProfileImage();
    }
  );

  router.post("/update_rest_image", Globals.isAuthorised, (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.updateRestImage();
  });

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
  router.post("/forgot_password", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.UserForgorPassword();
  });
  router.post("/change_password", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.UserChanegPassword();
  });
  router.post("/add_course", isAuthorised, (req, res, next) => {
    const userObj = new CourseController().boot(req, res);
    return userObj.AddCourse();
  });

  router.post("/get_course", isAuthorised, (req, res, next) => {
    const userObj = new CourseController().boot(req, res);
    return userObj.GetCourse();
  });

  router.post("/update_course", isAuthorised, (req, res, next) => {
    const userObj = new CourseController().boot(req, res);
    return userObj.UpdateCourse();
  });

  router.post("/student_country", (req, res, next) => {
    const userObj = new LocationController().boot(req, res);
    return userObj.GetStudentCountry();
  });
  router.post("/student_state", (req, res, next) => {
    const userObj = new LocationController().boot(req, res);
    return userObj.GetStudentState();
  });
  router.post("/student_state", (req, res, next) => {
    const userObj = new LocationController().boot(req, res);
    return userObj.GetStudentState();
  });
  router.post("/add_application", isAuthorised, (req, res, next) => {
    const userObj = new ApplicationController().boot(req, res);
    return userObj.AddApplicaiton();
  });
  router.post("/get_application", isAuthorised, (req, res, next) => {
    const userObj = new ApplicationController().boot(req, res);
    return userObj.GetApplication();
  });
  router.post("/update_application", isAuthorised, (req, res, next) => {
    const userObj = new ApplicationController().boot(req, res);
    return userObj.UpdateApplication();
  });
  router.post("/entry", (req, res, next) => {
    const userObj = new BulkEntryController().boot(req, res);
    return userObj.UniversityEntry();
  });

  app.use(process.env.BASE_API_URL, router);
};
