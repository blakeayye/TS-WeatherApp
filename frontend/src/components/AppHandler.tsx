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

import Sun from '/src/assets/svgs/sun.svg';
import Cloud from '/src/assets/svgs/cloud.svg';
import CloudSnow from '/src/assets/svgs/cloudSnow.svg';
import Fog from '/src/assets/svgs/fog.svg';
import Rain from '/src/assets/svgs/rain.svg';
import Snow from '/src/assets/svgs/snow.svg';
import SunCloud from '/src/assets/svgs/sunCloud.svg';
import ThunderStorm from '/src/assets/svgs/thunderStorm.svg';
import SunRise from '/src/assets/svgs/sunRise.svg';
import SunSet from '/src/assets/svgs/sunSet.svg';

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
        daySvg: SunCloud,
        nightSvg: SunCloud,
    },
    {
        key: 2,
        name: 'Partly Cloudy',
        daySvg: SunCloud,
        nightSvg: SunCloud,
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
        daySvg: Rain,
        nightSvg: Rain,
    },
    {
        key: 53,
        name: 'Drizzle Moderate',
        daySvg: Rain,
        nightSvg: Rain,
    },
    {
        key: 55,
        name: 'Drizzle Dense',
        daySvg: Rain,
        nightSvg: Rain,
    },
    {
        key: 56,
        name: 'Freezing Drizzle Slight',
        daySvg: CloudSnow,
        nightSvg: CloudSnow,
    },
    {
        key: 57,
        name: 'Freezing Drizzle Dense',
        daySvg: CloudSnow,
        nightSvg: CloudSnow,
    },
    {
        key: 61,
        name: 'Rain Light',
        daySvg: Rain,
        nightSvg: Rain,
    },
    {
        key: 63,
        name: 'Rain Moderate',
        daySvg: Rain,
        nightSvg: Rain,
    },
    {
        key: 65,
        name: 'Rain Heavy',
        daySvg: Rain,
        nightSvg: Rain,
    },
    {
        key: 66,
        name: 'Drizzle Heavy',
        daySvg: CloudSnow,
        nightSvg: CloudSnow,
    },
    {
        key: 67,
        name: 'Drizzle Heavy',
        daySvg: CloudSnow,
        nightSvg: CloudSnow,
    },
    {
        key: 71,
        name: 'Snow Fall Slight',
        daySvg: Snow,
        nightSvg: Snow,
    },
    {
        key: 73,
        name: 'Snow Fall Moderate',
        daySvg: Snow,
        nightSvg: Snow,
    },
    {
        key: 75,
        name: 'Snow Fall Heavy',
        daySvg: Snow,
        nightSvg: Snow,
    },
    {
        key: 77,
        name: 'Snow Grains',
        daySvg: Snow,
        nightSvg: Snow,
    },
    {
        key: 80,
        name: 'Rain Showers Slight',
        daySvg: Rain,
        nightSvg: Rain,
    },
    {
        key: 81,
        name: 'Rain Showers Moderate',
        daySvg: Rain,
        nightSvg: Rain,
    },
    {
        key: 82,
        name: 'Rain Showers Violent',
        daySvg: Rain,
        nightSvg: Rain,
    },
    {
        key: 85,
        name: 'Snow Showers Slight',
        daySvg: CloudSnow,
        nightSvg: CloudSnow,
    },
    {
        key: 86,
        name: 'Snow Showers Heavy',
        daySvg: CloudSnow,
        nightSvg: CloudSnow,
    },
    {
        key: 95,
        name: 'Thunderstorm',
        daySvg: ThunderStorm,
        nightSvg: ThunderStorm,
    },
    {
        key: 96,
        name: 'Thunderstorm Slight Hail',
        daySvg: ThunderStorm,
        nightSvg: ThunderStorm,
    },
    {
        key: 99,
        name: 'Thunderstorm Heavy Hail',
        daySvg: ThunderStorm,
        nightSvg: ThunderStorm,
    },
    {
        key: 998,
        name: 'Sun Rise',
        daySvg: SunRise,
        nightSvg: SunRise,
    },
    {
        key: 999,
        name: 'Sun Set',
        daySvg: SunSet,
        nightSvg: SunSet,
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
                                                    backgroundColor: "yellow",
                                                    fontSize: "1.5vh",
                                                    display: "flex",
                                                    justifyContent: "space-evenly",
                                                    alignItems: "center",
                                                    flexDirection: "row",
                                                    border: `0.1vh solid rgba(138, 138, 138, 0.7)`,
                                                    
                                                }}
                                                key={forecast.time}
                                            >
                                                <p>Now</p>
                                                <p>{forecast.temperature} °{weatherData.temp}</p>
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
