'use strict';

/** @type {typeof import('Engine')} */
const Engine = use('App/Helpers/Engine');

/** @type {typeof import('googleapis')} */
const {google} = require('googleapis');

class Google {

    static async createMeet(date, time, emails) {
        const client_id = Engine.get("google.client_id")
        const client_secret = Engine.get("google.client_secret")
        const redirect_uri = Engine.get("redirect_uri")
        const payload = {
            summary: `${Engine.get("app")} meet`,
            location: 'Online',
            description: `${Engine.get("app")} meet`,
            start: {
                dateTime: `${date}T${time}`,
                timeZone: 'Asia/Jakarta'
            },
            end: {
                dateTime: `${date}T${time}`,
                timeZone: 'Asia/Jakarta'
            },
            attendees: [],
            reminders: {
                useDefault: false,
                overrides: [
                    {method: 'email', minutes: 24 * 60},
                    {method: 'popup', minutes: 3 * 60},
                    {method: 'popup', minutes: 30}
                ]
            },
            conferenceData: {
                createRequest: {requestId: "bacatarot"}
            }
        };

        for (let email of emails) payload.attendees.push({email: email})

        const client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
        client.setCredentials(Engine.get("google.credentials"))

        const calendar = google.calendar({version: 'v3', auth: client});
        try {
            const response = await calendar.events.insert({
                calendarId: 'primary',
                resource: payload,
                auth: client,
                conferenceDataVersion: 1
            })
            return {
                status: true,
                message: "",
                url: response.data.hangoutLink
            }
        } catch (e) {
            return {
                status: false,
                message: e.message,
                url: null
            }
        }
    }
}

module.exports = Google
