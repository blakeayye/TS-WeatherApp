import fetch from 'node-fetch';

interface WeatherData {
    weatherForecast?: { 
        time: string; 
        temperature: number;
        weather: string;
    }[]; 
}

type ForecastType = "day" | "week";
type TempType = "f" | "c";

export function GetWeatherData(
    lat: number = 40.7128,
    lon: number = -74.0060,
    type: ForecastType = "week",
    temp: TempType = "f"
) {
    return MeteoWeather(lat, lon, type, temp);
}

export async function MeteoWeather(
    lat: number = 40.7128,
    lon: number = -74.0060,
    type: ForecastType = "day",
    temp: TempType = "f"
): Promise<WeatherData | null> {
    // Determine the forecast parameter based on the type
    const forecastParam = type === "day"
    ? "temperature_2m,weathercode"  // Get hourly temperature and weather code for current day
    : "temperature_2m_max,temperature_2m_min,weathercode";  // Keep daily max/min for weekly data

    const tempParam = temp === "f" ? "fahrenheit" : "celsius";

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&${type === "day" ? "hourly" : "daily"}=${forecastParam}&timezone=America/New_York&temperature_unit=${tempParam}`;
  

    //console.log("Fetching weather data from URL:", url);  // Log the URL for debugging

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch weather data: ${response.statusText}`);
        }
        const data = await response.json();
        //console.log(data);
        // Initialize the weatherData object
        const weatherData: WeatherData = { };

        // Check if the daily data is present
        if (type === "day" && data.hourly) {
            const weatherForecast = data.hourly.time.map((time: string, index: number) => ({
                time: time,
                temperature: Math.floor(data.hourly.temperature_2m[index]), // Average max and min for the day
                weather: data.hourly.weathercode[index]
            }));
            
            weatherData.weatherForecast = weatherForecast; // Store the forecast data
        } else if (type === "week" && data.daily) {
            const weatherForecast = data.daily.time.map((time: string, index: number) => ({
                time: time,
                temperature: Math.floor(data.daily.temperature_2m_max[index]), // Get the max temperature for the week
                weather: data.daily.weathercode[index]
            }));

            weatherData.weatherForecast = weatherForecast; // Store the weekly forecast data
        } else {
            throw new Error("Unexpected data format in API response");
        }

        //console.log(weatherData);
        return weatherData; // Return the valid weather data

    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null; // Return null in case of an error
    }
}
