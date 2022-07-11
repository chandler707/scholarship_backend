module.exports = (app, express)=>{

    const router = express.Router();
    const Globals = require("../../configs/Globals");
    const AdminController = require('../controllers/AdminController');

    router.post("/get_report_reason", (req, res) => {
        let categoryObj = new ReportReasonController().boot(req, res);
        return categoryObj.GetAllCategories();
    });

    router.post("/add_reason", Globals.isAuthorised, (req, res) => {
        let categoryObj = new ReportReasonController().boot(req, res);
        return categoryObj.AddCategory();
    });

    router.post("/update_reason", Globals.isAuthorised, (req, res) => {
        let categoryObj = new ReportReasonController().boot(req, res);
        return categoryObj.UpdateCategory();
    });

    router.post('/admin_login', (req, res, next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.adminLogin();
    });

    router.post('/adminProfile', Globals.isAuthorised, (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.profile();
    });

    router.post('/check_session', Globals.isAuthorised, (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.checkSession();
    });

    router.post('/updateAdmin', Globals.isAuthorised, (req,res,next)=>{        
        const adminObj = new AdminController().boot(req,res);
        return adminObj.updateAdmin();
    });

    router.post('/editAdminProfile', Globals.isAuthorised, (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.editProfile();
    });

    router.post('/adminChangePassword', Globals.isAuthorised, (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.changePassword();
    });

    router.post('/get_user_data', Globals.isAuthorised, (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.getUserData();
    });

    router.post('/update_user_data', Globals.isAuthorised, (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.updateUserData();
    });

    router.post('/add_user_data', Globals.isAuthorised, (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.addUserData();
    });

    router.post('/remove_file', Globals.isAuthorised, (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.removeFile();
    });

    router.post('/fileUpload', Globals.isAuthorised, (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.fileUpload();
    });

    router.post('/bulkfileUpload', Globals.isAuthorised, (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.bulkFileUpload();
    });

    router.post('/search_user_from_admin', Globals.isAuthorised, (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.searchUserFromAdmin();
    });

    router.post('/add_service', (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.addService();
    });

    router.post('/get_service_list', (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.getServiceList();
    });

    router.post('/get_service_list_titles', (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.getServiceListTitles();
    });

    router.post('/get_sevice_detail', (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.getSeviceDetail();
    });

    router.post('/add_clinic_service', (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.addClinicService();
    });

    router.post('/get_clinic_list', (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.getClinicList();
    });

    router.post('/get_clinic_detail', (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.getClinicDetail();
    });

    router.post('/get_clinic_time_slot', (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.getClinicTimeSlot();
    });

    router.post('/fetch_netsuite_events', (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.fetchNetsuiteEvents();
    });

    router.post('/admin_forgot_password', (req,res,next)=>{
        const adminObj = new AdminController().boot(req,res);
        return adminObj.forgotPasswordMailForAdmin();
    });

    router.post('/resetPassword', (req,res, next)=>{
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.adminResetPassword();
    });

    router.post('/updatetolower', (req,res, next)=>{
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.updatetolower();
    });

    router.post('/admin_send_noti', (req,res, next)=>{
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.sendNotificationToUser();
    });

    router.post('/get_user_location_info', Globals.isAuthorised, (req,res,next)=>{        
        const adminObj = new AdminController().boot(req,res);
        return adminObj.getUserLocationInfo();
    });

    router.post('/get_all_dashboard_data', Globals.isAuthorised, (req,res,next)=>{        
        const adminObj = new AdminController().boot(req,res);
        return adminObj.getAllDashboardData();
    });




    app.use(process.env.BASE_API_URL, router);
}
