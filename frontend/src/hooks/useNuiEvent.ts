import { MutableRefObject, useEffect, useRef } from "react";
import { noop } from "../utils/misc";

interface NuiMessageData<T = unknown> {
  action: string;
  data: T;
}

type NuiHandlerSignature<T> = (data: T) => void;

/**
 * Custom hook to listen for NUI events.
 *
 * @param action - The action name to listen for (e.g., "Minigame:Update")
 * @param handler - Callback to handle the data associated with the action
 */
export const useNuiEvent = <T = unknown>(
  action: string,
  handler: NuiHandlerSignature<T>
) => {
  const savedHandler: MutableRefObject<NuiHandlerSignature<T>> = useRef(noop);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: MessageEvent<NuiMessageData<T>>) => {
      const { action: eventAction, data } = event.data;

      if (eventAction === action && savedHandler.current) {
        savedHandler.current(data);
      }
    };

    window.addEventListener("message", eventListener);
    return () => window.removeEventListener("message", eventListener);
  }, [action]);
};
