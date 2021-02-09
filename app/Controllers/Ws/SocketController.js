'use strict'

/**
 * Socket Controller
 *
 * @class SocketController
 */
class SocketController {

    /**
     * socket controller constructors
     *
     * @param socket
     * @param io
     */
    constructor(socket, io) {

        /**
         * IO on user connected
         * send id to client when client is connected
         *
         * @const onConnection
         *
         * @param client
         */
        io.on('connection', (client) => {
            socket.to(client.id).emit('id', client.id)
        });

        /**
         * Socket On Receive Notification
         * send to client target if requested
         *
         * @method
         *
         * @param args
         */
        socket.on('notification', (args) => {
            for (let to of args.to) socket.to(to).emit('notification', args.data)
        })

        /**
         * Socket On read_pointer
         * send pointer data to target if requested
         *
         * @method
         *
         * @param args
         */
        socket.on('read_pointer', (args) => {
            for (let to of args.to) socket.to(to).emit('read_pointer', args.id)
        })

        /**
         * Socket On Chat
         * send chat to target if requested
         *
         * @method
         *
         * @param args
         */
        socket.on('chat', (args) => {
            for (let to of args.to) socket.to(to).emit('chat', data)
        })
    }

    /**
     * create new instance
     * of socket controller
     *
     * @method handle
     * @static
     *
     * @param socket
     * @param io
     * @returns {SocketController}
     */
    static handle(socket, io) {
        return new SocketController(socket, io);
    }
}

module.exports = SocketController
