import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { isEnvBrowser } from "../../utils/misc";

import useSound from '../../hooks/useSound';

import './FeedInput.css';

import Feed from "./Feed"

type FeedItem = {
    type: 'user' | 'system'; // user = manual input, system = auto-generated
    content: string[];
    key: number;
    text: string;
    color: string,
};

type ColoredShape = {
    shape: string[];
    color: string;
    key: number;
};

type ShapeData = {
    name: string;
    shape: string[];
};

const shapeData: ShapeData[] = [
    {
        name: 'square',
        shape: [
            '#########',
            '#       #',
            '#       #',
            '#       #',
            '#########',
        ],
    },
    {
        name: 'triangle',
        shape: [
            '    #    ',
            '   # #   ',
            '  #   #  ',
            ' #     # ',
            '#########',
        ],
    },
    {
        name: 'hexagon',
        shape: [
            '   ##### ',
            '  #     #',
            ' #       #',
            '  #     #',
            '   ##### ',
        ],
    },
    {
        name: 'diamond',
        shape: [
            '    #    ',
            '   # #   ',
            '  #   #  ',
            '   # #   ',
            '    #    ',
        ],
    },
    {
        name: 'plus',
        shape: [
            '    #    ',
            '    #    ',
            ' ####### ',
            '    #    ',
            '    #    ',
        ],
    },
    {
        name: 'arrow',
        shape: [
            '    #    ',
            '   # #   ',
            '  #   #  ',
            '    #    ',
            '    #    ',
        ],
    },
    {
        name: 'x',
        shape: [
            ' #     # ',
            '  #   #  ',
            '   # #   ',
            '  #   #  ',
            ' #     # ',
        ],
    },
];

const colors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'cyan', 'magenta'];

interface FeedHandler {
    gameState: number;
    onFinish: (didWin: boolean) => void; 
}

type AnswerTable = {
    sequenceNumber: number;
    shapeNumber: number;
    name: string;
    color: string;
};

/**
* Handles the whole game pretty much with inputs and feed
* @state {number} gameState - state of the game to prevent pre clicking
* @function onFinish - pass boolean to trigger the finish of the game, win = true
*/
const FeedHandler: React.FC<FeedHandler> = ({ gameState = 0, onFinish }) => {
    const [input, setInput] = useState<string>('');
    const [feed, setFeed] = useState<FeedItem[]>([]);
    //const [shapesTable, setShapes] = useState<ColoredShape[]>([]);
    const hasRenderedShapesRef = useRef(false);
    const [answeredAmount, setansweredAmount] = useState(0);
    const [answerTable, setanswerTable] = useState<AnswerTable[]>([])
    
    const reducerData = useSelector((state: RootState) => state.games);
    const minigameData = reducerData?.currentMinigame;

    const soundEffect = useSound();

    if (minigameData?.gameType !== "terminalshape") {
        return null;
    }

    useEffect(() => {
        if (!hasRenderedShapesRef.current) {
            generateShapesBasedOnDifficulty(); // Generate shapes on initial render
            hasRenderedShapesRef.current = true; // Prevent future renders
        };

        if (gameState === 1) {
            setInput(''); // Clear Input
            setFeed([]); // Clear Feed
            console.log(answerTable?.[answeredAmount]?.color, answerTable?.[answeredAmount]?.name)
            console.log(answerTable);
            setTimeout(() => {
                setFeed(prevFeed => [...prevFeed, { type: 'system', key: 1, color: "rgba(125, 141, 179, 0.9)", text: 'text', content: [`Sequence ${answerTable?.[answeredAmount]?.sequenceNumber}, Shape ${answerTable?.[answeredAmount]?.shapeNumber}`] }]); 
                soundEffect('click2');
            }, 500);
        };
    }, [minigameData, gameState]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && input.trim()) {
            // Add user input to the feed
            setFeed(prevFeed => [...prevFeed, { type: 'user', key: 1, color: "rgba(97, 138, 105, 0.9)", text: 'text', content: [input] }]);

            // Check for specific input to add system-generated shapes
            if (
                input.toLowerCase().includes(answerTable[answeredAmount]?.name.toLowerCase()) &&
                input.toLowerCase().includes(answerTable[answeredAmount]?.color.toLowerCase())
            ) {
                if (answeredAmount + 1 === minigameData?.answerAmount) {
                    console.log("youve finished");

                    setTimeout(() => {
                        setFeed(prevFeed => [...prevFeed, { type: 'system', key: 1, color: "rgba(125, 141, 179, 0.9)", text: 'text', content: [`TERMINAL ACCESS SUCCESS`] }]); 
                        soundEffect('click2');
                    }, 500);
                    setTimeout(() => {
                        setFeed(prevFeed => [...prevFeed, { type: 'system', key: 1, color: "rgba(125, 141, 179, 0.9)", text: 'text', content: [`Welcome Mr. Anderson`] }]);
                        onFinish(true); 
                    }, 1000);

                } else {
                    setansweredAmount(answeredAmount + 1);
                    setTimeout(() => {
                        setFeed(prevFeed => [...prevFeed, { type: 'system', key: 1, color: "rgba(125, 141, 179, 0.9)", text: 'text', content: [`Sequence ${answerTable?.[answeredAmount + 1]?.sequenceNumber}, Shape ${answerTable?.[answeredAmount + 1]?.shapeNumber}`] }]); 
                        soundEffect('click2');
                    }, 500);
                    if (isEnvBrowser()) {
                        console.log(answerTable?.[answeredAmount + 1]?.color, answerTable?.[answeredAmount + 1]?.name)
                        console.log(answerTable);
                    };
                };
            } else {
                setTimeout(() => {
                    setFeed(prevFeed => [...prevFeed, { type: 'system', key: 1, color: "rgba(125, 141, 179, 0.9)", text: 'text', content: [`ERROR: WRONG ANSWER, SECURITY BREACH`] }]); 
                    soundEffect('click2');
                    onFinish(false);
                }, 500);
            };

            setInput(''); // Clear input
        }
    }; 

    const generateRandomShapeandSequence = (shapesInput: ColoredShape[]): AnswerTable[] => {
        // Retrieve the answerAmount from minigameData
        const answerAmount = minigameData?.answerAmount || 1; // Fallback to 1 if answerAmount is undefined
        // Array to hold the generated shapes, typed as AnswerTable[]
        const generatedShapes: AnswerTable[] = [];
        // Set to track used shapes to prevent duplicates
        const usedShapes = new Set<string>(); // Set to store unique shape identifiers
        const maxAttempts = 100; // Maximum attempts to find unique shapes
    
        // Flatten the shapes input into a list of unique shapes
        const allShapes = shapesInput.flatMap(({ shape, color }, index) =>
            shape.map((shapeName, shapeIndex) => ({
                shapeName: shapeName.trim(),
                color,
                entryIndex: index + 1,   // Store the index of the shape input (1-based)
                shapeIndex: shapeIndex + 1 // Store the index of the shape within its entry (1-based)
            }))
        );
    
        //console.log(allShapes); // Log all shapes to check the structure
    
        // Check if there are enough unique shapes to fulfill the request
        if (allShapes.length < answerAmount) {
            console.error(`Not enough unique shapes available: requested ${answerAmount}, available ${allShapes.length}`);
            return generatedShapes; // Early exit if not enough shapes are available
        }
    
        // Loop to generate shapes based on answerAmount
        while (generatedShapes.length < answerAmount) {
            let attempts = 0; // Track attempts to prevent infinite loops
    
            // Attempt to find a unique shape
            while (attempts < maxAttempts) {
                // Generate a random index for the flattened shapes array
                const randomKey: number = Math.floor(Math.random() * allShapes.length);
    
                // Get the shape from the flattened array
                const { shapeName, color, entryIndex, shapeIndex } = allShapes[randomKey];
    
                // Create a unique identifier
                const uniqueIdentifier = `${shapeName}-${color}-${entryIndex}-${shapeIndex}`;
    
                // Check if this shape has been used already
                if (!usedShapes.has(uniqueIdentifier)) {
                    // Push the generated shape details into the array with AnswerTable type
                    generatedShapes.push({
                        sequenceNumber: entryIndex, // The index of the shapesInput entry (1-based)
                        shapeNumber: shapeIndex,     // The index of the selected shape within that entry (1-based)
                        name: shapeName,             // The actual name of the selected shape
                        color: color,                // The color associated with the shape
                    });
    
                    // Mark this shape as used
                    usedShapes.add(uniqueIdentifier);
                    //console.log(`Shape added: ${shapeName} (Color: ${color}) from entry ${entryIndex} with shape number ${shapeIndex}`);
                    break; // Exit the attempts loop
                }
    
                attempts++; // Increment the attempts counter
            }
    
            // If we exceed the maximum attempts without finding a unique shape, break out
            if (attempts >= maxAttempts) {
                console.warn('Exceeded maximum attempts to find unique shapes');
                break; // Optionally handle this case (e.g., notify the user)
            }
        }
    
        //console.log(generatedShapes); // Log the generated shapes
        // Return the array of generated shapes as AnswerTable[]
        return generatedShapes;
    };
    
    
    const generateShapesBasedOnDifficulty = () => {
        const newShapes: ColoredShape[] = [];
        const sequenceCount = minigameData?.sequenceAmount;
    
        // Initial message to indicate the timer
        setFeed(prevFeed => [
            ...prevFeed,
            {
                type: 'system',
                key: 0,
                color: "rgba(125, 141, 179, 0.9)",
                text: 'text',
                content: [`You have ${minigameData?.readyTimer || 10} seconds to remember these sequences.`]
            }
        ]);
    
        // Create a function to gradually update the feed
        const updateFeedGradually = (index: number) => {
            if (index > sequenceCount) {
                // All sequences have been processed, call the returnTable function
                const returnedTable = generateRandomShapeandSequence(newShapes);
                setanswerTable(returnedTable);
                return; // Exit the function
            }
    
            const shapedata = generateRandomShapeSequence();
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
            const colorIndex = colors.indexOf(randomColor);
            if (colorIndex !== -1) {
                colors.splice(colorIndex, 1); // Remove the used color
            }
    
            // Push the shape data to newShapes
            newShapes.push({ shape: shapedata?.shapeNames, key: index, color: randomColor });
    
            // Set the first message for the current sequence
            setTimeout(() => {
                setFeed(prevFeed => [
                    ...prevFeed,
                    { type: 'system', key: index, color: "rgba(125, 141, 179, 0.9)", text: 'text', content: [`Sequence ${index}:`] }
                ]);
            }, 500);
    
            // Set the shape data after a delay
            setTimeout(() => {
                setFeed(prevFeed => [
                    ...prevFeed,
                    { type: 'system', key: index, color: randomColor, text: 'shape', content: shapedata?.combinedShape }
                ]);
                updateFeedGradually(index + 1); // Continue to the next index
            }, 1000); 
        };
    
        updateFeedGradually(1); // Start the feed updates
    };
    
    const generateRandomShapeSequence = (): { combinedShape: string[]; shapeNames: string[] } => {
        const shapeCount = minigameData?.shapeAmount ?? 0;
    
        // Ensure shapeCount is a valid number and within bounds
        const count = Math.min(shapeCount, shapeData.length); // Ensure we do not exceed available shapes
    
        // Get unique random indices based on shapeCount
        const randomIndices = getRandomUniqueIndices(shapeData.length, count);
    
        // Initialize arrays to hold the combined shapes and names
        const combinedShape: string[] = [];
        const shapeNames: string[] = [];
    
        // Extract the shapes and names based on random indices
        const shapes = randomIndices.map(index => {
            shapeNames.push(shapeData[index].name); // Add the name to the shapeNames array
            return shapeData[index].shape; // Return the shape itself
        });
    
        // Calculate the maximum height and width of the shapes
        const maxHeight = Math.max(...shapes.map(shape => shape.length));
        const maxWidth = Math.max(...shapes.map(shape => Math.max(...shape.map(row => row.length))));
    
        // Iterate over the rows to combine the shapes side by side
        for (let i = 0; i < maxHeight; i++) {
            const rowParts = shapes.map(shape => {
                // Get the current row or a row of spaces if shorter, ensuring consistent width
                const currentRow = shape[i] || ' '.repeat(maxWidth); // Pad with spaces to maxWidth
                return currentRow; // Use the row as it is
            });
    
            // Combine the rows with consistent spacing between shapes
            combinedShape.push(rowParts.join(' '.repeat(2))); // Maintain two spaces between shapes
        }
    
        // Return an object containing the combined shape and corresponding names
        return {
            combinedShape,
            shapeNames
        };
    };
    
    

    // Function to get two unique random indices
    const getRandomUniqueIndices = (length: number, count: number): number[] => {
        const indices = new Set<number>();
        while (indices.size < count) {
            indices.add(Math.floor(Math.random() * length));
        }
        return Array.from(indices);
    };

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(4, 14, 33, 0.7)",
                display: "flex",
                flexDirection: "column",
                padding: "1vh",
                paddingTop: 0,
                borderRadius: "1vh",
            }}
        >
            <div 
                style={{
                    width: "auto",
                    height: "100%",
                    //backgroundColor: "orange",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    padding: "1vh",
                    paddingTop: 0,
                    color: "white",
                    fontFamily: "Exo",
                    borderRadius: "0.5vh",
                }}
            >

                <Feed
                    feed={feed}
                />

            </div>
           

            {/* Input Box */}
            <input
                disabled={gameState !== 1}
                className="FeedInput"
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type something here..."
            />
        </div>
    );
};

export default FeedHandler;
