const { isAuthorised } = require("../../configs/Globals");

module.exports = (app, express) => {
  const router = express.Router();
  const Globals = require("../../configs/Globals");
  const SponcerController = require("../controllers/SponcerController");
  

  router.post("/create_sponcers", Globals.isAuthorised, (req, res, next) => {
    const sponcerObj = new SponcerController().boot(req, res);
    return sponcerObj.createSponcers();
  });

  router.post("/create_sponcers_activities", Globals.isAuthorised, (req, res, next) => {
    const sponcerObj = new SponcerController().boot(req, res);
    return sponcerObj.createSponcersActivities();
  });

  router.post("/create_sponcers_activities_schedule", Globals.isAuthorised, (req, res, next) => {
    const sponcerObj = new SponcerController().boot(req, res);
    return sponcerObj.createSponcersActivitiesSchedules();
  });

  router.post("/sponcers_activities_user_interests", Globals.isAuthorised, (req, res, next) => {
    const sponcerObj = new SponcerController().boot(req, res);
    return sponcerObj.sponcersActivitiesUserInterests();
  });

  router.post("/get_all_sponcers", Globals.isAuthorised, (req, res, next) => {
    const sponcerObj = new SponcerController().boot(req, res);
    return sponcerObj.getAllSponcers();
  });

  router.post("/sponcer_details", Globals.isAuthorised, (req, res, next) => {
    const sponcerObj = new SponcerController().boot(req, res);
    return sponcerObj.sponcerSetails();
  });

  router.post("/get_activities_list", Globals.isAuthorised, (req, res, next) => {
    const sponcerObj = new SponcerController().boot(req, res);
    return sponcerObj.getActivitiesList();
  });

  app.use(process.env.BASE_API_URL, router);
};
