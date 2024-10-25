// src/AppHandler.tsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState } from "../store";
import { debugData } from "../utils/debugData";
import { isEnvBrowser } from "../utils/misc";
import { useNuiEvent } from "../hooks/useNuiEvent";
import { MinigamesState, SET_MINIGAME, HIDE_MINIGAME, END_MINIGAME } from "../reducers/gamesReducer";

// Games
import NeedleGame from "./NeedleGame/Game";
import PipeGame from "./PipeGame/Game";
import ArrowGame from "./ArrowGame/Game";
import TerminalShapeGame from "./TerminalShapeGame/Game";

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/pro-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

library.add(fab, fas);


// WE DONT USE
// This will set the NUI to visible if we are
// developing in browser
// debugData(
//     [
//         {
//             action: "setVisible",
//             data: true,
//         },
//     ],
// );

// NEEDLE GAME
// debugData(
//     [
//       {
//         action: 'SET_MINIGAME',
//         data: {
//             currentMinigame: {
//                 gameType: "needle",
//                 GreenWidth: 50,
//                 Timer: 10,
//                 Difficulty: 5,
//             },
//         },
//       },
//     ],
//     2000
// );

// PIPE GAME
// debugData(
//     [
//       {
//         action: 'SET_MINIGAME',
//         data: {
//             currentMinigame: {
//                 gameType: "pipe",
//                 TileWidth: 8,
//                 TileHeight: 4,
//                 Timer: 30,
//                 readyTimer: 3
//             },
//         },
//       },
//     ],
//     2000
// );

// ARROW GAME
// debugData(
//     [
//       {
//         action: 'SET_MINIGAME',
//         data: {
//             currentMinigame: {
//                 gameType: "arrow",
//                 TileWidth: 6,
//                 TileHeight: 5,
//                 Timer: 30,
//                 readyTimer: 5,
//                 opacityState: 1,
//                 difficulty: 2
//             },
//         },
//       },
//     ],
//     2000
// );

// TERMINAL GAME
// debugData(
//     [
//       {
//         action: 'SET_MINIGAME',
//         data: {
//             currentMinigame: {
//                 gameType: "terminalshape",
//                 Timer: 50,
//                 readyTimer: 5,
//                 opacityState: 1,
//                 shapeAmount: 2,
//                 sequenceAmount: 3,
//                 answerAmount: 5,
//             },
//         },
//       },
//     ],
//     2000
// );

const AppHandler: React.FC = () => {
    const minigamesData = useSelector((state: RootState) => state.games);
    const dispatch = useDispatch();

    useNuiEvent('SET_MINIGAME', (data: MinigamesState) => {
        //console.log(data.currentMinigame);
        if (data.currentMinigame) {
            dispatch(
                SET_MINIGAME({
                    ...data.currentMinigame
                })
            );
        }
    });

    useNuiEvent('END_MINIGAME', () => {
        if (minigamesData.currentMinigame) {
            dispatch(
                HIDE_MINIGAME()
            );

            setTimeout(() => {
                dispatch(END_MINIGAME());
            }, 500);
        }
    });

    if (!minigamesData?.currentMinigame || minigamesData.hidden) {
        //console.log("Minigames Is Hidden");
        return null; 
    }

    //console.log("Minigames Is NOT Hidden", minigamesData);
    
    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                backgroundColor: isEnvBrowser() ? "gray" : "transparent",
                overflow: "hidden",
            }}
        >
            {minigamesData?.currentMinigame?.gameType === "needle" ? (
                <NeedleGame/>
            ) : minigamesData?.currentMinigame?.gameType === "pipe" ? (
                <PipeGame/>
            ) : minigamesData?.currentMinigame?.gameType === "arrow" ? (
                <ArrowGame/>
            ) : minigamesData?.currentMinigame?.gameType === "terminalshape" ? (
                <TerminalShapeGame/>
            ) : (
               <></>
            )}

        </div>
    );
};

export default AppHandler;
