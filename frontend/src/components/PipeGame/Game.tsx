
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import { fetchNui } from "../../utils/fetchNui";
import { RootState } from "../../store";
import { isEnvBrowser } from "../../utils/misc";
import { END_MINIGAME, HIDE_MINIGAME } from "../../reducers/gamesReducer";

import useSound from '../../hooks/useSound';

import RectangleProgressBar from "../GlobalComponents/RectangleProgressBar";
import PipeSlot from "./PipeSlot";

interface RecordPipeData {
    name: string;
    sides: string[];
    connected: boolean;
    stopLoop: boolean;
}

interface OppositeSides {
    Top: string;
    Bottom: string;
    Left: string;
    Right: string;
}

const oppositeSides: OppositeSides = {
    Top: 'Bottom',
    Bottom: 'Top',
    Left: 'Right',
    Right: 'Left',
};

/**
* Pipe Game that makes you align pipes to win
* You Need to set the minigame data before using (This Minigame Uses The parameters below)
* @state {boolean} hidden - Set to false to show the minigame
* @object {object} currentMinigame - the object that holds the minigame data
* @state {string} currentMinigame.gameType - The type of the minigame currently active (e.g., "pipe").
* @state {number} currentMinigame.TileWidth - The amount of tiles Wide the game should be (8 is fine).
* @state {number} currentMinigame.TileHeight - The amount of tiles Tall the game should be (4 is fine).
* @state {number} currentMinigame.Timer - The countdown timer for the minigame in seconds.
* @state {number} currentMinigame.readyTimer - The countdown timer for the get ready timer in seconds.
* @state {number} currentMinigame.opacityState - 1 for start showing, 0 for start hiding.
*/
const PipeGame: React.FC = () => {
    const reducerData = useSelector((state: RootState) => state.games);
    const minigameData = reducerData?.currentMinigame;

    if (minigameData?.gameType !== "pipe") {
        return null;
    }
    
    const [hasSucceeded, setHasSucceeded] = useState(false); 

    const soundEffect = useSound();
    
    const isShowing = !reducerData?.hidden;
    const tileWidth = minigameData?.TileWidth;
    const tileHeight = minigameData?.TileHeight;
    const opacityState = minigameData?.opacityState;
    
    const [isFinished, setisFinished] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(minigameData?.Timer);
    const [readytimeRemaining, setreadyTimeRemaining] = useState(minigameData?.readyTimer);

    const [gameState, setgameState] = useState(0)

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const dispatch = useDispatch();
    
    const [pipeData, setPipeArray] = useState<Record<number, RecordPipeData>>({});

    const setPipeData = (slot: number, connected: boolean, name: string, sides: string[]) => {
        setPipeArray((prevData) => ({
            ...prevData,
            [slot]: { connected, name, sides, stopLoop: false }
        }));
    };

    const updateGameState = useCallback((nextState: number) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setgameState(nextState);
    }, []);

    const finishGame = (didWin: boolean) => {
        if (isShowing && !isFinished) {
            //console.log("didWin", didWin);
            setisFinished(true)
            setTimeout(async() => {
                if (!isEnvBrowser()) {
                    await fetchNui("PipeGame:Finished", didWin);

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
    
    const totalSlots = tileWidth * tileHeight;
    
    const getNeighbors = (slot: number, sides: string[]) => {
        const isLeftEdge = (slot % tileWidth) === 1;
        const isRightEdge = (slot % tileWidth) === 0;
        const isTopEdge = slot <= tileWidth;
        const isBottomEdge = slot > totalSlots - tileWidth;
    
        const neighbors: { [key: string]: number | null } = {};
    
        if (sides.includes('Left')) {
            neighbors.Left = isLeftEdge ? null : slot - 1; // Check the left neighbor
        }
        if (sides.includes('Right')) {
            neighbors.Right = isRightEdge ? null : slot + 1; // Check the right neighbor
        }
        if (sides.includes('Top')) {
            neighbors.Top = isTopEdge ? null : slot - tileWidth; // Check the top neighbor
        }
        if (sides.includes('Bottom')) {
            neighbors.Bottom = isBottomEdge ? null : slot + tileWidth; // Check the bottom neighbor
        }
    
        return neighbors;
    };
    

    const getConnectedPipes = (slotNumber: number = 0): boolean => {
        const currentPipe = pipeData[slotNumber];
    
        if (!currentPipe) return false;
    
        if (currentPipe.stopLoop) return false;

        currentPipe.stopLoop = true;

        if (slotNumber === 1) {
            currentPipe.connected = true;
            currentPipe.stopLoop = false;
            return true;
        }
        
        const neighbors = getNeighbors(slotNumber, currentPipe.sides);

        let hasValidConnection = false;
    
        Object.entries(neighbors).forEach(([direction, neighbor]) => {
            if (neighbor !== null) {
                const neighborData = pipeData[neighbor];
    
                if (neighborData) {
                    const oppositeSide = oppositeSides[direction as keyof OppositeSides];
    
                    if (neighborData.sides.includes(oppositeSide)) {
                        const neighborConnected = getConnectedPipes(neighbor);
    
                        if (neighborConnected) {
                            hasValidConnection = true;
                            currentPipe.connected = true;
                            if (slotNumber === totalSlots  && !hasSucceeded) {
                                setHasSucceeded(true);
                                setreadyTimeRemaining(minigameData?.readyTimer);
                                updateGameState(3);
                                soundEffect('positive');
                            };
                        } else {
                            currentPipe.connected = false;
                        }
                    } else {
                        currentPipe.connected = false;
                    }
                }
            }
        });
    
        if (!hasValidConnection) {
            currentPipe.connected = false;
        }
    
        currentPipe.stopLoop = false;
    
        return hasValidConnection;
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
                    minWidth: "50vw",
                    alignItems: "center",
                    //marginBottom: "5%",
                    backgroundColor: "rgba(12, 20, 26, 0.9)",
                    borderRadius: "0.5vh",
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
                        : gameState === 1 ? "Connect Pipes" 
                        : gameState === 2 ? "FAIL" 
                        : gameState === 3 ? "SUCCESS" 
                        : "GET READY"
                    }
                </div>

                {/* Grid Here */}
                <div 
                    style={{
                        gridTemplateColumns: `repeat(${tileWidth}, 1fr)`,
                        gridTemplateRows: `repeat(${tileHeight}, 1fr)`,
                        display: 'grid',
                        gap: 0,
                        width: "100%",
                        height: "auto",
                        justifyContent: "center",
                        //backgroundColor: "yellow",
                    }}
                >
                    {[...Array(totalSlots).keys()].map((value) => {
						return (
							<div 
                                key={value}
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: "auto",
                                    height: "auto",
                                    aspectRatio: '1 / 1',
                                    //backgroundColor: "rgba(51, 51, 51, 0.9)",
                                    //background: 'radial-gradient(circle at center, rgba(51, 51, 51, 0.9) 5%, rgba(10, 14, 18, 0.7) 80%)',
                                    //boxShadow: `inset 0 0 4vh rgba(0, 0, 0, 0.7)`, 
                                    //backgroundColor: "rgba(0, 0, 0, 0.5)",
                                    //borderRadius: "0.5vh",
                                    border: `0.1vh solid rgba(138, 138, 138, 0.7)`,
                                    padding: 0,
                                    margin: 0,
                                    flexDirection: "column",
                                    overflow: "hidden",
                                    fontWeight: 600,
                                    fontSize: "1vh",
                                    cursor: 'pointer',
                                }}
                            >
                                {   
                                    <PipeSlot
                                      slotNumber = {value + 1}
                                      pipeArrayData={pipeData}
                                      setPipeArrayData={setPipeData}
                                      isConnected={getConnectedPipes(value + 1)}
                                      gameState={gameState}
                                    />
                                }
                            </div>
                        );
                    })}
                </div>
                
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
                    Rotate the pipes and connect them to the finish tile
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
                            fillColor="rgba(86, 245, 128, 0.9)"
                        />
                    ) : gameState === 1 ? (
                        <RectangleProgressBar 
                            filledAmount={timeRemaining} 
                            totalAmount={minigameData?.Timer} 
                            bgColor="rgba(168, 168, 168, 0.5)"
                            fillColor="rgba(86, 245, 128, 0.9)"
                        />
                    ) : (
                        <RectangleProgressBar 
                            filledAmount={readytimeRemaining} 
                            totalAmount={minigameData?.readyTimer} 
                            bgColor="rgba(168, 168, 168, 0.5)"
                            fillColor="rgba(86, 245, 128, 0.9)"
                        />
                    )}
                   

                </div>

            </div>

        </div>
    );
};


export default PipeGame;
