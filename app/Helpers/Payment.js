'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

/** @type {import('axios')} */
const Axios = require('axios')

/**
 * Payment Helper
 * using for midtrans payment helper
 *
 * @class Payment
 */
class Payment {

    /**
     * constructor
     */
    constructor() {
        const is_production = Env.get('MIDTRANS_IS_PRODUCTION', "false")
        const serverKey = is_production === "true" ? Env.get('MIDTRANS_PRODUCTION_KEY', '') : Env.get('MIDTRANS_SANDBOX_KEY', '')
        this.baseUrl = is_production === "true" ? Env.get('MIDTRANS_URL', '') : Env.get('MIDTRANS_SANDBOX_URL', '')
        this.headers = {
            "Content-Type": "Application/Json",
            "Accept": "Application/Json",
            "Authorization": "Basic " + Buffer.from(serverKey + ":").toString('base64')
        }
        this.method = 0

        this.BCA = 1
        this.BNI = 2
        this.BRI = 3
        this.MANDIRI_BILL = 4
        this.PERMATA = 5
        this.GOPAY = 6
        this.BCA_KLIKPAY = 7
        this.CIMB_CLICKS = 8
        this.DANAMON_ONLINE_BANKING = 9
        this.E_PAY_BRI = 10
        this.ALFAMARET = 11
        this.INDOMARET = 12
        this.AKULAKU = 13
        this.CHECK = 100
    }

    /**
     * Get Payment Methods
     *
     * @static
     * @method methods
     *
     * @returns {({item: [{name: string, id: number}, {name: string, id: number}, {name: string, id: number}, {name: string, id: number}, {name: string, id: number}], name: string}|{item: [{name: string, id: number}], name: string}|{item: [{name: string, id: number}, {name: string, id: number}, {name: string, id: number}, {name: string, id: number}], name: string}|{item: [{name: string, id: number}, {name: string, id: number}], name: string}|{item: [{name: string, id: number}], name: string})[]}
     */
    static methods() {
        return [
            {
                name: "Bank Transfer",
                item: [
                    {
                        id: 1,
                        name: "BCA"
                    },
                    {
                        id: 2,
                        name: "BNI"
                    },
                    {
                        id: 3,
                        name: "BRI"
                    },
                    {
                        id: 4,
                        name: "Mandiri Bill"
                    },
                    {
                        id: 5,
                        name: "Permata"
                    }
                ]
            },
            {
                name: "E-Wallet",
                item: [
                    {
                        id: 6,
                        name: "Gopay"
                    }
                ]
            },
            {
                name: "Direct Debit",
                item: [
                    {
                        id: 7,
                        name: "BCA Klikpay"
                    },
                    {
                        id: 8,
                        name: "CIMB Clicks"
                    },
                    {
                        id: 9,
                        name: "DANAMON Online Banking"
                    },
                    {
                        id: 10,
                        name: "E-Pay BRI"
                    }
                ]
            },
            {
                name: "Convenion Store",
                item: [
                    {
                        id: 11,
                        name: "Alfamaret"
                    },
                    {
                        id: 12,
                        name: "Alfamaret"
                    }
                ]
            },
            {
                name: "Cardless Credit",
                item: [
                    {
                        id: 13,
                        name: "Akulaku"
                    }
                ]
            }
        ]
    }

    /**
     * Checking Payments
     *
     * @static
     * @async
     * @method check
     *
     * @param midtrans_transaction_id
     * @returns {Promise<{transaction_id: any, redirect_link: string, transaction_status: any, price: any, bill_code: string, bill_key: string, order_id: any, qr_link: string, va_code: string}|{transaction_id: any, redirect_link: string, transaction_status: any, price: any, bill_code: string, transaction_time: any, bill_key: string, order_id: any, qr_link: string, va_code: any}|{transaction_id: any, redirect_link: string, transaction_status: any, price: any, bill_code: any, transaction_time: any, bill_key: any, order_id: any, qr_link: string, va_code: string}|{transaction_id: any, redirect_link: string, transaction_status: any, price: any, bill_code: string, transaction_time: any, bill_key: string, order_id: any, qr_link: string, va_code: any}|{transaction_id: any, redirect_link: string, transaction_status: any, price: any, bill_code: string, transaction_time: any, bill_key: string, order_id: any, qr_link: string, va_code: string}|{transaction_id: any, redirect_link: any, transaction_status: any, price: any, bill_code: string, transaction_time: any, bill_key: string, order_id: any, qr_link: string, va_code: any}|*|boolean|undefined>}
     */
    static async check(midtrans_transaction_id) {
        return (new Payment()).check(midtrans_transaction_id)
    }

    /**
     * Creating Payments
     *
     * @static
     * @async
     * @method make
     *
     * @param method
     * @param consultation_id
     * @param price
     * @param product
     * @returns {Promise<{transaction_id: any, redirect_link: string, transaction_status: any, price: any, bill_code: string, bill_key: string, order_id: any, qr_link: string, va_code: string}|{transaction_id: any, redirect_link: string, transaction_status: any, price: any, bill_code: string, transaction_time: any, bill_key: string, order_id: any, qr_link: string, va_code: any}|{transaction_id: any, redirect_link: string, transaction_status: any, price: any, bill_code: any, transaction_time: any, bill_key: any, order_id: any, qr_link: string, va_code: string}|{transaction_id: any, redirect_link: string, transaction_status: any, price: any, bill_code: string, transaction_time: any, bill_key: string, order_id: any, qr_link: string, va_code: any}|{transaction_id: any, redirect_link: string, transaction_status: any, price: any, bill_code: string, transaction_time: any, bill_key: string, order_id: any, qr_link: string, va_code: string}|{transaction_id: any, redirect_link: any, transaction_status: any, price: any, bill_code: string, transaction_time: any, bill_key: string, order_id: any, qr_link: string, va_code: any}|*|boolean|undefined>}
     */
    static async make(method, consultation_id, price, product = "") {
        return (new Payment()).make(method, consultation_id, price, product)
    }

    /**
     * Free Payment
     *
     * @return {{transaction_id: *, redirect_link: *, transaction_status: *, price: *, bill_code: string, transaction_time: *, bill_key: string, order_id: *, qr_link: string, va_code: *}}
     */
    static free() {
        return {
            "transaction_id": "Free From Voucher",
            "order_id": "Free From Voucher",
            "transaction_time": "",
            "transaction_status": "settlement",
            "price": "0",
            "va_code": "Free From Voucher",
            "bill_key": "",
            "bill_code": "",
            "qr_link": "",
            "redirect_link": ""
        }
    }

    /**
     * Parsing Midtrans Response
     *
     * @method parse_response
     *
     * @param data
     * @returns {{transaction_id: *, redirect_link: string, transaction_status: *, price: *, bill_code: string, transaction_time: *, bill_key: string, order_id: *, qr_link: string, va_code: string}|{transaction_id: *, redirect_link: *, transaction_status: *, price: *, bill_code: string, transaction_time: *, bill_key: string, order_id: *, qr_link: string, va_code: *}|{transaction_id: *, redirect_link: string, transaction_status: *, price: *, bill_code: string, bill_key: string, order_id: *, qr_link: string, va_code: string}|{transaction_id: string, redirect_link: string, transaction_status: string, price: string, bill_code: string, transaction_time: string, bill_key: string, order_id: string, qr_link: string, va_code: string}|{transaction_id: *, redirect_link: *, transaction_status: *, price: *, bill_code: string, transaction_time: *, bill_key: string, order_id: *, qr_link: string, va_code: string}|{transaction_id: *, redirect_link: string, transaction_status: *, price: *, bill_code: *, transaction_time: *, bill_key: *, order_id: *, qr_link: string, va_code: string}|{transaction_id: *, redirect_link: string, transaction_status: *, price: *, bill_code: string, transaction_time: *, bill_key: string, order_id: *, qr_link: string, va_code: *}}
     */
    parse_response(data) {
        if (typeof data === "string") data = JSON.parse(data)
        data = data['data']
        switch (this.method) {
            case this.CHECK:
                return {
                    "transaction_id": data['transaction_id'],
                    "order_id": data['order_id'],
                    "transaction_status": data['transaction_status'],
                    "price": data['gross_amount'],
                    "va_code": "",
                    "bill_key": "",
                    "bill_code": "",
                    "qr_link": "",
                    "redirect_link": ""
                }
            case this.BCA:
            case this.BNI:
            case this.BRI:
                return {
                    "transaction_id": data['transaction_id'],
                    "order_id": data['order_id'],
                    "transaction_time": data['transaction_time'],
                    "transaction_status": data['transaction_status'],
                    "price": data['gross_amount'],
                    "va_code": data['va_numbers'][0]['va_number'],
                    "bill_key": "",
                    "bill_code": "",
                    "qr_link": "",
                    "redirect_link": ""
                }
            case this.MANDIRI_BILL:
                return {
                    "transaction_id": data['transaction_id'],
                    "order_id": data['order_id'],
                    "transaction_time": data['transaction_time'],
                    "transaction_status": data['transaction_status'],
                    "price": data['gross_amount'],
                    "va_code": "",
                    "bill_key": data['bill_key'],
                    "bill_code": data['biller_code'],
                    "qr_link": "",
                    "redirect_link": ""
                }
            case this.PERMATA:
                return {
                    "transaction_id": data['transaction_id'],
                    "order_id": data['order_id'],
                    "transaction_time": data['transaction_time'],
                    "transaction_status": data['transaction_status'],
                    "price": data['gross_amount'],
                    "va_code": data['permata_va_number'],
                    "bill_key": "",
                    "bill_code": "",
                    "qr_link": "",
                    "redirect_link": ""
                }
            case this.GOPAY:
                let qr_code = ""
                let redirect_link = ""
                data['actions'].forEach(function (action) {
                    if (action['name'] === "gengerate-qr-code") qr_code = action['url']
                    if (action['name'] === "deeplink-redirect") redirect_link = action['url']
                })
                return {
                    "transaction_id": data['transaction_id'],
                    "order_id": data['order_id'],
                    "transaction_time": data['transaction_time'],
                    "transaction_status": data['transaction_status'],
                    "price": data['gross_amount'],
                    "va_code": "",
                    "bill_key": "",
                    "bill_code": "",
                    "qr_link": qr_code,
                    "redirect_link": redirect_link
                }
            case this.BCA_KLIKPAY:
                return {
                    "transaction_id": data['transaction_id'],
                    "order_id": data['order_id'],
                    "transaction_time": data['transaction_time'],
                    "transaction_status": data['transaction_status'],
                    "price": data['gross_amount'],
                    "va_code": data['redirect_data']['params']['klikPayCode'],
                    "bill_key": "",
                    "bill_code": "",
                    "qr_link": "",
                    "redirect_link": data['redirect_data']['url']
                }
            case this.CIMB_CLICKS:
            case this.DANAMON_ONLINE_BANKING:
            case this.E_PAY_BRI:
            case this.AKULAKU:
                return {
                    "transaction_id": data['transaction_id'],
                    "order_id": data['order_id'],
                    "transaction_time": data['transaction_time'],
                    "transaction_status": data['transaction_status'],
                    "price": data['gross_amount'],
                    "va_code": "",
                    "bill_key": "",
                    "bill_code": "",
                    "qr_link": "",
                    "redirect_link": data['redirect_url']
                }
            case this.ALFAMARET:
            case this.INDOMARET:
                return {
                    "transaction_id": data['transaction_id'],
                    "order_id": data['order_id'],
                    "transaction_time": data['transaction_time'],
                    "transaction_status": data['transaction_status'],
                    "price": data['gross_amount'],
                    "va_code": data['payment_code'],
                    "bill_key": "",
                    "bill_code": "",
                    "qr_link": "",
                    "redirect_link": ""
                }
            default:
                return {
                    "transaction_id": "",
                    "order_id": "",
                    "transaction_time": "",
                    "transaction_status": "",
                    "price": "",
                    "va_code": "",
                    "bill_key": "",
                    "bill_code": "",
                    "qr_link": "",
                    "redirect_link": ""
                }
        }
    }

    /**
     * Creating Payments
     *
     * @async
     * @method make
     *
     * @param method
     * @param consultation_id
     * @param price
     * @param product
     * @returns {Promise<{transaction_id: *, redirect_link: string, transaction_status: *, price: *, bill_code: string, transaction_time: *, bill_key: string, order_id: *, qr_link: string, va_code: string}|{transaction_id: *, redirect_link: *, transaction_status: *, price: *, bill_code: string, transaction_time: *, bill_key: string, order_id: *, qr_link: string, va_code: *}|{transaction_id: *, redirect_link: string, transaction_status: *, price: *, bill_code: string, bill_key: string, order_id: *, qr_link: string, va_code: string}|{transaction_id: string, redirect_link: string, transaction_status: string, price: string, bill_code: string, transaction_time: string, bill_key: string, order_id: string, qr_link: string, va_code: string}|{transaction_id: *, redirect_link: *, transaction_status: *, price: *, bill_code: string, transaction_time: *, bill_key: string, order_id: *, qr_link: string, va_code: string}|{transaction_id: *, redirect_link: string, transaction_status: *, price: *, bill_code: *, transaction_time: *, bill_key: *, order_id: *, qr_link: string, va_code: string}|{transaction_id: *, redirect_link: string, transaction_status: *, price: *, bill_code: string, transaction_time: *, bill_key: string, order_id: *, qr_link: string, va_code: *}|boolean>}
     */
    async make(method, consultation_id, price, product = "") {
        this.method = parseInt(method)
        method = this.method

        let payment_type
        let bank = ""

        switch (this.method) {
            case this.MANDIRI_BILL:
                payment_type = "echannel"
                break
            case this.PERMATA:
                payment_type = "permata"
                break
            case this.GOPAY:
                payment_type = "gopay"
                break
            case this.BCA_KLIKPAY:
                payment_type = "bca_klikpay"
                break
            case this.CIMB_CLICKS:
                payment_type = "cimb_clicks"
                break
            case this.DANAMON_ONLINE_BANKING:
                payment_type = "danamon_online"
                break
            case this.E_PAY_BRI:
                payment_type = "bri_epay"
                break
            case this.ALFAMARET:
            case this.INDOMARET:
                payment_type = "cstore"
                break
            case this.AKULAKU:
                payment_type = "akulaku"
                break
            default:
                payment_type = "bank_transfer"
        }


        let data = {
            payment_type: payment_type,
            transaction_details: {
                order_id: "Bacatarot-" + consultation_id.toString(),
                gross_amount: price
            }
        }

        if (method === this.BCA) data['bank_transfer'] = {bank: "bca"}
        if (method === this.BNI) data['bank_transfer'] = {bank: "bca"}
        if (method === this.BRI) data['bank_transfer'] = {bank: "bca"}

        if (method === this.MANDIRI_BILL) data['echannel'] = {
            bill_info1: "purchase bacatarot\nProduct: " + product,
            bill_info2: "debt"
        }
        if (method === this.BCA_KLIKPAY) data['bca_klikpay'] = {description: "purchase bacatarot\nProduct: " + product}
        if (method === this.CIMB_CLICKS) data['cimb_clicks'] = {description: "purchase bacatarot\nProduct: " + product}
        if (method === this.INDOMARET) data['cstore'] = {
            store: "indomaret",
            message: "purchase bacatarot\nProduct: " + product
        }
        if (method === this.ALFAMARET) data['cstore'] = {
            store: "alfamart",
            message: "purchase bacatarot\nProduct: " + product
        }

        try {
            const response = await Axios({
                method: "post",
                url: this.baseUrl + "/charge",
                headers: this.headers,
                data: JSON.stringify(data)
            })
            return this.parse_response(response)
        } catch (e) {
            console.log(e)
            return false
        }
    }

    /**
     * Checking Payments
     *
     * @async
     * @method check
     *
     * @param midtrans_transaction_id
     * @returns {Promise<{transaction_id: *, redirect_link: string, transaction_status: *, price: *, bill_code: string, transaction_time: *, bill_key: string, order_id: *, qr_link: string, va_code: string}|{transaction_id: *, redirect_link: *, transaction_status: *, price: *, bill_code: string, transaction_time: *, bill_key: string, order_id: *, qr_link: string, va_code: *}|{transaction_id: *, redirect_link: string, transaction_status: *, price: *, bill_code: string, bill_key: string, order_id: *, qr_link: string, va_code: string}|{transaction_id: string, redirect_link: string, transaction_status: string, price: string, bill_code: string, transaction_time: string, bill_key: string, order_id: string, qr_link: string, va_code: string}|{transaction_id: *, redirect_link: *, transaction_status: *, price: *, bill_code: string, transaction_time: *, bill_key: string, order_id: *, qr_link: string, va_code: string}|{transaction_id: *, redirect_link: string, transaction_status: *, price: *, bill_code: *, transaction_time: *, bill_key: *, order_id: *, qr_link: string, va_code: string}|{transaction_id: *, redirect_link: string, transaction_status: *, price: *, bill_code: string, transaction_time: *, bill_key: string, order_id: *, qr_link: string, va_code: *}|boolean>}
     */
    async check(midtrans_transaction_id) {
        this.method = this.CHECK
        try {
            const response = await Axios({
                method: "get",
                url: this.baseUrl + "/" + midtrans_transaction_id.toString() + "/status",
                headers: this.headers
            })
            return this.parse_response(response)
        } catch (e) {
            console.log(e)
            return false
        }
    }
}

module.exports = Payment
