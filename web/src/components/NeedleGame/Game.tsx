import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import HalfCircle from "../GlobalComponents/HalfCircle";
import { fetchNui } from "../../utils/fetchNui";
import { RootState } from "../../store";
import { isEnvBrowser } from "../../utils/misc";
import { END_MINIGAME, HIDE_MINIGAME } from "../../reducers/gamesReducer";

/**
* Needle Game that rocks back and forth
* You Need to set the minigame data before using (This Minigame Uses The parameters below)
* @state {boolean} hidden - Set to false to show the minigame
* @object {object} currentMinigame - the object that holds the minigame data
* @state {string} currentMinigame.gameType - The type of the minigame currently active (e.g., "needle").
* @state {number} currentMinigame.GreenWidth - The width of the green zone in the minigame (typically between 25-90).
* @state {number} currentMinigame.Timer - The countdown timer for the minigame in seconds.
* @state {number} currentMinigame.Difficulty - The difficulty of the game 1-5.
*/
const NeedleGame: React.FC = () => {
    const reducerData = useSelector((state: RootState) => state.games);
    const minigameData = reducerData?.currentMinigame;

    if (minigameData?.gameType !== "needle") {
        return null;
    }

    const isShowing = !reducerData?.hidden;
    const greenZoneWidth = minigameData?.GreenWidth;
    
    const [angle, setAngle] = useState(0);
    const [direction, setDirection] = useState(() => (Math.random() > 0.5 ? 1 : -1));
    const [speed, setSpeed] = useState(1);
    const [isFinished, setisFinished] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(minigameData?.Timer);
    const opacityState = minigameData?.opacityState;

    const [eButtonColor, setEButtonColor] = useState("rgba(0, 0, 0, 0.5)");
    const [qButtonColor, setQButtonColor] = useState("rgba(0, 0, 0, 0.5)");

    const dispatch = useDispatch();
    
    const finishGame = (didWin: boolean, whichSide: string) => {
        if (isShowing && !isFinished) {
            console.log("didWin", didWin, whichSide);
            setisFinished(true)
            setTimeout(async() => {
                if (!isEnvBrowser()) {
                    await fetchNui("NeedleGame:Finished", didWin, whichSide);
                } else {
                    dispatch(
                        HIDE_MINIGAME()
                    );
        
                    setTimeout(() => {
                        dispatch(END_MINIGAME());
                    }, 500);
                }
            }, 0);
        }
    };

    const checkResult = () => {
        const normalizedAngle = (angle + 360) % 360;
        const withinGreenZone = normalizedAngle >= (360 - greenZoneWidth) || normalizedAngle <= greenZoneWidth;
    
        if (normalizedAngle <= greenZoneWidth) {
            finishGame(withinGreenZone, "right");
        } else if (normalizedAngle >= (360 - greenZoneWidth)) {
            finishGame(withinGreenZone, "left"); 
        } else {
            finishGame(false, "none");
        }
    };
    
    // Timer and Angle of needle
    useEffect(() => {
        let needleInterval: NodeJS.Timeout | undefined;
        let countdownInterval: NodeJS.Timeout | undefined;

        if (isShowing) {
            clearInterval(needleInterval);
            clearInterval(countdownInterval);

            needleInterval = setInterval(() => {
                setAngle((prev) => {
                    const newAngle = prev + direction * speed;
                    return newAngle;
                });
            }, 100);

            countdownInterval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 0.1) {
                        clearInterval(countdownInterval);
                        clearInterval(needleInterval);
                        checkResult();
                        return 0;
                    }

                    const difficultyFactor = (minigameData?.Timer - prev) / minigameData?.Timer;
                    setSpeed(1 + difficultyFactor * 2 * minigameData?.Difficulty); 
                    return prev - 0.1;
                });
            }, 100);
        }

        return () => {
            if (needleInterval) clearInterval(needleInterval);
            if (countdownInterval) clearInterval(countdownInterval);
        };
    }, [isShowing, direction, speed]);

    // Checks if you left green area
    useEffect(() => {
        if (angle <= -(greenZoneWidth / 2)) {
            finishGame(false, "left");
        } else if (angle >= (greenZoneWidth / 2)) {
            finishGame(false, "right");
        }
    }, [angle]); 

    // Key events
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!isShowing) return;

            if (event.key === "e") {
                setEButtonColor("rgba(20, 34, 51, 0.8)");
            } else if (event.key === "q") {
                setQButtonColor("rgba(20, 34, 51, 0.8)");
            }
        };

        const handleKeyRelease = (event: KeyboardEvent) => {
            if (!isShowing) return;

            if (event.key === "e") {
                setAngle((prev) => prev + 2);
                setDirection(1)
                setEButtonColor("rgba(0, 0, 0, 0.5)");
            } else if (event.key === "q") {
                setAngle((prev) => prev - 2);
                setDirection(-1)
                setQButtonColor("rgba(0, 0, 0, 0.5)");
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        window.addEventListener("keyup", handleKeyRelease);

        return () => {
            window.removeEventListener("keydown", handleKeyPress);
            window.removeEventListener("keyup", handleKeyRelease);
        };
    }, [isShowing]);

    // speed and direction
    useEffect(() => {
        let computerInterval: NodeJS.Timeout | undefined;

        if (isShowing) {
            computerInterval = setInterval(() => {
                const difficultyFactor = (minigameData?.Timer - timeRemaining) / minigameData?.Timer;
                const randomDirectionChange = Math.random();
                const randomSpeedChange = Math.random();

              
                if (randomDirectionChange > 0.75 - difficultyFactor * 0.5) { 
                    setDirection((prev) => (Math.random() > 0.5 ? 1 : -1));
                }

                if (randomSpeedChange > 0.5 - difficultyFactor * 0.3) { 
                    setSpeed(Math.random() * 1.5 + 1 + difficultyFactor * 2 * minigameData?.Difficulty);
                }
            }, 1000);
        }

        return () => {
            if (computerInterval) clearInterval(computerInterval);
        };
    }, [isShowing]);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
                opacity: opacityState,
                transition: `opacity ${opacityState === 1 ? "1.0s" : "0.5s"} ease`,
            }}
        >
            {/* Q BUTTON LEFT */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "2.5vh",
                    height: "2.5vh",
                    color: "white",
                    textAlign: "center",
                    fontWeight: 500,
                    fontSize: "1.5vh",
                    fontFamily: "Exo",
                    backgroundColor: qButtonColor,
                    transition: "background-color 0.2s ease",
                    borderRadius: "0.5vh",
                    boxShadow: `inset 0 0 1.5vh ${qButtonColor}`,
                    marginBottom: "5%",
                }}
            >
                Q
            </div>

            <div
                style={{
                    textAlign: "center",
                    position: "relative",
                    width: "10%",
                    height: "10%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "5%",
                }}
            >
                <HalfCircle greenWidth={greenZoneWidth} />

                {/* NEEDLE AND CIRCLE */}
                <div
                    style={{
                        width: "0.15vh",
                        height: "90%",
                        backgroundColor: "rgba(191, 232, 135, 0.8)",
                        position: "absolute",
                        bottom: "10%",
                        left: "50%",
                        transform: `translateX(-50%) rotate(${angle}deg)`,
                        transformOrigin: "bottom",
                        transition: "transform 0.1s ease",
                    }}
                >
                    <div
                        style={{
                            width: "1.0vh",
                            height: "1.0vh",
                            backgroundColor: "transparent",
                            border: "0.25vh solid rgba(191, 232, 135, 0.8)",
                            borderRadius: "50%",
                            position: "absolute",
                            top: "-1.25vh",
                            left: "50%",
                            transform: "translateX(-50%)",
                        }}
                    />
                </div>
            </div>

            {/* E BUTTON RIGHT */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "2.5vh",
                    height: "2.5vh",
                    backgroundColor: eButtonColor,
                    color: "white",
                    textAlign: "center",
                    fontWeight: 500,
                    fontSize: "1.5vh",
                    fontFamily: "Exo",
                    transition: "background-color 0.2s ease",
                    borderRadius: "0.5vh",
                    boxShadow: `inset 0 0 1.5vh ${eButtonColor}`,
                    marginBottom: "5%",
                }}
            >
                E
            </div>
        </div>
    );
};


export default NeedleGame;
