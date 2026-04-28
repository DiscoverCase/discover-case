/**
 * @fileoverview Socket.IO connection bootstrap and handler registration.
 */

const { registerRoomHandlers } = require('./handlers/roomHandlers');
const { registerGameHandlers } = require('./handlers/gameHandlers');
const { registerModerationHandlers } = require('./handlers/moderationHandlers');

/**
 * Registers all socket event handler groups for each new connection.
 *
 * @param {object} io - Socket.IO server instance.
 */
module.exports = function(io) {
  io.on('connection', (socket) => {
    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
    registerModerationHandlers(io, socket);
  });
};
