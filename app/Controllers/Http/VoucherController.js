'use strict';

const
    /**@type {typeof import('../../Models/Voucher')} */
    Voucher = use('App/Models/Voucher'),

    /**@type {typeof import('../../Helpers/Uploader')} */
    Uploader = use('App/Helpers/Uploader'),

    /**@type {typeof import('../../Models/User')} */
    User = use('App/Models/User'),

    /** @type {import('@adonisjs/lucid/src/Database')} */
    Database = use('Database');

/**
 * Voucher Controller
 *
 * @class VoucherController
 */
class VoucherController {

    /**
     * get voucher list
     *
     * @async
     * @method index
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({request, response}) {
        const page = request.input("page", 1);
        const now = new Date();
        const payloads = [];
        const vouchers = await Voucher.query()
            .orderBy("valid_until", "DESC")
            .paginate(page);

        for (let voucher of vouchers.rows) {
            voucher.expired = (new Date(voucher.valid_until)) < now;
            payloads.push(voucher)
        }

        vouchers.rows = payloads;

        return response.json(Object.assign({
            status: true,
            message: ""
        }, vouchers))
    }

    /**
     * get voucher detail
     *
     * @async
     * @method show
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async show({params, response}) {
        const now = new Date();
        const voucher = await Voucher.findBy("code", params.id);
        if (voucher == null) return response.notFound("Voucher");

        voucher.expired = (new Date(voucher.valid_until)) < now;
        voucher.users = await User.query()
            .whereIn("id", Database.from("user_vouchers").where("voucher_code", voucher.code).select("user_id"))
            .fetch();

        return response.success(voucher)
    }

    /**
     * validate voucher data
     * before it save to database
     *
     * @async
     * @method validate_voucher
     *
     * @param request
     * @param is_create
     * @returns {Promise<string>}
     */
    async validate_voucher(request, is_create = true) {
        const now = new Date();
        const valid_until = request.input("valid_until");
        const code = request.input('code');
        const value = request.input("value");
        const type = request.input("type");
        const maxRedeem = request.input("max_redeem");

        if (is_create) {
            const storedVoucher = await Voucher.findBy("code", code);
            if (storedVoucher != null) return "Voucher with this has been stored"
        }

        if (value == "" || value == null) return "Value cannot be null";

        if ((type == 2 || type == 4) && value > 100) return "Max value is 100";
        if (value < 1) return "Min Value is 1";

        if (maxRedeem == null || maxRedeem == "" || maxRedeem < 1)
            return "Max redeem minimal is 1";

        if (now > valid_until) return "Valid until date can't be less than now";

        return ""
    }

    /**
     * create voucher
     *
     * @async
     * @method store
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async store({request, response}) {
        const params = request.all();

        const valid = await this.validate_voucher(request);
        if (valid != "") return response.error(valid);

        params.image = await Uploader.voucher(request.file("image"));

        const voucher = await Voucher.create(params);
        voucher.expired = false;
        voucher.users = [];

        return response.success(voucher)
    }

    /**
     * update voucher
     *
     * @async
     * @method update
     *
     * @param params
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async update({params, request, response}) {
        const valid = await this.validate_voucher(request, false);
        if (valid != "") return response.error(valid);

        const voucher = await Voucher.find(params.id);
        if (voucher == null) return response.notFound("Voucher");

        voucher.merge(request.all());
        const image = await Uploader.voucher(request.file("image"));
        if (image != null) voucher.image = image;

        await voucher.save();

        voucher.expired = false;
        voucher.users = await User.query()
            .whereIn("id", Database.from("user_vouchers").where("voucher_code", voucher.code).select("user_id"))
            .fetch();

        return response.success(voucher)
    }

    /**
     * delete voucher
     *
     * @async
     * @method destroy
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async destroy({params, response}) {
        const voucher = await Voucher.find(params.id);
        if (voucher == null) return response.notFound("Voucher");
        await voucher.delete();
        return response.success(null)
    }
}

module.exports = VoucherController;
