// src/AppHandler.tsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState } from "../store";
import { debugData } from "../utils/debugData";
import { isEnvBrowser } from "../utils/misc";
import { useNuiEvent } from "../hooks/useNuiEvent";
import { SET_TEMP, SET_KEYMAP, SERVER_ERROR } from "../reducers/weatherReducer";

import { fetchNui } from "../utils/fetchNui";

import LocationSearch from './LocationSearch';

import './Css/globalStyle.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/pro-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

library.add(fab, fas);


import Cloud from '/src/assets/svgs/cloudy.svg';
import Fog from '/src/assets/svgs/weather_sagittarius.svg';

import DayRain from '/src/assets/svgs/rainy-3.svg';
import NightRain from '/src/assets/svgs/rainy-6.svg';

import DaySnow from '/src/assets/svgs/snowy-3.svg';
import NightSnow from '/src/assets/svgs/snowy-6.svg';

import DayCloud from '/src/assets/svgs/cloudy-day-1.svg';
import NightCloud from '/src/assets/svgs/cloudy-night-1.svg';

import ThunderStorm from '/src/assets/svgs/thunder.svg';
import Sun from '/src/assets/svgs/day.svg';
import Moon from '/src/assets/svgs/night.svg';

export interface WeatherDataINT {
    name: string;
    lon: number;
    lat: number;
    sunRise: number;
    sunSet: number;
    timezone: {
        name: string;
        now_in_dst: number;
        offset_sec: number;
        offset_string: string;
        short_name: string;
    };
    forcast: Array<{
        time: string; 
        temperature: number; 
        weather: number;
    }>;
}

type weatherTableType = {
    key: number;
    name: string;
    daySvg: React.FC<React.SVGProps<SVGSVGElement>>;
    nightSvg: React.FC<React.SVGProps<SVGSVGElement>>;
};

const weatherTable: weatherTableType[] = [
    {
        key: 0,
        name: 'Clear Sky',
        daySvg: Sun,
        nightSvg: Sun,
    },
    {
        key: 1,
        name: 'Mainly Clear',
        daySvg: DayCloud,
        nightSvg: NightCloud,
    },
    {
        key: 2,
        name: 'Partly Cloudy',
        daySvg: DayCloud,
        nightSvg: NightCloud,
    },
    {
        key: 3,
        name: 'Cloudy',
        daySvg: Cloud,
        nightSvg: Cloud,
    },
    {
        key: 45,
        name: 'Fog',
        daySvg: Fog,
        nightSvg: Fog,
    },
    {
        key: 47,
        name: 'Depositing Rime Fog',
        daySvg: Fog,
        nightSvg: Fog,
    },
    {
        key: 51,
        name: 'Drizzle Light',
        daySvg: DayRain,
        nightSvg: NightRain,
    },
    {
        key: 53,
        name: 'Drizzle Moderate',
        daySvg: DayRain,
        nightSvg: NightRain,
    },
    {
        key: 55,
        name: 'Drizzle Dense',
        daySvg: DayRain,
        nightSvg: NightRain,
    },
    {
        key: 56,
        name: 'Freezing Drizzle Slight',
        daySvg: DaySnow,
        nightSvg: NightSnow,
    },
    {
        key: 57,
        name: 'Freezing Drizzle Dense',
        daySvg: DaySnow,
        nightSvg: NightSnow,
    },
    {
        key: 61,
        name: 'Rain Light',
        daySvg: DayRain,
        nightSvg: NightRain,
    },
    {
        key: 63,
        name: 'Rain Moderate',
        daySvg: DayRain,
        nightSvg: NightRain,
    },
    {
        key: 65,
        name: 'Rain Heavy',
        daySvg: DayRain,
        nightSvg: NightRain,
    },
    {
        key: 66,
        name: 'Drizzle Heavy',
        daySvg: DaySnow,
        nightSvg: NightSnow,
    },
    {
        key: 67,
        name: 'Drizzle Heavy',
        daySvg: NightSnow,
        nightSvg: NightSnow,
    },
    {
        key: 71,
        name: 'Snow Fall Slight',
        daySvg: DaySnow,
        nightSvg: NightSnow,
    },
    {
        key: 73,
        name: 'Snow Fall Moderate',
        daySvg: DaySnow,
        nightSvg: NightSnow,
    },
    {
        key: 75,
        name: 'Snow Fall Heavy',
        daySvg: DaySnow,
        nightSvg: NightSnow,
    },
    {
        key: 77,
        name: 'Snow Grains',
        daySvg: DaySnow,
        nightSvg: NightSnow,
    },
    {
        key: 80,
        name: 'Light Rain',
        daySvg: DayRain,
        nightSvg: NightRain,
    },
    {
        key: 81,
        name: 'Moderate Rain',
        daySvg: DayRain,
        nightSvg: NightRain,
    },
    {
        key: 82,
        name: 'Heavy Rain',
        daySvg: DayRain,
        nightSvg: NightRain,
    },
    {
        key: 85,
        name: 'Light Snow',
        daySvg: DaySnow,
        nightSvg: NightSnow,
    },
    {
        key: 86,
        name: 'Heavy Snow',
        daySvg: DaySnow,
        nightSvg: NightSnow,
    },
    {
        key: 95,
        name: 'Thunderstorm',
        daySvg: ThunderStorm,
        nightSvg: ThunderStorm,
    },
    {
        key: 96,
        name: 'Hail Thunderstorm',
        daySvg: ThunderStorm,
        nightSvg: ThunderStorm,
    },
    {
        key: 99,
        name: 'Hail Thunderstorm',
        daySvg: ThunderStorm,
        nightSvg: ThunderStorm,
    },
    {
        key: 998,
        name: 'Sun Rise',
        daySvg: Sun,
        nightSvg: Sun,
    },
    {
        key: 999,
        name: 'Sun Set',
        daySvg: Moon,
        nightSvg: Moon,
    },
];

const AppHandler: React.FC = () => {
    const weatherData = useSelector((state: RootState) => state.weather);
    const dispatch = useDispatch();

    const [weatherDT, setWeatherDT] = useState<WeatherDataINT | null>(null);

    const setWeatherData = (data: WeatherDataINT) => {
        setWeatherDT(data);
    };

    // Automatically gets the local timezone
    const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get the current time in milliseconds in the local timezone
    const currentTimeInLocalMillis = Date.now(); // This gets the current time in milliseconds directly

    // Get the current hour in your local timezone
    const currentHourInLocalTZ = new Date(currentTimeInLocalMillis).toLocaleString("en-US", {
        timeZone: localTimeZone,
        hour: '2-digit',
        hour12: false // Use 24-hour format
    });

    const sunriseEntry = {
        time: weatherDT?.sunRise ? new Date(weatherDT.sunRise * 1000).toISOString() : new Date(0).toISOString(), // Convert to ISO string or fallback to epoch start
        weather: 998, // Use the code for sunrise
        temperature: 998, 
    };
    
    // Extract hour number from sunsetEntry
    const sunriseDate = new Date(sunriseEntry.time);
    const sunriseHour = sunriseDate.getUTCHours(); // Use getUTCHours for the hour in UTC

    // If you need the hour in the local timezone based on weatherDT
    const sunriseHourInTZ = sunriseDate.toLocaleString("en-US", {
        timeZone: weatherDT?.timezone.name,
        hour: '2-digit',
        hour12: false // Use 24-hour format
    });

    const sunsetEntry = {
        time: weatherDT?.sunSet ? new Date(weatherDT.sunSet * 1000).toISOString() : new Date(0).toISOString(), // Convert to ISO string or fallback to epoch start
        weather: 999, // Use the code for sunset
        temperature: 999, 
    };

    // Extract hour number from sunsetEntry
    const sunsetDate = new Date(sunsetEntry.time);
    const sunsetHour = sunsetDate.getUTCHours(); // Use getUTCHours for the hour in UTC

    // If you need the hour in the local timezone based on weatherDT
    const sunsetHourInTZ = sunsetDate.toLocaleString("en-US", {
        timeZone: weatherDT?.timezone.name,
        hour: '2-digit',
        hour12: false // Use 24-hour format
    });

    const combinedForecasts = [
        ...(weatherDT?.forcast || []), // Include existing forecasts
        sunriseEntry, // Add sunrise entry
        sunsetEntry,  // Add sunset entry
    ];

    const sortedFilteredForecasts = combinedForecasts.sort((a, b) => {
        return new Date(a.time).getTime() - new Date(b.time).getTime();
    });
    

    // Define the end time for the next 24 hours in your local timezone
    const endTimeInLocalTZ = currentTimeInLocalMillis + 23 * 60 * 60 * 1000;

    // Define the start time for one hour before the current time
    const startTimeInLocalTZ = currentTimeInLocalMillis - 60 * 60 * 1000; // One hour before current time

    // Filter forecast entries to include only those within the specified range
    const filteredForecasts = sortedFilteredForecasts.filter(forecast => {
        // Get the forecast time in milliseconds in the forecast's timezone
        const forecastTimeInTZ = new Date(forecast.time).toLocaleString("en-US", {
            timeZone: weatherDT?.timezone.name,
        });
        const forecastTimeInTZMillis = new Date(forecastTimeInTZ).getTime();

        // Check if the forecast is for sunrise or sunset
        const isSunriseOrSunset = forecast.weather === 998 || forecast.weather === 999;

        // Filter logic
        return (
            (forecastTimeInTZMillis >= startTimeInLocalTZ && forecastTimeInTZMillis < endTimeInLocalTZ) || // Within the next 24 hours
            isSunriseOrSunset // Include sunrise and sunset forecasts
        );
    });

    // This Removes the previous sunset or sunrise because of the time diff
    const finalFilteredForecasts = filteredForecasts.filter((forecast, index, forecasts) => {
        const isSunriseOrSunset = forecast.weather === 998 || forecast.weather === 999;
    
        // Check for the first entry (index 0)
        if (isSunriseOrSunset && index === 0) {
            // Check if there is a previous entry (make sure to check the length)
            if (forecasts.length > 1) {
                const previousForecast = forecasts[1]; // Get the next forecast
                const currentForecastTime = new Date(forecast.time).getTime();
                const previousForecastTime = new Date(previousForecast.time).getTime();
                // If the time of the previous forecast is smaller, return false
                if (previousForecastTime > currentForecastTime) {
                    return false; // Exclude this forecast
                }
            }
        }
    
        // For all other forecasts, keep them
        return true;
    });
    
    if (weatherData.hidden) {
        return (
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(15, 15, 15, 1)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        width: "30%",
                        height: "30%",
                        //backgroundColor: "cream",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "3vh",
                        fontWeight: 600,
                    }}
                >
                    Error Hidden
                </div>
            </div>
        ); 
    }

    if (weatherData.serverError) {
        return (
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(15, 15, 15, 1)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        width: "30%",
                        height: "30%",
                        //backgroundColor: "cream",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "3vh",
                        fontWeight: 600,
                    }}
                >
                    Error Fetching From Server
                </div>
            </div>
        ); 
    }

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(15, 15, 15, 1)",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                flexDirection: "column",
            }}
        >
            <div
                style={{
                    width: "50%",
                    height: "auto",
                    //backgroundColor: "black",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <LocationSearch
                    onSetWeatherData={setWeatherData}
                /> 
            </div>
            {weatherDT && (
                <div 
                    className="fade-in"
                    style={{
                        marginTop: "1vh",
                        width: "50%",
                        height: "50%",
                        display: "flex",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                        backgroundColor: "rgba(35, 35, 35, 0.8)",
                        color: "white",
                        borderRadius: "1vh",
                        flexDirection: "column",
                        
                    }}
                >
                    <div 
                        style={{
                            //marginTop: "2vh",
                            color: "white",
                            fontSize: "2vh",
                            fontWeight: 600,
                        }}
                    >
                        {weatherDT.name}
                    </div>
                        {weatherDT && weatherDT.forcast ? (
                            <>
                                {/* Map for the forecast matching the current hour */}
                                {finalFilteredForecasts?.map(forecast => {
                                    const forecastTimeInTZ = new Date(forecast.time).toLocaleString("en-US", {
                                        timeZone: weatherDT.timezone.name,
                                        hour: '2-digit',
                                        hour12: false // Use 24-hour format
                                    });

                                    // Check if the hour matches the current hour
                                    if (forecastTimeInTZ === currentHourInLocalTZ) {

                                        const matchedWeather = weatherTable.find(entry => entry.key === forecast.weather);

                                        return (
                                            <div 
                                                style={{
                                                    borderRadius: "1vh",
                                                    width: "75%",
                                                    height: "20%",
                                                    //backgroundColor: "yellow",
                                                    fontSize: "1.5vh",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    flexDirection: "row",
                                                    border: `0.1vh solid rgba(138, 138, 138, 0.7)`,
                                                }}
                                                key={forecast.time}
                                            >
                                                <div
                                                    style={{
                                                        flex: "1 1 20%",
                                                        height: "100%",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        //backgroundColor: "orange",
                                                        textAlign: "center",
                                                    }}
                                                >   
                                                    <p style={{margin: 0, padding: 0, color: "rgba(12, 71, 122, 1)"}}>Time:</p>
                                                    Now
                                                </div>

                                                <div
                                                    style={{
                                                        flex: "1 1 20%",
                                                        height: "100%",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        //backgroundColor: "orange",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <p style={{margin: 0, padding: 0, color: "rgba(191, 204, 94, 1)"}}>Temperature:</p>
                                                    {forecast.temperature} °{weatherData.temp}
                                                </div>

                                                <div
                                                    style={{
                                                        flex: "1 1 20%",
                                                        height: "100%",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        //backgroundColor: "orange",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <p style={{margin: 0, padding: 0, color: "rgba(113, 89, 201, 1)"}}>Weather:</p>
                                                    {matchedWeather?.name}
                                                </div>

                                                <div
                                                    style={{
                                                        flex: "1 1 20%",
                                                        height: "100%",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        //backgroundColor: "orange",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {
                                                        forecastTimeInTZ > sunsetHourInTZ ? (
                                                            matchedWeather?.nightSvg && (
                                                                <matchedWeather.nightSvg 
                                                                    height="100%"
                                                                    width="100%"
                                                                    style={{
                                                                        color: "white",
                                                                    }}
                                                                />
                                                            )
                                                        ) : forecastTimeInTZ < sunriseHourInTZ ? (
                                                            matchedWeather?.nightSvg && (
                                                                <matchedWeather.nightSvg 
                                                                    height="100%"
                                                                    width="100%"
                                                                    style={{
                                                                        color: "white",
                                                                    }}
                                                                />
                                                            )
                                                        ) : (
                                                            matchedWeather?.daySvg && (
                                                                <matchedWeather.daySvg 
                                                                    height="100%"
                                                                    width="100%"
                                                                    style={{
                                                                        color: "white",
                                                                    }}
                                                                />
                                                            )
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Return null for forecasts that do not match
                                    return null;
                                })}
                                <div
                                    className="container"
                                    style={{
                                        //marginTop: "2vh",
                                        gridTemplateColumns: `repeat(7, 1fr)`,
                                        gridTemplateRows: `repeat(1, 1fr)`,
                                        display: 'grid',
                                        gap: "1vh",
                                        padding: "2vh",
                                        overflow: "auto",
                                        height: "23vh",
                                        maxHeight: "23vh",
                                        scrollSnapType: "y mandatory",
                                        scrollBehavior: "auto",
                                    }}
                                >
                                {/* Map for all other forecasts */}
                                {finalFilteredForecasts?.map(forecast => {
                                    const forecastTimeInTZ = new Date(forecast.time).toLocaleString("en-US", {
                                        timeZone: weatherDT.timezone.name,
                                        hour: '2-digit',
                                        hour12: false // Use 24-hour format
                                    });
                                    if (forecastTimeInTZ === currentHourInLocalTZ) {
                                        return null;
                                    }
                                    const matchedWeather = weatherTable.find(entry => entry.key === forecast.weather);

                                    const displayTime = new Intl.DateTimeFormat("en-US", {
                                        hour: "numeric",
                                        minute: "numeric",
                                        timeZone: weatherDT.timezone.name
                                    }).format(new Date(forecast.time));

                                    return (
                                        <div 
                                            style={{
                                                borderRadius: "1vh",
                                                width: "100%",
                                                height: "100%",
                                                fontSize: "1.5vh",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                flexDirection: "column",
                                                border: `0.1vh solid rgba(138, 138, 138, 0.7)`,
                                                scrollSnapAlign: "start",
                                                backgroundImage: 
                                                    forecast.weather === 998 ? "linear-gradient(0deg, rgba(255,167,0,0.725) 0%, rgba(255,193,0,0.812) 45%, rgba(255,255,255,0.8) 100%)" 
                                                    : forecast.weather === 999 ? "linear-gradient(0deg, rgba(52,0,255,0.725) 0%, rgba(0,120,255,0.812) 45%, rgba(255,255,255,0.8) 100%)" 
                                                    : "none",
                                            }}
                                            key={forecast.time}
                                        >
                                            <p>{displayTime}</p>
                                            {forecast.weather !== 998 && forecast.weather !== 999 && (
                                                <p>{forecast.temperature} °{weatherData.temp}</p>
                                            )}
                                            <p>{matchedWeather?.name}</p>
                                            {
                                                forecastTimeInTZ > sunsetHourInTZ ? (
                                                    matchedWeather?.nightSvg && (
                                                        <matchedWeather.nightSvg 
                                                            height="100%"
                                                            width="100%"
                                                            style={{
                                                                color: "white",
                                                            }}
                                                        />
                                                    )
                                                ) : forecastTimeInTZ < sunriseHourInTZ ? (
                                                    matchedWeather?.nightSvg && (
                                                        <matchedWeather.nightSvg 
                                                            height="100%"
                                                            width="100%"
                                                            style={{
                                                                color: "white",
                                                            }}
                                                        />
                                                    )
                                                ) : (
                                                    matchedWeather?.daySvg && (
                                                        <matchedWeather.daySvg 
                                                            height="100%"
                                                            width="100%"
                                                            style={{
                                                                color: "white",
                                                            }}
                                                        />
                                                    )
                                                )
                                            }
                                        </div>
                                    );
                                })}
                                </div>
                            </>
                        ) : (
                            <p>Loading weather data...</p>
                        )}
                </div>
            )}
        </div>
    ); 

}


export default AppHandler;
