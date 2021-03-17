'use struct';

/** @type {import('axios')} */
const Axios = require('axios');

/**
 * OAuth Helper
 *
 * @class OAuth
 */
class OAuth {

    /**
     * get OAuth detail
     * for now just google
     *
     * @method detail
     * @async
     *
     * @param accessToken
     * @param type
     * @returns {Promise<{email: *, status: boolean}|{data: null, message: string, status: boolean}>}
     */
    static async detail(accessToken, type) {
        if (accessToken == "") return {
            status: false,
            message: "Akses token diperlukan",
            data: null
        };

        let oAuth = {};

        try {
            if (type == "google") oAuth = await Axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
                headers: {Authorization: "Bearer " + accessToken}
            });
            else await Axios.get(`https://graph.facebook.com/v9.0/me?fields=email&access_token=${accessToken}`)
        } catch (e) {
            return {
                status: false,
                message: "Akses token salah / sudah tidak berlaku",
                data: null
            }
        }

        return {
            status: true,
            email: oAuth.data.email
        }
    }
}

module.exports = OAuth;
