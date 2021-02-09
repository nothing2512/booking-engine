'use strict'

/** @type {import('uuid')} */
const uuid = use('uuid')

/**
 * Upload Helper
 *
 * @class Uploader
 */
class Uploader {

    /**
     * Upload file
     *
     * @static
     * @async
     * @method upload
     *
     * @param file
     * @param folder
     * @return {Promise<string|null>}
     */
    static async upload(file, folder) {
        try {
            const filename = `${uuid.v4()}.${file.subtype}`
            const folderName = `attachments/${folder}`
            await file.move(`/var/www/files/public/attachments/${folder}`, {
                name: filename,
                overwrite: true
            })
            return `https://files.bacatarot.xyz/${folderName}/${filename}`
        } catch (e) {
            return null
        }
    }

    /**
     * upload consultation chat
     *
     * @method chat
     * @static
     * @async
     *
     * @param file
     * @returns {Promise<string|null>}
     */
    static async chat(file) {
        return Uploader.upload(file, "chat")
    }

    /**
     * upload voucher image
     *
     * @method voucher
     * @static
     * @async
     *
     * @param file
     * @returns {Promise<string|null>}
     */
    static async voucher(file) {
        return Uploader.upload(file, "voucher")
    }

    /**
     * upload user attachment
     *
     * @method user_attachment
     * @static
     * @async
     *
     * @param file
     * @returns {Promise<string|null>}
     */
    static async user_attachment(file) {
        return Uploader.upload(file, "user_attachments")
    }

    /**
     * upload news
     *
     * @method news
     * @static
     * @async
     *
     * @param file
     * @returns {Promise<string|null>}
     */
    static async news(file) {
        return Uploader.upload(file, "news_image")
    }

    /**
     * upload welcoming
     *
     * @method welcoming
     * @static
     * @async
     *
     * @param file
     * @returns {Promise<string|null>}
     */
    static async welcoming(file) {
        return Uploader.upload(file, "wcms")
    }

    /**
     * upload testimony
     *
     * @method testimony
     * @static
     * @async
     *
     * @param file
     * @returns {Promise<string|null>}
     */
    static async testimony(file) {
        return Uploader.upload(file, "testimony")
    }

    /**
     * upload logo
     *
     * @method logo
     * @static
     * @async
     *
     * @param file
     * @returns {Promise<string|null>}
     */
    static async logo(file) {
        return Uploader.upload(file, "logo")
    }

    /**
     * upload profile
     *
     * @method profile
     * @static
     * @async
     *
     * @param file
     * @returns {Promise<string|null>}
     */
    static async profile(file) {
        return Uploader.upload(file, "profile")
    }

    /**
     * upload tarot
     *
     * @method tarot
     * @static
     * @async
     *
     * @param file
     * @returns {Promise<string|null>}
     */
    static async tarot(file) {
        return Uploader.upload(file, "tarot")
    }
}

module.exports = Uploader
