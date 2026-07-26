import { useEffect, useRef } from "react";
import { getSocket } from "../lib/socket.js";

/** Joins `shop:<shopId>` and invokes callbacks on new/updated orders. */
export function useShopSocket(shopId, { onNew, onUpdated }) {
  const onNewRef = useRef(onNew);
  const onUpdatedRef = useRef(onUpdated);
  onNewRef.current = onNew;
  onUpdatedRef.current = onUpdated;

  useEffect(() => {
    if (!shopId) return;
    const socket = getSocket();

    const joinRoom = () => {
      socket.emit("shop:join", shopId);
    };

    socket.connect();
    if (socket.connected) {
      joinRoom();
    }
    socket.on("connect", joinRoom);

    const handleNew = (order) => onNewRef.current?.(order);
    const handleUpdated = (order) => onUpdatedRef.current?.(order);

    socket.on("order:new", handleNew);
    socket.on("order:updated", handleUpdated);

    return () => {
      socket.emit("shop:leave", shopId);
      socket.off("connect", joinRoom);
      socket.off("order:new", handleNew);
      socket.off("order:updated", handleUpdated);
      socket.disconnect();
    };
  }, [shopId]);
}
