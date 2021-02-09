'use strict';

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

/**
 * custom resource function
 *
 * @param route
 * @param controller
 * @param middleware
 * @param isProcessOpen
 * @param isGetOpen
 */
function resource(route, controller, middleware = [], isProcessOpen = false, isGetOpen = true) {
    middleware.push("required");
    if (isGetOpen) {
        Route.get(`${route}`, `${controller}.index`);
        Route.get(`${route}/:id`, `${controller}.show`)
    } else {
        Route.get(`${route}`, `${controller}.index`).middleware(middleware);
        Route.get(`${route}/:id`, `${controller}.show`).middleware(middleware)
    }

    if (isProcessOpen) {
        Route.post(`${route}`, `${controller}.store`);
        Route.put(`${route}/:id`, `${controller}.update`);
        Route.delete(`${route}/:id`, `${controller}.destroy`)
    } else {
        Route.post(`${route}`, `${controller}.store`).middleware(middleware);
        Route.put(`${route}/:id`, `${controller}.update`).middleware(middleware);
        Route.delete(`${route}/:id`, `${controller}.destroy`).middleware(middleware)
    }

}

/**
 * Basic Group Route Prefix
 */
Route.group(() => {

    /**
     * Logs Route
     */
    Route.get('/user/logs/:id', 'ActivityLogController.show').middleware(["all", "required"]);
    Route.get('/user/activity/logs', 'ActivityLogController.indexRecent').middleware(["all", "required"]);

    /**
     * Admins Route
     */
    resource("/admins", "AdminController", ["superadmin"], false, false);

    /**
     * Auth Route
     */
    Route.post('/signin', 'AuthController.login');
    Route.post('/signin/social', 'AuthController.loginSocial');
    Route.post('/register', 'UserController.store');
    Route.post('/register/social', 'UserController.registerWithSocial');
    Route.get("/verify", "AuthController.verify").middleware(["all", "required"]);
    Route.post('/signout', 'AuthController.logout').middleware(["all", 'required']);
    Route.post('/registration', 'UserController.save').middleware(["aggregator", 'required']);

    /**
     * Tarot Category Routes
     */
    resource("/tarot/category", "TarotCategoryController", ["aggregator", "writer", "required"]);

    /**
     * Tarot Routes
     */
    resource("/tarot", "TarotController", ["aggregator", "writer", "required"]);

    /**
     * Consultation Chat Routes
     */
    Route.get("/consultation/chats", "ConsultationChatController.index").middleware(["user", "reader", "aggregator", "required"])
    Route.get("/consultation/chats/:id", "ConsultationChatController.show").middleware(["user", "reader", "aggregator", "required"])
    Route.post("/consultation/chats/:id", "ConsultationChatController.store").middleware(["user", "reader", "required"])
    Route.put("/consultation/chats/:id", "ConsultationChatController.update").middleware(["user", "reader", "required"])
    Route.delete("/consultation/chats/:id", "ConsultationChatController.delete").middleware(["user", "reader", "required"])

    /**
     * Consultation And Booking Routes
     */
    Route.get('/consultation/next', 'ConsultationController.nextConsultation').middleware(["user", "reader", "required"]);
    Route.get('/consultation/sorted', 'ConsultationController.indexByDate').middleware(["user", "reader", "required"]);
    Route.get("/consultation", "ConsultationController.index").middleware(["user", "reader", "aggregator", "required"]);
    Route.get("/consultation/:id", "ConsultationController.show").middleware(["user", "reader", "aggregator", "required"]);
    Route.post("/consultation", "ConsultationController.store").middleware(["user", "required"]);
    resource("/consultations/note", "ConsultationNoteController", ["user", "reader", "aggregator"], false, false);
    Route.get('/payment/methods', 'ConsultationController.paymentMethods');
    Route.get('/consultation/approve/:id', 'ConsultationController.approve').middleware(["reader", "required"]);
    Route.get('/consultation/reject/:id', 'ConsultationController.reject').middleware(["reader", "required"]);
    Route.get('/consultation/readers/replacement/:id', 'ConsultationController.findReplacement').middleware(["user", "required"]);
    Route.post('/consultation/readers/replace', 'ConsultationController.replaceReader').middleware(["user", "required"]);
    Route.get('/consultation/readers/booked', 'ConsultationController.bookedReader').middleware(["user", "required"]);

    /**
     * Cost Distribution Routes
     */
    resource("/cost/distribution", "CostDistributionController", ["aggregator"]);

    /**
     * Faqs Route
     */
    resource("/faqs", "FaqController", ["writer", "aggregator"]);

    /**
     * Intro Route
     */
    resource("/intro", "IntroController", ["all"]);

    /**
     * Request Join Route
     */
    Route.post('/request/join/:username', 'UserController.saveByUsername');
    Route.get("/request/readers", "JoinRequestController.index").middleware(["aggregator", "required"]);
    Route.get("/request/readers/approve/:id", "JoinRequestController.approve").middleware(["aggregator", "required"]);
    Route.get("/request/readers/reject/:id", "JoinRequestController.reject").middleware(["aggregator", "required"]);
    Route.get("/request/aggregator", "JoinRequestController.index").middleware(["required"]);
    Route.get("/request/aggregator/approve/:id", "JoinRequestController.approve").middleware(["required"]);
    Route.get("/request/aggregator/reject/:id", "JoinRequestController.reject").middleware(["required"]);

    /**
     * News Category Routes
     */
    resource("/news/category", "NewsCategoryController", ["writer", "aggregator", "reader"]);

    /**
     * News Route
     */
    resource("/news", "NewsController", ["writer", "aggregator", "reader"]);

    /**
     * Notifications Routes
     */
    Route.get('/notifications', 'NotificationController.index').middleware(["all", "required"]);
    Route.delete('/notifications/:id', 'NotificationController.destroy').middleware(["all", "required"]);

    /**
     * Referral Routes
     */
    Route.get("/referral/:code", "ReferralController.show");
    Route.get("/generate", "ReferralController.generate");

    /**
     * Statistics Routes
     */
    Route.get("/statistics", "StatisticController.index").middleware(["aggregator", "required"]);

    /**
     * Testimonial Route
     */
    resource("/testimonials", "TestimonialController", [], true);

    /**
     * User Attachment Routes
     */
    resource("/user/attachments", "UserAttachmentController", ["user", "reader", "aggregator"]);

    /**
     * User Routes
     */
    Route.put('users/:id/profile', 'ProfileController.update').middleware(["user", "reader", "aggregator", 'required']);
    Route.post('user/fcm', 'UserController.fcm').middleware(['all', 'required']);
    Route.post('user/socket/id', 'UserController.socket_id').middleware(['all', 'required']);
    Route.get('user/socket/:user_id', 'UserController.getSocket').middleware(['all', 'required']);

    /**
     * Readers Routes
     */
    Route.put("/reader/specialization/:id", "ReaderController.editReaderSpecialization").middleware(["reader", "aggregator", "required"]);
    resource("/reader/schedule", "ReaderScheduleController", ["reader", "aggregator"]);
    Route.get('/readers/schedules/available', 'ReaderScheduleController.available').middleware(['user', 'required']);
    Route.get('/readers/schedules/available/:reader_id', 'ReaderScheduleController.timeAvailable').middleware(['user', 'required']);
    Route.get('/readers/date/available/:reader_id', 'ReaderScheduleController.dateAvailable').middleware(['user', 'required']);
    Route.get('/readers/detail/:username', 'ReaderController.showByUsername');
    Route.get('/readers/active/most', 'ReaderController.mostActive').middleware(["aggregator", "required"]);

    /**
     * Users Route
     */
    resource("/users", "UserController", ["all"], false, false);

    /**
     * Voucher Controllers
     */
    resource("/voucher", "VoucherController");
    Route.get("/user/voucher", "UserVoucherController.index").middleware(["user", "required"]);
    Route.get("/user/voucher/:code", "UserVoucherController.show").middleware(["user", "required"]);
    Route.post("/user/voucher/insert/:code", "UserVoucherController.store").middleware(["user", "required"]);

    /**
     * web Contents Route
     */
    resource("/contents", "WebContentController", ["writer", "aggregator"]);

    /**
     * Welcoming Route
     */
    resource("/welcoming", "WelcomingController", ["writer", "aggregator"]);

    /**
     * Location Route
     */
    resource("/province", "ProvinceController", ["writer", "aggregator"]);
    resource("/city", "CityController", ["writer", "aggregator"]);
    resource("/district", "DistrictController", ["writer", "aggregator"]);

}).prefix('v0.5.0');

/**
 * Admin Group Route Prefix
 */
Route.group(() => {

    /**
     * Auth Route
     */
    Route.post('signin', 'AuthController.adminLogin');
    Route.post('signin/social', 'AuthController.adminLoginSocial');
    Route.post('signout', 'AuthController.logout').middleware(['required']);
    Route.post('registration', 'UserController.save').middleware(['required']);
    Route.put('users/:id', 'UserController.update').middleware(['required']);
    Route.put('users/:id/profile', 'ProfileController.update').middleware(['required']);

    /**
     * Consultations Routes
     */
    Route.resource('/consultation', 'ConsultationController').only([
        "index", "show", "store"
    ]).middleware(['required']);
    Route.resource('/consultations/note', 'ConsultationNoteController').apiOnly().middleware(['required']);
    Route.post('user/fcm', 'UserController.fcm').middleware('required');

    /**
     * Notifications Routes
     */
    Route.resource('/notifications', 'NotificationController').only([
        "index", "destroy"
    ]).middleware(["required"]);

    /**
     * User Routes
     */
    Route.resource('users', 'UserController').middleware(['required']).apiOnly();

    /**
     * User Attachment Routes
     */
    Route.resource('/user/attachments', 'UserAttachmentController').only([
        'store', 'update', 'destroy'
    ]).middleware(["required"])

}).prefix('v0.5.0/admin');

/**
 * V1 Group Routes
 */
Route.group(() => {
    Route.get('/readers/schedules/available/:reader_id', 'ReaderScheduleController.timeAvailable').middleware(['user', 'required']);
    Route.get('/readers/date/available/:reader_id', 'ReaderScheduleController.dateAvailable').middleware(['user', 'required']);
}).prefix("v1").namespace("V1");

Route.any('/', function({response}) {
    return response.json({
        name: "Baca Tarot API",
        description: "Baca Tarot Rest API, authentication is needed",
        version: 0.5,
        version_code: "V0.5.0"
    })
})
