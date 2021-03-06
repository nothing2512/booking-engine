'use strict';

/** @type {typeof import('../../Models/User')} */
const User = use('App/Models/User');

/** @type {typeof import('../../Models/Admin')} */
const Admin = use('App/Models/Admin');

/** @type {typeof import('../../Models/RoleAdmin')} */
const RoleAdmin = use('App/Models/RoleAdmin');

/**@type {typeof import('../../Models/Consultation')} */
const Consultation = use('App/Models/Consultation');

/**@type {typeof import('../../Models/Notification')} */
const Notification = use('App/Models/Notification');

/**@type {typeof import('../../Helpers/Fcm')} */
const Fcm = use('App/Helpers/Fcm');

/** @type {import('../../Helpers/Tokenizer')} */
const Tokenizer = use('App/Helpers/Tokenizer');

/** @type {import('../../Helpers/OAuth')} */
const OAuth = use('App/Helpers/OAuth');

/** @type {typeof import('../../Helpers/Confirmation')} */
const Confirmation = use('App/Helpers/Confirmation');

/** @type {import('@adonisjs/lucid/src/Database')} */
const Database = use('Database');

/**
 * Auth Controller
 *
 * @class AuthController
 */
class AuthController {

    /**
     * user login process
     *
     * @method userLoginProcess
     * @async
     *
     * @param auth
     * @param userPayload
     * @param useSocial
     * @returns {Promise<{data: null, message: string, status: boolean}|{data: *, message: string, status: boolean}>}
     */
    async userLoginProcess({auth, userPayload}, useSocial = false) {
        const {username, email, password} = userPayload;
        let user = null;

        if (email != undefined && email != "") user = await User.findBy('email', email);
        else if (username != undefined && username != "") user = await User.findBy('username', username);

        if (user == null) return {
            status: false,
            message: "Username / Email tidak ditemukan",
            data: null
        };

        let jwt = null;

        if (!useSocial) {
            try {
                jwt = await auth.attempt(user.email, password)
            } catch (e) {
                return {
                    status: false,
                    message: "Password salah !",
                    data: null
                }
            }
        } else {
            jwt = await auth.generate(user)
        }

        await user.loadMany(['profile', 'role']);

        jwt.token = (await Tokenizer.create(user, jwt.token, "jwt")).token;
        jwt.user = user;

        if (user.role_id == 1) {
            const date = new Date();
            const now = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}`;
            const query = Consultation.query()
                .where('user_id', user.id)
                .where(Database.raw(`date::date < '${now}'::date`))
                .whereIn('status', [0, 1]);

            const consultation = await query.fetch();
            await query.update({status: 3});

            if (user.fcm != null) for (let item of consultation.toJSON()) {
                const notification = await Notification.create({
                    user_id: user.id,
                    type: 1,
                    parent_id: consultation.id,
                    title: "Konsultasi telah kadaluarsa",
                    message: "Maaf, jadwal konsultasi anda telah kadaluarsa"
                });
                await Fcm.send(user, notification, "notification")
            }
        }

        return {
            status: true,
            message: "Logged In",
            data: jwt
        }
    }

    /**
     * admin login process
     *
     * @method adminLoginProcess
     * @async
     *
     * @param auth
     * @param adminPayload
     * @param useSocial
     * @returns {Promise<{data: null, message: string, status: boolean}|{data: *, message: string, status: boolean}>}
     */
    async adminLoginProcess({auth, adminPayload}, useSocial = false) {
        const {username, email, password} = adminPayload;
        let admin = null;

        if (email != undefined && email != "") admin = await Admin.findBy('email', email);
        else if (username != undefined && username != "") admin = await Admin.findBy('username', username);

        if (admin == null) return {
            status: false,
            message: "Username / Email tidak ditemukan",
            data: null
        };

        admin.role = await RoleAdmin.find(admin.role_id);

        let jwt = null;
        const authenticator = auth.authenticator('jwtAdmin');

        if (!useSocial) {
            try {
                jwt = await authenticator.attempt(admin.email, password)
            } catch (e) {
                return {
                    status: false,
                    message: "Password salah !",
                    data: null
                }
            }
        } else {
            jwt = await authenticator.generate(admin)
        }

        jwt.token = (await Tokenizer.create(admin, jwt.token, "jwtAdmin")).token;
        jwt.user = admin;

        return {
            status: true,
            message: "Logged In",
            data: jwt
        }
    }

    /**
     * user login
     *
     * @method login
     * @async
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async login({auth, request, response}) {

        const userPayload = request.only(["username", "email", "password"]);
        const logPayload = request.only(["device", "device_id", 'user_agent', 'latitude', 'longitude']);

        return response.json(await this.userLoginProcess({
            auth: auth,
            userPayload: userPayload,
            logPayload: logPayload
        }))

    }

    /**
     * admin login
     *
     * @method adminLogin
     * @async
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async adminLogin({auth, request, response}) {

        const adminPayload = request.only(["username", "email", "password"]);
        const logPayload = request.only(["device", "device_id", 'user_agent', 'latitude', 'longitude']);

        return response.json(await this.adminLoginProcess({
            auth: auth,
            adminPayload: adminPayload,
            logPayload: logPayload
        }))
    }

    /**
     * user login with social media
     * for now just google
     *
     * @method loginsocial
     * @async
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async loginSocial({auth, request, response}) {

        const oAuth = await OAuth.detail(request.input("access_token", ""), request.input("type"));

        if (!oAuth.status) return response.json(oAuth);

        return response.json(await this.userLoginProcess({
            auth: auth,
            userPayload: {email: oAuth.email}
        }, true))
    }

    /**
     * admin login with social media
     * for now just google
     *
     * @method adminLoginSocial
     * @async
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async adminLoginSocial({auth, request, response}) {
        const oAuth = await OAuth.detail(request.input("access_token", ""), request.input("type"));

        if (!oAuth.status) return response.json(oAuth);

        return response.json(await this.adminLoginProcess({
            auth: auth,
            adminPayload: {email: oAuth.email}
        }, true))
    }

    /**
     * verify email address
     *
     * @method verify
     * @async
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async verify({auth, request, response}) {
        const user = await auth.getUser();
        await Confirmation.verify(request, user);

        let authenticator;
        if (user instanceof User) {
            authenticator = auth.authenticator("jwt");
            await user.loadMany(['profile', 'role'])
        } else authenticator = auth.authenticator("jwtAdmin");

        let jwt = await authenticator.generate(user)

        jwt.token = (await Tokenizer.create(user, jwt.token, "jwt")).token;
        jwt.user = user;

        return response.success(jwt)
    }

    /**
     * forgot password
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<*>}
     */
    async forgot({auth, request, response}) {
        let authenticator
        let user

        if (request.input("type") == "user") {
            user = await User.findBy("email", request.input("email"))
            authenticator = auth.authenticator("jwt")
        } else {
            user = await Admin.findBy("email", request.input("email"))
            authenticator = auth.authenticator("jwtAdmin")
        }

        if (user == null) return response.notFound("User")

        const jwt = await authenticator.generate(user)
        const forgot = await Confirmation.forgot(jwt, user)

        if (!forgot.status) return response.error(forgot.message)
        return response.success()
    }

    /**
     * logout
     *
     * @method logout
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async logout({request, response}) {
        await Tokenizer.remove(request.headers().originalAuthorization.split(" ")[1]);
        return response.success(null)
    }
}

module.exports = AuthController;
