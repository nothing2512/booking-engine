'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

/** @type {import('axios')} */
const Axios = require('axios')

/** @type {import('jsonwebtoken')} */
const jwt = use('jsonwebtoken')

const payload = {
    iss: Env.get('ZOOM_API_KEY'),
    exp: ((new Date()).getTime() + 5000)
};

const token = jwt.sign(payload, Env.get('ZOOM_API_SECRET'));

const ZoomApi = exports = module.exports = {}

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
        topic: "Demo Meeting 1",
        type: 2,
        start_time: "2020-12-12 12:00:00",
        password: "Hey123",
        agenda: "This is the meeting description",
        settings: {
            host_video: false,
            participant_video: false,
            join_before_host: false,
            mute_upon_entry: true,
            use_pmi: false,
            approval_type: 0
        }
    }

    try {

        const {data} = await Axios({
            method: 'post',
            url: "https://api.zoom.us/v2/users/me/meetings",
            headers: {
                'User-Agent': 'Zoom-api-Jwt-Request',
                'content-type': 'application/json',
                'authorization': "Bearer " + token
            },
            data: meetingPayload
        })

        return data

    } catch (error) {
        console.error(error);
        return error.message
    }

}
