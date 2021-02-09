'use strict'

/** @type {typeof import('../../Models/Admin')} */
const Admin = use('App/Models/Admin')

/** @type {typeof import('../../Models/RoleAdmin')} */
const RoleAdmin = use('App/Models/RoleAdmin')

/**
 * Admin Controller
 *
 * @class AdminController
 */
class AdminController {

    /**
     * Get All Admin
     *
     * @method index
     * @async
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({auth, request, response}) {

        const page = request.input('page', 1)

        const admins = await Admin.query().paginate(page);

        const payloads = []

        for (let admin of admins.rows) {
            admin.role = await RoleAdmin.find(admin.role_id)
            payloads.push(admin)
        }

        admins.rows = payloads

        return response.success(Object.assign({
            status: true,
            message: "",
            data: admins
        }))
    }

    /**
     * Create admin
     *
     * @method store
     * @async
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async store({auth, request, response}) {
        const user = await auth.getUser()
        const payload = request.all()

        if (!(user instanceof Admin)) return response.forbidden()

        const role = await RoleAdmin.find(payload.role_id)

        if (role == null) return response.notFound("Role")

        const admin = await Admin.create(payload)
        admin.role = role

        return response.success(admin)
    }

    /**
     * Show detail admin
     *
     * @method show
     * @async
     *
     * @param auth
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async show({auth, params, response}) {
        const admin = await Admin.find(params.id);
        if (admin == null) return response.notFound("Admin")

        admin.role = await RoleAdmin.find(admin.role_id)

        return response.success(admin)
    }

    /**
     * Update Admin
     *
     * @method update
     * @async
     *
     * @param auth
     * @param params
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async update({auth, params, request, response}) {
        const {id} = params
        const authenticatedUser = await auth.getUser()

        if (!(id == authenticatedUser.id && authenticatedUser instanceof Admin)) return response.forbidden()

        const admin = await Admin.find(id)
        admin.merge(request.all())

        await admin.save()

        admin.role = await RoleAdmin.find(admin.role_id)

        return response.success(admin)
    }

    /**
     * Delete Admin
     *
     * @method destroy
     * @async
     *
     * @param auth
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async destroy({auth, params, response}) {

        const {id} = params
        const user = await auth.getUser()

        if (!(user instanceof Admin)) return response.forbidden()

        const admin = await Admin.find(id)

        if (admin == null) return response.notFound("Admin")

        await admin.delete()

        return response.success(null)
    }
}

module.exports = AdminController
