import { MutableRefObject, useEffect, useRef, useState } from "react";
import { noop } from "../utils/misc";

interface NuiMessageData<T = unknown> {
  action: string;
  data: T;
}

type NuiHandlerSignature<T> = (data: T) => void;

/**
 * Custom hook to listen for NUI events using WebSockets.
 *
 * @param action - The action name to listen for (e.g., "Minigame:Update")
 * @param handler - Callback to handle the data associated with the action
 */
export const useNuiEvent = <T = unknown>(
  action: string,
  handler: NuiHandlerSignature<T>
) => {
  const savedHandler: MutableRefObject<NuiHandlerSignature<T>> = useRef(noop);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket("ws://localhost:5000");

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      const data: NuiMessageData<T> = JSON.parse(event.data);
      const { action: eventAction, data: eventData } = data;
      if (eventAction === action && savedHandler.current) {
        console.log("Saving Event data", eventData);
        savedHandler.current(eventData);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    ws.onerror = (error) => {
      //console.error("WebSocket error:", error);
    };

    // Save WebSocket instance
    setSocket(ws);

    return () => {
      ws.close(); // Clean up WebSocket connection on unmount
    };
  }, [action]);

  // You could also expose a method to send messages if needed
  const sendMessage = (data: unknown) => {
    if (socket) {
      socket.send(JSON.stringify(data));
    }
  };

  return { sendMessage };
};
