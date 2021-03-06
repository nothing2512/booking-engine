'use strict';

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env');

module.exports = {
    app: "App",
    user: "User",
    mentor: "Mentor",
    aggregator: "Aggregator",
    book: "Book",
    verification_link: "http://localhost/verification/?token=",
    files_link: "https://files.localhost/attachments/",
    email: Env.get("MAIL_USER"),
    midtrans: {
        is_production: Env.get("MIDTRANS_IS_PRODUCTION"),
        production_key: Env.get("MIDTRANS_PRODUCTION_KEY"),
        sandbox_key: Env.get("MIDTRANS_SANDBOX_KEY"),
        url: Env.get("MIDTRANS_URL"),
        sandbox_url: Env.get("MIDTRANS_SANDBOX_URL")
    },
    fcm: {
        url: Env.get("FCM_URL"),
        key: Env.get("FCM_KEY")
    },
    zoom: {
        url: Env.get("ZOOM_URL"),
        secret: Env.get("ZOOM_API_SECRET"),
        key: Env.get("ZOOM_API_KEY")
    },
    google: {
        client_id: Env.get("GCALENDAR_CLIENT_ID"),
        client_secret: Env.get("GCALENDAR_CLIENT_SECRET"),
        redirect_uri: Env.get("GCALENDAR_REDIRECT_URI"),
        credentials: {
            access_token: Env.get("GCALENDAR_ACCESS_TOKEN"),
            refresh_token: Env.get("GCALENDAR_REFRESH_TOKEN"),
            scope: Env.get("GCALENDAR_SCOPE"),
            token_type: Env.get("GCALENDAR_TOKEN_TYPE"),
            expiry_date: Env.get("GCALENDAR_EXPIRY_DATE")
        }
    },
    bg_color: "#7D3D60",
    btn_color: "#F4DD8F",
    text_color: "#7D3D60"
};
