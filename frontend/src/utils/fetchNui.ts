import { isEnvBrowser } from "./misc";

/**
 * Sends an AJAX callback to the backend.
 *
 * @param eventName - The name of the event (e.g., "Minigame:End")
 * @param data - The data to send to the server
 * @param mockData - Optional mock data for testing in the browser
 * @returns The response data from the server
 */
export async function fetchNui<T = unknown>(
  eventName: string,
  data?: T,
  mockData?: T
): Promise<T> {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ event: eventName, data }), // Wrap event and data in an object
  };
  
  // const port = 5000;

  if (isEnvBrowser() && mockData) return mockData;

  try {
    //console.log("Sending request to server..."); // This should now work
    // const response = await fetch(`http://localhost:${port}/nui-event`, options);
    const response = await fetch(`http://77.37.63.169:3389/nui-event`, options);

    if (!response.ok) {
      throw new Error(`NUI fetch error: ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData as T; // Return the data from server response
  } catch (error) {
    //console.error("Error fetching NUI event:", error);
    throw error; // Rethrow the error for handling in the calling function
  }
}
