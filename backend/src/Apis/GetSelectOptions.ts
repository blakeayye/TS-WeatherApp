import fetch from 'node-fetch';

interface SelectOptionData {
    results: {
        confidence: number;
        formatted: string;
        geometry: {
            lat: number;
            lng: number;
        };
        annotations?: {  // Added annotations property
            sun?: {
                rise: {
                    apparent: number;
                    astronomical: number;
                    civil: number;
                    nautical: number;
                };
                set: {
                    apparent: number;
                    astronomical: number;
                    civil: number;
                    nautical: number;
                };
            };
            timezone?: {
                name: string;
                now_in_dst: number;
                offset_sec: number;
                offset_string: string;
                short_name: string;
            };
        };
        components: {
            "ISO_3166-1_alpha-2": string;
            "ISO_3166-1_alpha-3": string;
            "ISO_3166-2": string[];
            _category: string;
            _normalized_city: string;
            _type: string;
            continent: string;
            country: string;
            country_code: string;
            county: string;
            county_code: string;
            state: string;
            state_code: string;
            town?: string;
            village?: string;
        };
    }[];
    status: string;
}


export async function GetSelectOptions(
    value: string = 'Ashland'
) {
    try {
        // Wait for GetLocationOptions to complete before logging
        const locationOptions = await GetLocationOptions(value);
        //console.log(locationOptions);
        return locationOptions;
    } catch (error) {
        console.error('Error in GetSelectOptions:', error);
        return null;
    }
}

const API_KEY = ''; 
const API_URL = 'https://api.opencagedata.com/geocode/v1/json?q=';
const currentTime = Date.now();

export async function GetLocationOptions(
    value: string = 'Ashland'
): Promise<SelectOptionData | null> {
    try {
        const response = await fetch(`${API_URL}?q=${value}&key=${API_KEY}`);
        const data = await response.json();
        //console.log(data);
        if (!response.ok) {
            console.error('Error fetching location suggestions:', data.status);
            return null;
        }
        if (data.results.length > 0) {
            // (result.components?.county && result.components.state && result.components.country ? `${result.components.county}, ${result.components.state} ${result.components.country}`.trim() : 
            const locationSuggestions = data.results.map((result: any) => ({
                name: `${result.formatted}`.trim(),
                lat: result.geometry.lat,
                lon: result.geometry.lng,
                sunRise: result.annotations?.sun?.rise?.civil || {},
                sunSet: result.annotations?.sun?.set?.civil || {},
                timezone: result.annotations?.timezone || {}, 
            }));
            //console.log(locationSuggestions, "LOCATIONS");
            return locationSuggestions;
        } else {
            console.error('No results found.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching location suggestions:', error);
        return null;
    }
}
