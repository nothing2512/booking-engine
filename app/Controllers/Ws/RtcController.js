'use strict';

class RtcController {

    constructor(socket, io) {
        this.socket = socket;
        this.io = io;

        socket.on('create_room', roomNumber => {
            const rooms = socket.adapter.rooms.get(roomNumber);
            if (rooms === undefined) socket.join(roomNumber);
            else socket.emit('error', 'Room has been created by another user');
        });

        socket.on('join_room', (roomNumber) => {
            const rooms = socket.adapter.rooms.get(roomNumber);

            if (rooms === undefined) {
                socket.emit('error', "Room not found")
            } else if (rooms.size === 1) {
                socket.join(roomNumber);
                socket.emit('joined')
            } else {
                socket.emit('error', "Room is full")
            }
        });

        socket.on('ask_permission', (roomNumber) => {
            socket.broadcast.to(roomNumber).emit('permission_asked')
        });

        socket.on('candidate', (evt) => {
            socket.broadcast.to(evt.room).emit('answer', evt)
        });

        socket.on('permitted', (evt) => {
            socket.broadcast.to(evt.room).emit('permitted', evt.sdp)
        });

        socket.on('joined', (evt) => {
            socket.broadcast.to(evt.room).emit('user_joined', evt.sdp)
        });

        socket.on('test', (evt) => {
            socket.broadcast.to(evt.room).emit('test', evt.stream)
        });

        socket.on('santri_candidate', (evt) => {
            socket.broadcast.to(evt.room).emit('santri_candidate', evt.candidate)
        });

        socket.on('ustad_candidate', (evt) => {
            socket.broadcast.to(evt.room).emit('ustad_candidate', evt.candidate)
        });

        socket.on('mute', (room) => {
            socket.broadcast.to(room).emit('mute')
        });

        socket.on('unmute', (room) => {
            socket.broadcast.to(room).emit('unmute')
        });

        const leaveRoom = (room) => {
            socket.leave(room)
        };

        socket.on('disconnect', leaveRoom);
        io.on('disconnect', leaveRoom)
    }

    /**
     * create new instance
     * of RtcController
     *
     * @method handle
     * @static
     *
     * @returns {RtcController}
     * @param socket
     * @param io
     */
    static handle(socket, io) {
        return new RtcController(socket, io);
    }
}

module.exports = RtcController;
