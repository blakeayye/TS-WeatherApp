
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WeatherState {
    serverError: boolean;
    hidden: boolean;
    temp: string;
    keyMap: string;
}

const initialState: WeatherState = {
    serverError: false,
    hidden: false,
    temp: "f",
    keyMap: "day",
};

const weatherReducer = createSlice({
    name: "weatherReducer",
    initialState,
    reducers: {
        /**
         * Sets The Temperature that the calculations will use
         * @state temp - the temperature setting c or f
        */
        SET_TEMP: (state, action) => {
            state.temp = action.payload;
        },
        
        /**
         * Sets The Type of weather key so it gets daily or weekly
         * @state keyMap - should be day or week 
        */
        SET_KEYMAP: (state, action) => {
            state.keyMap = action.payload;
        },
        
        /**
         * Sets the view screen to show a server error
         * @state serverError - true or false
        */
        SERVER_ERROR: (state, action) => {
            state.serverError = action.payload;
        },
    },
});

export const { SET_TEMP, SET_KEYMAP, SERVER_ERROR } = weatherReducer.actions;
export default weatherReducer.reducer;
