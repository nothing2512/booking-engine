'use strict';

/** @type {import('./Engine')} */
const Engine = use('App/Helpers/Engine');

/** @type {import('axios')} */
const Axios = require('axios');

/** @type {import('jsonwebtoken')} */
const jwt = use('jsonwebtoken');

const ZoomApi = exports = module.exports = {};

/**
 * Create zoom meetings
 *
 * @async
 * @method createMeeting
 *
 * @returns {Promise<null|any>}
 */
ZoomApi.createMeeting = async () => {

    const meetingPayload = {
        topic: "Meeting",
        type: 2,
        start_time: "2020-12-12 12:00:00",
        password: "Hey123",
        agenda: "This is the meeting description",
        settings: {
            host_video: false,
            participant_video: true,
            join_before_host: true,
            mute_upon_entry: true,
            use_pmi: false,
            approval_type: 0
        }
    };

    try {
        const token = jwt.sign({
            iss: Engine.get("zoom.key"),
            exp: ((new Date()).getTime() + 5000)
        }, Engine.get("zoom.secret"));

        const {data} = await Axios({
            method: 'post',
            url: Engine.get("zoom.url"),
            headers: {
                'User-Agent': 'Zoom-api-Jwt-Request',
                'content-type': 'application/json',
                'authorization': "Bearer " + token
            },
            data: meetingPayload
        });

        return data

    } catch (error) {
        console.error(error);
        return error.message
    }

};
