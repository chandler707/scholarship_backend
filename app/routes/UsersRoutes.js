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

  router.post("/get_user_profile", (req, res, next) => {
    const userObj = new UsersController().boot(req, res);
    return userObj.GetUserProfile();
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
  router.post("/get_course", (req, res, next) => {
    const userObj = new CourseController().boot(req, res);
    return userObj.GetCourse();
  });

  app.use(process.env.BASE_API_URL, router);
};
