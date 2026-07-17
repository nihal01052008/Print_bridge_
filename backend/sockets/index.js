/**
 * Socket.io wiring for real-time order updates.
 * Rooms are scoped per shop (`shop:<shopId>`) so each dashboard only
 * receives events relevant to its own incoming orders.
 */
export function initSockets(io) {
  io.on("connection", (socket) => {
    socket.on("shop:join", (shopId) => {
      if (!shopId) return;
      socket.join(`shop:${shopId}`);
    });

    socket.on("shop:leave", (shopId) => {
      if (!shopId) return;
      socket.leave(`shop:${shopId}`);
    });

    socket.on("disconnect", () => {
      // no-op for now, room membership is cleaned up automatically
    });
  });
}

/** Call from controllers after mutating an order to push a live update. */
export function emitOrderEvent(io, shopId, event, payload) {
  io.to(`shop:${shopId}`).emit(event, payload);
}
