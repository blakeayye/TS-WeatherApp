
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import { fetchNui } from "../../utils/fetchNui";
import { RootState } from "../../store";
import { isEnvBrowser } from "../../utils/misc";
import { END_MINIGAME, HIDE_MINIGAME } from "../../reducers/gamesReducer";

import useSound from '../../hooks/useSound';

import RectangleProgressBar from "../GlobalComponents/RectangleProgressBar";

import FeedHandler from "./FeedHandler";

/**
* Arrow Game that makes you direct the arrows to the end
* You Need to set the minigame data before using (This Minigame Uses The parameters below)
* @state {boolean} hidden - Set to false to show the minigame
* @object {object} currentMinigame - the object that holds the minigame data
* @state {string} currentMinigame.gameType - The type of the minigame currently active (e.g., "terminalshape").
* @state {number} currentMinigame.Timer - The countdown timer for the minigame in seconds.
* @state {number} currentMinigame.readyTimer - The countdown timer for the get ready timer in seconds.
* @state {number} currentMinigame.opacityState - 1 for start showing, 0 for start hiding.
* @state {number} currentMinigame.shapeAmount - amount of shapes per sequence (min is 2, max is 6)
* @state {number} currentMinigame.sequenceAmount - amount of sequences, (min is 2, max is 5)
* @state {number} currentMinigame.answerAmount - amount of answers to succeed
*/
const TerminalShape: React.FC = () => {
    const reducerData = useSelector((state: RootState) => state.games);
    const minigameData = reducerData?.currentMinigame;

    if (minigameData?.gameType !== "terminalshape") {
        return null;
    }

    const soundEffect = useSound();
    
    const isShowing = !reducerData?.hidden;
    const opacityState = minigameData?.opacityState;
    
    const [isFinished, setisFinished] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(minigameData?.Timer);
    const [readytimeRemaining, setreadyTimeRemaining] = useState(minigameData?.readyTimer);

    const [gameState, setgameState] = useState(0)

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const dispatch = useDispatch();

    const updateGameState = useCallback((nextState: number) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setgameState(nextState);
    }, []);

    const onFinishFromClick = (didWin: boolean) => {
        setreadyTimeRemaining(minigameData?.readyTimer);
        updateGameState(didWin ? 3 : 2);
        soundEffect(didWin ? 'positive' : 'negative');
    };
    
    const finishGame = (didWin: boolean) => {
        if (isShowing && !isFinished) {
            //console.log("didWin", didWin);
            setisFinished(true)
            setTimeout(async() => {
                if (!isEnvBrowser()) {
                    await fetchNui("TerminalGame:Finished", didWin);

                    dispatch(HIDE_MINIGAME());
                    
                    setTimeout(() => {
                        dispatch(END_MINIGAME());
                    }, 500);
                } else {
                    dispatch(HIDE_MINIGAME());

                    setTimeout(() => {
                        dispatch(END_MINIGAME());
                    }, 500);
                }
            }, 0);
        }
    };

    useEffect(() => {
        if (gameState === 0) {
            intervalRef.current = setInterval(() => {
                setreadyTimeRemaining((prev) => {
                    if (prev <= 0) {
                        updateGameState(1);
                        return 0;
                    }
                    return Math.max(prev - 0.1, 0);
                });
            }, 100);
        } else if (gameState === 1) {
            intervalRef.current = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 0) {
                        soundEffect('negative');
                        updateGameState(2); 
                        setreadyTimeRemaining(minigameData?.readyTimer);
                        return 0;
                    }
                    return Math.max(prev - 0.1, 0);
                });
            }, 100);
        } else if (gameState === 2 || gameState === 3) {
            intervalRef.current = setInterval(() => {
                setreadyTimeRemaining((prev) => {
                    if (prev <= 0) {
                        finishGame(gameState === 3);
                        return 0;
                    }
                    return Math.max(prev - 0.1, 0);
                });
            }, 100);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [gameState, minigameData]);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: opacityState,
                transition: `opacity ${opacityState === 1 ? "1.0s" : "0.5s"} ease`,
                userSelect: 'none',
                WebkitUserSelect: 'none',
            }}
        >
            <div
                style={{
                    textAlign: "center",
                    position: "relative",
                    width: "auto",
                    height: "auto",
                    display: "flex",
                    justifyContent: "center",
                    minHeight: "60vh",
                    minWidth: "40vw",
                    alignItems: "center",
                    //marginBottom: "5%",
                    backgroundColor: "rgba(12, 20, 26, 0.9)",
                    borderRadius: "1vh",
                    // top right bottom left
                    padding: "2vh 5vh 4vh 5vh",
                    flexDirection: "column",
                }}
            >   

                {/* Above Text */}
                <div 
                    style={{
                        width: "100%",
                        height: "10%",
                        //backgroundColor: "orange",
                        fontWeight: 500,
                        fontSize: "4vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingTop: "2vh",
                        paddingBottom: "2vh",
                        color: "white",
                        fontFamily: "Exo",
                    }}
                >  
                    {
                        gameState === 0 ? "GET READY" 
                        : gameState === 1 ? "Terminal Input" 
                        : gameState === 2 ? "SECURITY BREACH" 
                        : gameState === 3 ? "TERMINAL ACCESS SUCCESS" 
                        : "GET READY"
                    }
                </div>
                
                {/* Feed Handler */}
                <FeedHandler
                    gameState={gameState}
                    onFinish={onFinishFromClick} 
                />

                {/* What To Do Here */}
                <div 
                    style={{
                        width: "100%",
                        height: "10%",
                        //backgroundColor: "orange",
                        fontWeight: 500,
                        fontSize: "1.5vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingTop: "2vh",
                        paddingBottom: "2vh",
                        color: "white",
                        fontFamily: "Exo",
                    }}
                >
                    Memorize the shapes & colors of each sequence.
                </div>
                
                {/* Reverse Progress Bar Here */}
                <div 
                    style={{
                        width: "100%",
                        height: "auto",
                        //backgroundColor: "orange",
                        fontWeight: 500,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        //paddingTop: "2vh",
                        
                        color: "white",
                        fontFamily: "Exo",
                        padding: 0,
                    }}
                >

                    {gameState === 0 ? (
                        <RectangleProgressBar 
                            filledAmount={readytimeRemaining} 
                            totalAmount={minigameData?.readyTimer} 
                            bgColor="rgba(168, 168, 168, 0.5)"
                            fillColor="rgba(10, 115, 207, 1)"
                        />
                    ) : gameState === 1 ? (
                        <RectangleProgressBar 
                            filledAmount={timeRemaining} 
                            totalAmount={minigameData?.Timer} 
                            bgColor="rgba(168, 168, 168, 0.5)"
                            fillColor="rgba(10, 115, 207, 1)"
                        />
                    ) : (
                        <RectangleProgressBar 
                            filledAmount={readytimeRemaining} 
                            totalAmount={minigameData?.readyTimer} 
                            bgColor="rgba(168, 168, 168, 0.5)"
                            fillColor="rgba(10, 115, 207, 1)"
                        />
                    )}
                   

                </div>

            </div>

        </div>
    );
};


export default TerminalShape;
