'use strict';

const
    /**@type {typeof import('../../Models/Voucher')} */
    Voucher = use('App/Models/Voucher'),

    /**@type {typeof import('../../Models/UserVoucher')} */
    UserVoucher = use('App/Models/UserVoucher'),

    /**@type {typeof import('../../Models/User')} */
    User = use('App/Models/User');

class UserVoucherController {

    /**
     * get user voucher list
     *
     * @async
     * @method index
     *
     * @param auth
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({auth, request, response}) {
        const user = await auth.getUser();
        if (!(user instanceof User)) return response.forbidden();

        const page = request.input("page", 1);
        const now = new Date();
        const payloads = [];
        const userVoucher = await UserVoucher.query()
            .where("user_id", user.id)
            .paginate(page);

        for (let voucher of userVoucher.rows) {
            if (voucher.valid_until != null) {
                voucher.expired = (new Date(voucher.valid_until)) < now
            } else voucher.expired = false;
            payloads.push(voucher)
        }

        userVoucher.rows = payloads;

        return response.json(Object.assign({
            status: true,
            message: ""
        }, userVoucher))
    }

    /**
     * get user voucher detail
     *
     * @param auth
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async show({auth, params, response}) {
        const now = new Date();
        const user = await auth.getUser();
        if (!(user instanceof User)) return response.forbidden();

        const voucher = (await UserVoucher.query()
            .where("user_id", user.id)
            .where("voucher_code", params.code)
            .fetch()).toJSON()[0];

        if (voucher == null) return response.notFound("Voucher");

        voucher.expired = (new Date(voucher.valid_until)) < now;

        return response.success(voucher)
    }

    /**
     * insert user voucher
     *
     * @param auth
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async store({auth, params, response}) {
        const now = new Date();
        const user = await auth.getUser();
        if (!(user instanceof User)) return response.forbidden();

        const total = await UserVoucher.query()
            .where("user_id", user.id)
            .where("voucher_code", params.code)
            .getCount();

        if (total > 0) return response.error("You already have that voucher");

        const voucher = await Voucher.findBy("code", params.code);
        if (voucher == null) return response.notFound("Voucher");

        voucher.expired = (new Date(voucher.valid_until)) < now;
        if (voucher.expired) return response.error("Voucher is expired");

        if (voucher.max_redeem != "" && voucher.max_redeem != null) {
            if (voucher.max_redeem == 0) return response.error("Voucher has run out");
            else {
                voucher.max_redeem -= 1;
                await voucher.save()
            }
        }

        await UserVoucher.create({
            user_id: user.id,
            voucher_code: params.code,
            payment_method: voucher.payment_method,
            type: voucher.type,
            title: voucher.title,
            description: voucher.description,
            image: voucher.image,
            value: voucher.value,
            max_discount: voucher.max_discount,
            valid_until: voucher.valid_until,
            used: false
        });

        return response.success(voucher)
    }
}

module.exports = UserVoucherController;
