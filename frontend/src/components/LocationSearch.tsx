import React, { useState } from 'react';
import { fetchNui } from "../utils/fetchNui";

import { RootState } from "../store";
import { useSelector, useDispatch } from "react-redux";
import { SET_TEMP, SET_KEYMAP, SERVER_ERROR } from "../reducers/weatherReducer";

import { WeatherDataINT } from "./AppHandler";

import './Css/inputStyle.css';

interface Location {
    name: string;
    lat: number;
    lon: number;
    sunRise: number,
    sunSet: number,
    timezone: {
        name: string;
        now_in_dst: number;
        offset_sec: number;
        offset_string: string;
        short_name: string;
    };
}

interface LocationSearchINT {
    onSetWeatherData: (data: WeatherDataINT) => void; 
}

const LocationSearch: React.FC<LocationSearchINT> = ({ onSetWeatherData }) => {
    const weatherData = useSelector((state: RootState) => state.weather);

    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Location[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value); // Trim whitespace from input

        // Clear the existing timeout to reset the debounce
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        // Fetch suggestions only if there's input
        if (value) {
            // Set loading to true while waiting for suggestions
            setLoading(true);

            // Set a new timeout for 5 seconds (5000 ms)
            const timeout = setTimeout(() => {
                fetchSuggestions(value);
            }, 750);

            setDebounceTimeout(timeout);
        } else {
            setSuggestions([]);
            setError('');
            setLoading(false); // Reset loading when input is cleared
        }
    };

    const fetchSuggestions = async (search: string) => {
        if (!search.trim()) {
            setSuggestions([]);
            setLoading(false); // Reset loading if no search term
            return;
        }

        setError('');

        try {
            // Call the backend function via fetchNui with search as the parameter
            const response = await fetchNui("GetSelectOptions", search);
            if (response) {
                const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;

                // Check if we received a valid response
                if (parsedResponse && parsedResponse.message && parsedResponse.message.length > 0) {
                    const locationSuggestions = parsedResponse.message.map((result: any) => ({
                        name: result.name,
                        lat: result.lat,
                        lon: result.lon,
                        sunRise: result.sunRise,
                        sunSet: result.sunSet,
                        timezone: result.timezone,
                    }));
                    setSuggestions(locationSuggestions);
                } else {
                    setError('No results found.');
                }
            } else {
                setError('No results found.');
            }
        } catch (error) {
            SERVER_ERROR(true);
            console.error('Error fetching location suggestions:', error);
            setError('Error fetching suggestions. Please try again.');
        } finally {
            setLoading(false); // Reset loading after fetching suggestions
        }
    };

    const handleMouseLeave = () => {
        setQuery('');
        setSuggestions([]);
    };
    
    const handleSuggestionClick = async (location: Location) => {
        setQuery('');
        setSuggestions([]);
        try {
            const response = await fetchNui("GetWeatherData", { location: location, keyMap: weatherData.keyMap, temp: weatherData.temp });
            if (response) {
                const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
                //console.log("WEATHER DATA", parsedResponse);
                if (parsedResponse.success) {
                    const weatherDt: WeatherDataINT = {
                        name: location.name,
                        lon: location.lon,
                        lat: location.lat,
                        sunRise: location.sunRise,
                        sunSet: location.sunSet,
                        timezone: location.timezone,
                        forcast: parsedResponse.message.weatherForecast,
                    };

                    onSetWeatherData(weatherDt)
                } else {
                    console.log("ERROR Getting Weather Data");
                }
            } else {
                console.log("No Weather Data Found");
            }
        } catch (error) {
            SERVER_ERROR(true);
            console.error("Failed to fetch from server:", error);
        }
    };
//     message
// : 
// weatherForecast
// :
// parsedResponse.message.weatherForecast

// location.lat
//location.lon
// location.name
// location.sunRise
// location.sunSet
// location.timezone.name
// location.timezone.now_in_dst
// location.timezone.offset_sec
// location.timezone.offset_string
// location.timezone.short_name


    return (
        <div
            style={{
                width: "100%",
                height: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                borderRadius: "1vh",
            }}
        >   
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <input
                    className="Input"
                    type="text"
                    style={{
                        borderBottomLeftRadius: (suggestions.length > 0 || loading) ? 0 : "1vh",
                        borderBottomRightRadius: (suggestions.length > 0 || loading) ? 0 : "1vh",
                    }}
                    value={query}
                    onChange={handleChange}
                    placeholder="Type a location..."
                />
            </div>
            <div
                style={{
                    width: "100%",
                    height: "auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    borderRadius: "1vh",
                    background: 'radial-gradient(circle, rgba(43, 148, 171, 0.2) 0%, rgba(16, 48, 59, 0.8) 25%, rgba(11, 30, 41, 0.8) 100%)',
                    borderTopLeftRadius: (suggestions.length > 0 || loading) ? 0 : "1vh",
                    borderTopRightRadius: (suggestions.length > 0 || loading) ? 0 : "1vh",
                    borderTop: (suggestions.length > 0 || loading) ? "0.25vh dotted black" : "none",
                }}
                onMouseLeave={handleMouseLeave}
            >   
                {loading ? (
                    <div
                        style={{
                            width: "100%",
                            height: "auto",
                            //backgroundColor: "red",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "white",
                            fontSize: "2vh",
                            fontWeight: 500,
                            textAlign: "center",
                            marginTop: "1vh",
                            paddingLeft: "1vh",
                            paddingBottom: "1vh",
                            //textDecoration: "underline",
                        }}
                    >
                        Loading Suggestions...
                    </div>
                ) : (
                    <>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        {suggestions.length > 0 && (
                            <ul
                                style={{
                                    width: "96%",
                                    //backgroundColor: "yellow",
                                    fontSize: "2vh",
                                    fontWeight: 500,
                                    color: "white",
                                    listStyleType: "none",
                                    margin: 0,
                                    padding: 0,
                                    paddingBottom: "1vh",
                                }}
                            >
                                <div
                                    style={{
                                        width: "auto",
                                        height: "auto",
                                        //backgroundColor: "red",
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        alignItems: "center",
                                        color: "white",
                                        fontSize: "2vh",
                                        fontWeight: 500,
                                        textAlign: "center",
                                        marginTop: "1vh",
                                        paddingLeft: "1vh",
                                        textDecoration: "underline",
                                    }}
                                >
                                    Suggestions:
                                </div>

                                {suggestions.map((location, index) => (
                                    <li 
                                        key={index} 
                                        className="Suggestion"
                                        onClick={() => handleSuggestionClick(location)}
                                    >
                                        {location.name}
                                    </li>
                                ))}
                                
                            </ul>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LocationSearch;
