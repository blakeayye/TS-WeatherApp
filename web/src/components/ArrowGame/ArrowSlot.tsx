import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

import useSound from '../../hooks/useSound';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

import DownArrow from '/src/assets/svgs/ArrowDown.svg';

type ArrowDirection = 'left' | 'right' | 'up' | 'down'; 

interface ArrowSlotProps {
    gameState: number,
    slotNumber: number,
    isActive: boolean,
    arrowDirection: ArrowDirection; // Ensure this matches your expected values
    arrowKey: number,
    onClick: (slotNumber: number, directionKey: number) => void; 
}

/**
* The specific slot in each of the larger slots inside of the grid
* Just shows the svg as well as click specific
* @state {number} gameState - state of the game to prevent pre clicking
* @state {number} slotNumber - the parent slot number
* @state {boolean} isActive - if the parent slot is active to allow clickable
* @state {string} arrowDirection - direction of the arrow, left, right, up or down
* @state {number} arrowKey - used to find which slot the buttonw as pressed in
* @function onClick - pass the slotNumber and the arrowKey variables
*/
const ArrowSlot: React.FC<ArrowSlotProps> = ({ gameState, slotNumber, isActive, arrowDirection, arrowKey, onClick }) => {
    const reducerData = useSelector((state: RootState) => state.games);
    const minigameData = reducerData?.currentMinigame;

    if (minigameData?.gameType !== "arrow") {
        return null;
    }

    const difficulty = minigameData?.difficulty;
    
    const soundEffect = useSound();
    
    const [isClicked, setisClicked] = useState(false)

    const clickEvent = () => {
        //console.log(slotNumber, isActive);
        if (!isActive || gameState !== 1) return null; 
        //  || gameState !== 1
        setisClicked(true);

        soundEffect('click2');

        onClick(slotNumber, arrowKey);
    };
    
    return (
        <div
            onClick={() => clickEvent()}
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: 'pointer',
                borderRadius: "0.4vh",
                backgroundColor: isClicked ? `rgba(166, 205, 76, 1)` : `rgba(55, 62, 68, 0.9)`,
                filter: isClicked ?  `drop-shadow(0 0 0.25vh rgba(166, 205, 76, 1))` : "none",
            }}
        >
            <div
                style={{
                    width: difficulty === 2 || difficulty === 3 ? "3vh" : "2vh",
                    height: difficulty === 2 || difficulty === 3 ? "3vh" : "2vh",
                }}
            >
                {arrowDirection === 'left' ? (
                    // Left Arrow
                    <DownArrow
                        height= "100%"
                        width= "100%"
                        style={{
                            transform: "rotate(90deg)",
                            color: "white",
                        }}
                    />
                ) : arrowDirection === "right" ? (
                    // Right Arrow
                    <DownArrow
                        height= "100%"
                        width= "100%"
                        style={{
                            transform: "rotate(-90deg)",
                            color: "white",
                        }}
                    />
                ) : arrowDirection === "down" ? (
                    // Down Arrow
                    <DownArrow
                        height= "100%"
                        width= "100%"
                        style={{
                            //transform: "rotate(90deg)",
                            color: "white",
                        }}
                    />
                ) : arrowDirection === "up" ? (
                    // Up Arrow
                    <DownArrow
                        height= "100%"
                        width= "100%"
                        style={{
                            transform: "rotate(180deg)",
                            color: "white",
                        }}
                    />
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
};

export default ArrowSlot;
