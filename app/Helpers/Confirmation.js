'use strict';


/** @type {typeof import('@adonisjs/mail/src/Mail')} */
const Mail = use('Mail');

/** @type {import('App/Models/LoginToken')} */
const LoginToken = use('App/Models/LoginToken');

/** @type {import('App/Helpers/Tokenizer')} */
const Tokenizer = use('App/Helpers/Tokenizer');

/** @type {import('App/Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

/** @type {import('App/Models/User')} */
const User = use('App/Models/User');

/**
 * Confirmation Helper
 * using for email confirmation and verify token
 *
 * @class Confirmation
 */
class Confirmation {

    /**
     * Send Test Confirmation Email
     *
     * @async
     * @static
     * @method test
     *
     * @returns {Promise<void>}
     */
    static async test() {
        await Mail.send('email_confirmation', {
            link: "Ini Url nya ya",
            bg_color: Engine.get("bg_color"),
            btn_color: Engine.get("btn_color"),
            text_color: Engine.get("text_color")
        }, (message) => {
            message.to("blank345red@gmail.com")
                .from('ezy.bacatarot@gmail.com')
                .subject(`${Engine.title("app")} Registration Confirmation`)
        })
    }

    /**
     * Send Confirmation Email
     *
     * @static
     * @async
     * @method send
     *
     * @param jwt
     * @param user
     * @returns {Promise<void>}
     */
    static async send(jwt, user) {

        let authenticator;

        if (user instanceof User) authenticator = "jwt";
        else authenticator = "jwtAdmin";

        const loginToken = await Tokenizer.create(user, jwt.token, authenticator);
        const token = encodeURI(loginToken.token);

        let verification_link = `${Engine.lower("verification_link")}${token}`;

        try {
            await Mail.send('email_confirmation', {
                link: verification_link,
				bg_color: Engine.get("bg_color"),
				btn_color: Engine.get("btn_color"),
				text_color: Engine.get("text_color")
            }, (message) => {
                message.to(user.email)
                    .from('ezy.bacatarot@gmail.com')
                    .subject(`${Engine.title("app")} Registration Confirmation`)
            })
        } catch (e) {

        }
    }

    /**
     * Verify User from sent token
     *
     * @static
     * @async
     * @method verify
     *
     * @param request
     * @param user
     * @returns {Promise<void>}
     */
    static async verify(request, user) {
        const originalToken = request.headers().originalAuthorization.split(" ")[1];
        await LoginToken.query()
            .where("token", originalToken)
            .delete();
        user.merge({status: 'active'});
        await user.save()
    }
}

module.exports = Confirmation;
