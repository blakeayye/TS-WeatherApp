import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

import useSound from '../../hooks/useSound';

interface PipeData {
    name: string;
    polygon: string;
    sides: string[]; // Sides the pipe connects to: ['Top', 'Right', 'Bottom', 'Left']
}

const pipesData: PipeData[] = [
    {
        name: 'TopRight',
        polygon: 'polygon(45% 0, 55% 0, 55% 45%, 100% 45%, 100% 55%, 45% 55%)',
        sides: ['Top', 'Right'],
    },
    {
        name: 'TopLeft',
        polygon: 'polygon(55% 0, 45% 0, 45% 45%, 0 45%, 0 55%, 55% 55%)',
        sides: ['Top', 'Left'],
    },
    {
        name: 'BottomRight',
        polygon: 'polygon(55% 100%, 45% 100%, 45% 45%, 100% 45%, 100% 55%, 55% 55%)',
        sides: ['Bottom', 'Right'],
    },
    {
        name: 'BottomLeft',
        polygon: 'polygon(45% 100%, 55% 100%, 55% 45%, 0 45%, 0 55%, 45% 55%)',
        sides: ['Bottom', 'Left'],
    },
    {
        name: 'Horizontal',
        polygon: 'polygon(0 45%, 100% 45%, 100% 55%, 0 55%)',
        sides: ['Left', 'Right'],
    },
    {
        name: 'Vertical',
        polygon: 'polygon(45% 100%, 45% 0, 55% 0, 55% 100%)',
        sides: ['Top', 'Bottom'],
    },
    {
        name: 'End',
        polygon: 'polygon(45% 0, 55% 0, 55% 25%, 85% 25%, 85% 75%, 25% 75%, 25% 55%, 0 55%, 0 45%, 25% 45%, 25% 25%, 45% 25%)',
        sides: ['Left', 'Top'],
    }
];

const rotationMapping: Record<string, { name: string; sides: string[] }> = {
    TopLeft: {
        name: 'TopRight',
        sides: ['Top', 'Right'],
    },
    TopRight: {
        name: 'BottomRight',
        sides: ['Right', 'Bottom'],
    },
    BottomRight: {
        name: 'BottomLeft',
        sides: ['Bottom', 'Left'],
    },
    BottomLeft: {
        name: 'TopLeft',
        sides: ['Left', 'Top'],
    },
    Horizontal: {
        name: 'Vertical',
        sides: ['Top', 'Bottom'],
    },
    Vertical: {
        name: 'Horizontal',
        sides: ['Left', 'Right'],
    },
    End: {
        name: 'End',
        sides: ['Left', 'Top'],
    },
};

interface RecordPipeData {
    name: string;
    sides: string[];
    connected: boolean;
}

interface PipeSlotProps {
    slotNumber: number;
    pipeArrayData: Record<number, RecordPipeData>;
    setPipeArrayData: (slot: number, connected: boolean, name: string, sides: string[]) => void;
    isConnected: boolean;
    gameState: number;
}

/**
* Pipe Slot handles each slot for the pipe game
* @state {number} slotNumber - the slot id
* @state {table} pipeArrayData - Holds all the data for the pipes and slots
* @state {object} setPipeArrayData - sets the pipe slot data
* @state {boolean} isConnected - Is connected dont touch.
*/
const PipeSlot: React.FC<PipeSlotProps> = ({ slotNumber, pipeArrayData, setPipeArrayData, isConnected, gameState}) => {
    const reducerData = useSelector((state: RootState) => state.games);
    const minigameData = reducerData?.currentMinigame;
   
    const pipeData = pipeArrayData[slotNumber];

    const [rotation, setRotation] = useState(0);

    if (minigameData?.gameType !== "pipe") {
        return null;
    }
    const [updatePipe, setupdatePipe] = useState(true);

    const soundEffect = useSound();

    const handleClick = () => {
        if (slotNumber === totalSlots || gameState !== 1) return null;
        soundEffect('click2');

        setRotation((prevRotation) => {
            const newRotation = prevRotation + 90; 
           
            return newRotation;
        });

        getSidesByRotation(); 
    };

    const tileWidth = minigameData?.TileWidth;
    const tileHeight = minigameData?.TileHeight;

    const totalSlots = tileWidth * tileHeight;

    const getNeighbors = (slot: number) => {
        const isLeftEdge = (slot % tileWidth) === 1;
        const isRightEdge = (slot % tileWidth) === 0;
        const isTopEdge = slot <= tileWidth;
        const isBottomEdge = slot > totalSlots - tileWidth;

        return {
            left: isLeftEdge ? null : slot - 1,
            right: isRightEdge ? null : slot + 1,
            top: isTopEdge ? null : slot - tileWidth,
            bottom: isBottomEdge ? null : slot + tileWidth
        };
    };

    const getRequiredSides = (slot: number) => {
        const neighbors = getNeighbors(slot);
        const sides: string[] = [];

        if (neighbors.left) sides.push('Left');
        if (neighbors.right) sides.push('Right');
        if (neighbors.top) sides.push('Top');
        if (neighbors.bottom) sides.push('Bottom');

        return sides;
    };

    const getSidesByRotation = () => {
        if (pipeData) {
            let currentName = pipeData.name;

            if (rotationMapping[currentName]) {
                const newSides = rotationMapping[currentName]?.sides || [];
                const newName = rotationMapping[currentName].name; 

                //console.log(`Rotating: ${currentName} -> ${newName}`, newSides, pipeData.connected);
                setPipeArrayData(slotNumber, pipeData.connected, newName, newSides);
            } else {
                console.error(`No mapping found for ${currentName}`);
            }
        }
    };
    

    const requiredSides = useMemo(() => getRequiredSides(slotNumber), [slotNumber, tileWidth, tileHeight]);

    const randomPipe = useMemo(() => {
        const pipesWithoutEnd = pipesData.filter(pipe => pipe.name !== "End");
    
        const matchingPipes = pipesWithoutEnd.filter(pipe =>
            requiredSides.every(side => pipe.sides.includes(side))
        );
    
        if (matchingPipes.length === 0) {
            return pipesWithoutEnd[Math.floor(Math.random() * pipesWithoutEnd.length)];
        }
    
        const randomIndex = Math.floor(Math.random() * matchingPipes.length);
        return pipesWithoutEnd[randomIndex];
    }, [requiredSides]);
    

    const pipeToRender = useMemo(() => {
        let selectedPipe;

        if (slotNumber === 1) {
            selectedPipe = pipesData.find(pipe => pipe.name === "TopLeft");
        } else if (slotNumber === totalSlots) {
            selectedPipe = pipesData.find(pipe => pipe.name === "End");
        } else {
            selectedPipe = randomPipe;
        }

        return selectedPipe;
    }, [slotNumber, randomPipe, totalSlots]);

    useEffect(() => {
        if (pipeToRender && updatePipe) {
            setupdatePipe(false);

            setPipeArrayData(slotNumber, false, pipeToRender.name, pipeToRender.sides);

        }
    }, [pipeToRender, slotNumber, setPipeArrayData]);
    
    const boxShadowColor = isConnected ? 'rgba(110, 255, 136, 0.9)' : 'rgba(255, 255, 255, 1)';
    const backgroundColor = isConnected ? 'rgba(86, 245, 128, 0.8)' : 'rgba(156, 156, 156, 0.5)';

    return (
        <div
            onClick={handleClick}
            style={{
                width: "100%",
                height: "100%",
                display:"flex",
                justifyContent: "center",
                alignItems: "center",
                filter: `${isConnected ? `drop-shadow(0 0 0.45vh ${boxShadowColor})` : 'none'}`,
            }}
        >
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    //backgroundColor: 'lightblue',
                    clipPath: typeof pipeToRender === "string" ? undefined : pipeToRender?.polygon,
                    transform: `rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease', 
                    boxShadow: `inset 0 0 5vh ${boxShadowColor}`,
                    backgroundColor: `${backgroundColor}`,
                   
                }}
            >
                {/* Render the pipe name if necessary for debugging */}
                {/* {isConnected && (
                    pipeData?.name
                )} */}
            </div>
        </div>
    );
};

export default PipeSlot;
