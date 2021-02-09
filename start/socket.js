'use strict'

/*
|--------------------------------------------------------------------------
| Websocket
|--------------------------------------------------------------------------
|
| This file is used to register websocket channels and start the Ws server.
| Learn more about same in the official documentation.
| https://adonisjs.com/docs/websocket
|
| For middleware, do check `wsKernel.js` file.
|
*/

const
    /** @type {typeof import('Server')} */
    Server = use('Server'),

    /** @type {typeof import('../app/Controllers/Ws/RtcController')} */
    RtcController = use('App/Controllers/Ws/RtcController'),

    /** @type {typeof import('../App/Controllers/Ws/SocketController')} */
    SocketController = use('App/Controllers/Ws/SocketController'),

    /** @type {typeof import('socket.io')} */
    io = use('socket.io')(Server.getInstance(null), {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    })

/**
 * Set Global variable of io
 *
 * @type {{Server: Server; ServerOptions: ServerOptions}}
 */
global.io = io

/**
 * IO on connection created
 *
 * @method
 *
 * @param socket
 */
io.on('connection', function (socket) {

    /**
     * Creating Socket Controller
     */
    SocketController.handle(socket, io)
    RtcController.handle(socket, io)
})