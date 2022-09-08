const { isAuthorised } = require("../../configs/Globals");
const CourseController = require("../controllers/CourseController");

module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../configs/Globals");
  const AdminController = require("../controllers/AdminController");
  const UserController = require("../controllers/UsersController");
  const SettingController = require("../controllers/SettingController");
  const LocationController = require("../controllers/LocationController");
  const LanguageController = require("../controllers/LanguageController");
  const DropdownsController = require("../controllers/DropdownsController");
  const AttributeController = require("../controllers/AttributeController");

  const Logo = require("../controllers/LogoController");

  router.post("/admin_login", (req, res, next) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.adminLogin();
  });
  router.post("/admin_register", (req, res, next) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.AdminRegister();
  });

  router.post("/get_roles", (req, res, next) => {
    const adminObj = new RoleController().boot(req, res);
    return adminObj.GetRole();
  });

  router.post("/edit_admin_profile", (req, res, next) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.editProfile();
  });

  router.post("/get_user_data", Globals.isAuthorised, (req, res, next) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.getUserData();
  });

  router.post("/update_user_data", Globals.isAuthorised, (req, res, next) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.updateUserData();
  });

  router.post("/add_user_data", Globals.isAuthorised, (req, res, next) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.addUserData();
  });

  router.post("/get_admin_profile", isAuthorised, (req, res, next) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.AdminProfile();
  });

  router.post("/update_admin_profile", isAuthorised, (req, res, next) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.updateAdminProfile();
  });

  router.post("/admin_send_noti", (req, res, next) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.sendNotificationToUser();
  });

  router.post(
    "/get_user_location_info",
    Globals.isAuthorised,
    (req, res, next) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.getUserLocationInfo();
    }
  );

  router.post(
    "/get_all_dashboard_data",
    Globals.isAuthorised,
    (req, res, next) => {
      const adminObj = new AdminController().boot(req, res);
      return adminObj.getAllDashboardData();
    }
  );

  router.post("/user_list", (req, res, next) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.UserList();
  });

  router.post("/change_admin_password", isAuthorised, (req, res, next) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.changePasswordAdmin();
  });

  router.post("/get_university_profile", isAuthorised, (req, res, next) => {
    const adminObj = new UserController().boot(req, res);
    return adminObj.GetUniversityProfile();
  });
  router.post("/change_user_status", (req, res, next) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.ChangeUserStatus();
  });
  router.post("/add_category", (req, res, next) => {
    const adminObj = new LanguageController().boot(req, res);
    return adminObj.AddCoursesCategory();
  });
  router.post("/get_category", (req, res, next) => {
    const adminObj = new LanguageController().boot(req, res);
    return adminObj.GetCoursesCategory();
  });
  router.post("/update_category", (req, res, next) => {
    const adminObj = new LanguageController().boot(req, res);
    return adminObj.UpdateCoursesCategory();
  });
  router.post("/update_state", (req, res, next) => {
    const adminObj = new LocationController().boot(req, res);
    return adminObj.UpdateState();
  });
  router.post("/add_language", (req, res, next) => {
    const adminObj = new LanguageController().boot(req, res);
    return adminObj.AddLanguage();
  });
  router.post("/get_language", (req, res, next) => {
    const adminObj = new LanguageController().boot(req, res);
    return adminObj.GetLanguage();
  });
  router.post("/update_language", (req, res, next) => {
    const adminObj = new LanguageController().boot(req, res);
    return adminObj.UpdateLanguage();
  });
  router.post("/add_country", (req, res, next) => {
    const adminObj = new LocationController().boot(req, res);
    return adminObj.AddCountry();
  });
  router.post("/get_country", (req, res, next) => {
    const adminObj = new LocationController().boot(req, res);
    return adminObj.GetCountry();
  });
  router.post("/update_country", (req, res, next) => {
    const adminObj = new LocationController().boot(req, res);
    return adminObj.UpdateCountry();
  });
  router.post("/add_state", (req, res, next) => {
    const adminObj = new LocationController().boot(req, res);
    return adminObj.AddState();
  });
  router.post("/get_state", (req, res, next) => {
    const adminObj = new LocationController().boot(req, res);
    return adminObj.GetState();
  });
  router.post("/update_state", (req, res, next) => {
    const adminObj = new LocationController().boot(req, res);
    return adminObj.UpdateState();
  });

  router.post("/update_logo", (req, res, next) => {
    const adminObj = new Logo().boot(req, res);
    return adminObj.UpdateLogo();
  });

  router.post("/add_faq", (req, res, next) => {
    const adminObj = new SettingController().boot(req, res);
    return adminObj.AddFaq();
  });
  router.post("/get_faq", (req, res, next) => {
    const adminObj = new SettingController().boot(req, res);
    return adminObj.GetFaq();
  });
  router.post("/update_faq", (req, res, next) => {
    const adminObj = new SettingController().boot(req, res);
    return adminObj.UpdateFaq();
  });

  router.post("/add_blog", (req, res, next) => {
    const adminObj = new SettingController().boot(req, res);
    return adminObj.AddBlog();
  });
  router.post("/get_blog", (req, res, next) => {
    const adminObj = new SettingController().boot(req, res);
    return adminObj.GetBlog();
  });
  router.post("/update_blog", (req, res, next) => {
    const adminObj = new SettingController().boot(req, res);
    return adminObj.UpdateBlog();
  });
  router.post("/update_contact_us", (req, res, next) => {
    const adminObj = new SettingController().boot(req, res);
    return adminObj.UpdateContactUs();
  });
  router.post("/get_contact_us", (req, res, next) => {
    const adminObj = new SettingController().boot(req, res);
    return adminObj.GetContactUs();
  });
  router.post("/update_about_us", (req, res, next) => {
    const adminObj = new SettingController().boot(req, res);
    return adminObj.UpdateAboutUs();
  });
  router.post("/get_about_us", (req, res, next) => {
    const adminObj = new SettingController().boot(req, res);
    return adminObj.GetAbouttUs();
  });
  router.post("/update_privacy_policy", (req, res, next) => {
    const adminObj = new SettingController().boot(req, res);
    return adminObj.UpdatePrivacyPolicy();
  });
  router.post("/get_privacy_policy", (req, res, next) => {
    const adminObj = new SettingController().boot(req, res);
    return adminObj.GetPrivacyPolicy();
  });
  router.post("/update_working_policy", (req, res, next) => {
    const adminObj = new SettingController().boot(req, res);
    return adminObj.UpdateWorkingPolicy();
  });
  router.post("/get_working_policy", (req, res, next) => {
    const adminObj = new SettingController().boot(req, res);
    return adminObj.GetWorkingPolicy();
  });
  router.post("/update_term_and_condition", (req, res, next) => {
    const adminObj = new SettingController().boot(req, res);
    return adminObj.UpdateTermAndCondition();
  });
  router.post("/get_term_and_condition", (req, res, next) => {
    const adminObj = new SettingController().boot(req, res);
    return adminObj.GetTermAndCondition();
  });

  router.post("/get_logo", (req, res, next) => {
    const adminObj = new Logo().boot(req, res);
    return adminObj.GetLogo();
  });
  router.post("/add_course_type", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.AddCourseType();
  });
  router.post("/get_course_type", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.GetCourseType();
  });
  router.post("/update_course_type", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.UpdateCourseType();
  });
  router.post("/add_course_level", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.AddCourseLevel();
  });
  router.post("/get_course_level", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.GetCourseLevel();
  });
  router.post("/update_course_level", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.UpdateCourseLevel();
  });
  router.post("/add_course_duration", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.AddCourseDuration();
  });
  router.post("/get_course_duration", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.GetCourseDuration();
  });
  router.post("/update_course_duration", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.UpdateCourseDuration();
  });
  router.post("/add_course_experience", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.AddCourseExperience();
  });
  router.post("/get_course_experience", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.GetCourseExperience();
  });
  router.post("/update_course_experience", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.UpdateCourseExperience();
  });
  router.post("/add_course_program", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.AddCourseProgram();
  });
  router.post("/get_course_program", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.GetCourseProgram();
  });
  router.post("/update_course_program", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.UpdateCourseProgram();
  });
  router.post("/add_entrance_exam", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.AddEnranceExam();
  });
  router.post("/get_entrance_exam", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.GetEntranceExam();
  });
  router.post("/update_entrance_exam", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.UpdateEntranceExam();
  });
  router.post("/add_grading", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.AddGrading();
  });
  router.post("/get_grading", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.GetGrading();
  });
  router.post("/update_grading", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.UpdateGrading();
  });
  router.post("/add_grade_average", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.AddGradeAverage();
  });
  router.post("/get_grade_average", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.GetGradingAverage();
  });
  router.post("/update_grade_average", (req, res, next) => {
    const adminObj = new DropdownsController().boot(req, res);
    return adminObj.UpdateGradingAverage();
  });
  router.post("/add_attribute", (req, res, next) => {
    const adminObj = new AttributeController().boot(req, res);
    return adminObj.AddAttribute();
  });
  router.post("/get_attribute", (req, res, next) => {
    const adminObj = new AttributeController().boot(req, res);
    return adminObj.GetAttribute();
  });
  router.post("/update_attribute", (req, res, next) => {
    const adminObj = new AttributeController().boot(req, res);
    return adminObj.UpdateAttribute();
  });
  router.post("/add_attribute_value", (req, res, next) => {
    const adminObj = new AttributeController().boot(req, res);
    return adminObj.AddAttributeValues();
  });
  router.post("/get_attribute_value", (req, res, next) => {
    const adminObj = new AttributeController().boot(req, res);
    return adminObj.GetAttributeValues();
  });
  router.post("/update_attribute_value", (req, res, next) => {
    const adminObj = new AttributeController().boot(req, res);
    return adminObj.UpdateAttributeValues();
  });
  router.post("/add_description", (req, res, next) => {
    const adminObj = new CourseController().boot(req, res);
    return adminObj.AddDescription();
  });
  router.post("/get_description", (req, res, next) => {
    const adminObj = new CourseController().boot(req, res);
    return adminObj.GetDescription();
  });
  router.post("/update_description", (req, res, next) => {
    const adminObj = new CourseController().boot(req, res);
    return adminObj.UpdateDescription();
  });
  router.post("/add_guest_user", (req, res, next) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.AddGuestUser();
  });
  router.post("/get_guest_user", (req, res, next) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.GetGuestUser();
  });
  router.post("/delete_guest_user", (req, res, next) => {
    const adminObj = new AdminController().boot(req, res);
    return adminObj.deleteGuestUser();
  });

  app.use(process.env.BASE_API_URL, router);
};
