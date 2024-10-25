import { isEnvBrowser } from "./misc"

/**
* This sends a nui callback to client
*
* @param eventName - {string} what the event is {eg. Minigame:End}
* @param data - {just says uknown idk yet} the data send to the client
*/
export async function fetchNui<T = unknown>(
  eventName: string,
  data?: unknown,
  mockData?: T,
): Promise<T> {
  const options = {
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(data),
  };

  if (isEnvBrowser() && mockData) return mockData

  const resourceName = (window as any).GetParentResourceName
    ? (window as any).GetParentResourceName() : "nui-frame-app"

  const resp = await fetch(`https://${resourceName}/${eventName}`, options)

  const respFormatted = await resp.json()

  return respFormatted
}
