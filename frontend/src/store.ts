// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import weatherReducer from "./reducers/weatherReducer";

export const store = configureStore({
    reducer: {
        weather: weatherReducer,
    },
});

// Define the RootState and AppDispatch types for use throughout your app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
