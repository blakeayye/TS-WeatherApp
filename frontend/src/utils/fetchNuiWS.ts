import { isEnvBrowser } from "./misc";

/**
 * Sends an NUI callback to the backend.
 *
 * @param eventName - The name of the event (e.g., "Minigame:End")
 * @param data - The data to send to the client
 * @param mockData - Optional mock data for testing in the browser
 */
export async function fetchNui<T = unknown>(
  eventName: string,
  data?: T, // Changed to T to match expected data type
  mockData?: T
): Promise<T> {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ event: eventName, data }), // Wrap in an object
  };
  
  const port = 5000; // Ensure this matches your server's port

  if (isEnvBrowser() && mockData) return mockData;
  console.log("sending");
  const resourceName = (window as any).GetParentResourceName?.() || "nui-frame-app";
  const response = await fetch(`http://localhost:${port}/nui-event`, options); // Ensure the endpoint matches

  if (!response.ok) {
    throw new Error(`NUI fetch error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
