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
    bg_color: "#7D3D60",
    btn_color: "#F4DD8F",
    text_color: "#7D3D60"
};
