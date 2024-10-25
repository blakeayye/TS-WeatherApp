import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import ArrowSlot from './ArrowSlot';

interface ArrowSlotHandlerProps {
    gameState: number;
    onFinish: (didWin: boolean) => void; 
}

type ArrowDirection = 'left' | 'right' | 'up' | 'down'; 

interface DirectionStateInt {
    direction: ArrowDirection;
    isClicked: boolean;
  }
  
interface SlotStateInt {
    isActive: boolean;
    directions: Record<number, DirectionStateInt>;
}

/**
* Handles the grid of all the slots, generates directions and pretty much the whole game
* @state {number} gameState - state of the game to prevent pre clicking
* @function onFinish - pass boolean to trigger the finish of the game, win = true
*/
const ArrowSlotHandler: React.FC<ArrowSlotHandlerProps> = ({gameState, onFinish}) => {
    const reducerData = useSelector((state: RootState) => state.games);
    const minigameData = reducerData?.currentMinigame;

    if (minigameData?.gameType !== "arrow") {
        return null;
    }
  
    const tileWidth = minigameData?.TileWidth;
    const tileHeight = minigameData?.TileHeight;
    const difficulty = minigameData?.difficulty;

    const totalSlots = tileWidth * tileHeight;

    const directions: ArrowDirection[] = ['left', 'right', 'up', 'down'];

    const [slotStates, setSlotStates] = useState<Record<number, { isActive: boolean; directions: Record<number, { direction: ArrowDirection; isClicked: boolean }> }>>({});
      
    useEffect(() => {
        const initialSlotStates: Record<number, { isActive: boolean; directions: Record<number, { direction: ArrowDirection; isClicked: boolean }> }> = {};
    
        // Function to get a random direction, ensuring no more than two duplicates
        const getRandomDirectionWithLimit = (directionCounts: Record<ArrowDirection, number>): ArrowDirection => {
            const availableDirections = directions.filter(dir => directionCounts[dir] < difficulty); // Only allow directions with < 2 occurrences
            return availableDirections[Math.floor(Math.random() * availableDirections.length)];
        };
    
        for (let i = 1; i <= totalSlots; i++) {
            const directionsForSlot: Record<number, { direction: ArrowDirection; isClicked: boolean }> = {};
            const directionCounts: Record<ArrowDirection, number> = { left: 0, right: 0, up: 0, down: 0 }; // Count for each direction
    
            for (let j = 1; j <= difficulty * difficulty; j++) {
                // Ensure first slot has right and down directions
                if (i === 1) {
                    directionsForSlot[j] = {
                        direction: j === 1 ? 'right' : 'down',
                        isClicked: false
                    };
                    directionCounts[directionsForSlot[j].direction]++; // Update count
                }
                // Ensure last slot has a down direction as one of its directions
                else if (i === totalSlots) {
                    directionsForSlot[j] = {
                        direction: j === 1 ? 'down' : getRandomDirectionWithLimit(directionCounts),
                        isClicked: false
                    };
                    directionCounts[directionsForSlot[j].direction]++; // Update count
                }
                // For other slots, randomly assign directions with limited duplicates
                else {
                    directionsForSlot[j] = {
                        direction: getRandomDirectionWithLimit(directionCounts),
                        isClicked: false
                    };
                    directionCounts[directionsForSlot[j].direction]++; // Update count
                }
            }
    
            initialSlotStates[i] = {
                isActive: i === 1,
                directions: directionsForSlot
            };
        }
    
        //console.log("Triggered");
        setSlotStates(initialSlotStates);
    }, []);
    
    const clickEvent = (slotNumber: number, directionKey: number) => {
        const currentSlot = slotStates[slotNumber];

        if (currentSlot.isActive) {
            //console.log("Clicked Active Slot", directionKey, currentSlot.directions[directionKey]);

            const clickedDirection = currentSlot.directions[directionKey];

            if (clickedDirection) {
                let newActiveSlot = slotNumber;

                switch (clickedDirection.direction) {
                    case 'left':
                        newActiveSlot = slotNumber - 1; // Move left
                        break;
                    case 'right':
                        newActiveSlot = slotNumber + 1; // Move right
                        break;
                    case 'up':
                        newActiveSlot = slotNumber - tileWidth; // Move up
                        break;
                    case 'down':
                        newActiveSlot = slotNumber + tileWidth; // Move down
                        break;
                    default:
                        break;
                }

                if (newActiveSlot > 0 && newActiveSlot <= totalSlots) {
                    setSlotStates(prevStates => {
                        const newState = { ...prevStates };

                        newState[newActiveSlot] = {
                            ...newState[newActiveSlot],
                            isActive: true,
                        };

                        newState[slotNumber] = {
                            ...newState[slotNumber],
                            isActive: false,
                            directions: {
                                ...newState[slotNumber].directions,
                                [directionKey]: {
                                    ...newState[slotNumber].directions[directionKey],
                                    isClicked: true
                                }
                            }
                        };
                        //console.log(newState);
                        return newState;
                    });
                }
                //console.log("DIRECTION", slotStates[newActiveSlot]?.directions);
                // If you leave the square fail, if you go into another area already clicked
                if (slotStates[newActiveSlot]?.directions) {
                    if (Object.values(slotStates[newActiveSlot]?.directions || {}).some((direction) => direction?.isClicked)) {
                        onFinish(false);
                        return;
                    } else {
                        // Handles if someone clicks left or right on ends fail
                        const currentRow = Math.floor((slotNumber - 1) / tileWidth);
                        const newRow = Math.floor((newActiveSlot - 1) / tileWidth);
                        
                        if (newActiveSlot > 0 && newActiveSlot <= totalSlots) {
                            if (clickedDirection?.direction === "left" || clickedDirection?.direction === "right") {
                                if (Math.abs(currentRow - newRow) > 0) {
                                    onFinish(false); 
                                    return;
                                };
                            };
                        };
                    };
                } else {
                    if (slotNumber === totalSlots && Object.values(currentSlot.directions).some(directions => directions.direction === 'down')) {
                        onFinish(true);
                        return;
                    } else {
                        //console.log("Fail");
                        onFinish(false);
                        return;
                    }
                };
            }
        }
        
    };

    return (
        <div 
            style={{
                gridTemplateColumns: `repeat(${tileWidth}, 1fr)`,
                gridTemplateRows: `repeat(${tileHeight}, 1fr)`,
                display: 'grid',
                gap: "1.5vh",
                width: "100%",
                height: "auto",
                justifyContent: "center",
            }}
        >
            {[...Array(totalSlots).keys()].map((value) => {
                const slotNumber = value + 1; // Slot numbers are 1-indexed
                return (
                    <div 
                        key={slotNumber}
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "auto",
                            height: "auto",
                            aspectRatio: '1 / 1',
                            padding: 0,
                            margin: 0,
                            flexDirection: "column",
                            overflow: "hidden",
                            fontWeight: 600,
                            fontSize: "1vh",
                            cursor: 'pointer',
                        }}
                    > 
                        <div
                            style={{
                                gridTemplateColumns: `repeat(${difficulty}, 1fr)`,
                                gridTemplateRows: `repeat(${difficulty}, 1fr)`,
                                display: 'grid',
                                gap: "0.6vh",
                                width: "100%",
                                height: "auto",
                                aspectRatio: '1 / 1',
                            }}
                        >
                            {[...Array(difficulty * difficulty).keys()].map((value2) => {
                                return (
                                    <div 
                                        key={value2}
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            width: "100%",
                                            height: "100%",
                                            padding: 0,
                                            margin: 0,
                                            flexDirection: "column",
                                            overflow: "hidden",
                                            fontWeight: 600,
                                            fontSize: "1vh",
                                        }}
                                    > 
                                        <ArrowSlot
                                            gameState={gameState}
                                            slotNumber={slotNumber}
                                            isActive={slotStates[slotNumber]?.isActive}
                                            arrowDirection={slotStates[slotNumber]?.directions[value2 + 1]?.direction} // Pass the direction for value2 + 1
                                            arrowKey={value2 + 1}
                                            onClick={() => clickEvent(slotNumber, value2 + 1)} // Pass slotNumber and value2 + 1
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ArrowSlotHandler;
