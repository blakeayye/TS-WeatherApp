// src/features/gamesReducer.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type MinigameState =
    | { 
        // NeedleGame
        gameType: "needle"; 
        GreenWidth: number; 
        Timer: number; 
        Difficulty: number; 
        opacityState: number  
    } | {
        // PipeGame
        gameType: "pipe"; 
        TileWidth: number; 
        TileHeight: number; 
        Timer: number; 
        readyTimer: number;
        opacityState: number
    } | { 
        // ArrowGame
        gameType: "arrow"; 
        TileWidth: number; 
        TileHeight: number; 
        Timer: number; 
        readyTimer: number;
        opacityState: number;
        difficulty: number;
    } | {
        // Terminal Shape Game
        gameType: "terminalshape";
        Timer: number; 
        readyTimer: number;
        opacityState: number;
        shapeAmount: number;
        sequenceAmount: number;
        answerAmount: number;
    };

/**
 * For the Needle Minigame:
 * @property {string} gameType - "needle".
 * @property {number} GreenWidth - The width of the green zone (typically between 25-90).
 * @property {number} Timer - The countdown timer for the minigame in seconds.
 * @property {number} Difficulty - The difficulty level (1-5, with 5 being the hardest).
 * @property {number} opacityState - 1 for start showing, 0 for start hiding.
 * 
 * For the Pipe Minigame:
 * @property {string} gameType - "pipe".
 * @property {number} TileWidth - The width of the tiles in the game.
 * @property {number} TileHeight - The height of the tiles in the game.
 * @property {number} Timer - The countdown timer for the minigame in seconds.
 * @property {number} readyTimer - The countdown timer for the minigame start in seconds.
 * @property {number} opacityState - 1 for start showing, 0 for start hiding.
 * 
 * For the Arrow Minigame:
 * @property {string} gameType - "arrow".
 * @property {number} TileWidth - The width of the tiles in the game. (10 is max)
 * @property {number} TileHeight - The height of the tiles in the game. (4 is max)
 * @property {number} readyTimer - The countdown timer for the minigame start in seconds.
 * @property {number} Timer - The countdown timer for the minigame in seconds.
 * @property {number} opacityState - 1 for start showing, 0 for start hiding.
 * @property {number} difficulty - 2 for 2x2 etc (min is 2, max is 4)
 * 
 * For the Shape Terminal Minigame:
 * @property {string} gameType - "arrow".
 * @property {number} Timer - The countdown timer for the minigame in seconds.
 * @property {number} readyTimer - The countdown timer for the minigame start in seconds.
 * @property {number} opacityState - 1 for start showing, 0 for start hiding.
 * @property {number} shapeAmount - amount of shapes per sequence (min is 2, max is 6)
 * @property {number} sequenceAmount - amount of sequences, (min is 2, max is 5)
 * @property {number} answerAmount - amount of answers to succeed (cant exceed the amount of sequenceAmount x shapeAmount)
 */
export interface MinigamesState {
    hidden: boolean;
    currentMinigame: MinigameState | null;
}

const initialState: MinigamesState = {
    hidden: true,
    currentMinigame: null,
    // hidden: false,
    // currentMinigame: {
    //     gameType: "pipe",
    //     Timer: 120,
    //     TileWidth: 8,
    //     TileHeight: 4,
    //     readyTimer: 5,
    //     opacityState: 1,
    //     //difficulty: 2,
    //     //shapeAmount: 2,
    //     //sequenceAmount: 3,
    //     //answerAmount: 5,
    // },
};

const gamesReducer = createSlice({
    name: "gamesReducer",
    initialState,
    reducers: {
        /**
         * Sets The Current Minigame to Show
         * @object {object} currentMinigame - the object that holds the minigame data
         */
        SET_MINIGAME: (state, action: PayloadAction<MinigameState>) => {
            state.hidden = false;
            state.currentMinigame = action.payload;
            state.currentMinigame.opacityState = 1;
        },
        

        
        /**
         * Starts the "shutdown of the minigame"
         * @HIDE_MINIGAME(); no need for data
        */
        HIDE_MINIGAME: (state) => {
            if (state.currentMinigame) {
                //console.log("Hiding Game");
                state.currentMinigame.opacityState = 0;
            }
        },

         /**
         * Ending Of The Minigame hides everything including the window etc, should not be called before HIDE_MINIGAME()
         * @END_MINIGAME(); no need for data
         */
        END_MINIGAME: (state) => {
            //console.log("Ending Minigame");
            state.hidden = true;
            state.currentMinigame = null;
        },
    },
});

export const { SET_MINIGAME, END_MINIGAME, HIDE_MINIGAME } = gamesReducer.actions;
export default gamesReducer.reducer;
