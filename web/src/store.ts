// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import gamesReducer from "./reducers/gamesReducer";

export const store = configureStore({
    reducer: {
        games: gamesReducer,
    },
});

// Define the RootState and AppDispatch types for use throughout your app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
