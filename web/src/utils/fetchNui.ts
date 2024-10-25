import { isEnvBrowser } from "./misc"

/**
 * Sends an NUI callback to the backend.
 *
 * @param eventName - The name of the event (e.g., "Minigame:End")
 * @param data - The data to send to the client
 * @param mockData - Optional mock data for testing in the browser
 */
export async function fetchNui<T = unknown>(
  eventName: string,
  data?: Record<string, any>,
  mockData?: T
): Promise<T> {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(data),
  };

  if (isEnvBrowser() && mockData) return mockData;

  const resourceName = (window as any).GetParentResourceName?.() || "nui-frame-app";
  const response = await fetch(`https://${resourceName}/${eventName}`, options);

  if (!response.ok) {
    throw new Error(`NUI fetch error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
