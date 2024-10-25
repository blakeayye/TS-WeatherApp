import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

type FeedItem = {
    type: 'user' | 'system'; // user = manual input, system = auto-generated
    content: string[];
    key: number;
    text: string;
    color: string,
};

interface FeedProps {
    feed?: FeedItem[];
}

/**
* Handles the feed, inputs are feed item
* @state {array} feed - 
*  @state  type: 'user' | 'system'; // user = manual input, system = auto-generated
* @state   content: string[];
* @state   key: number;
*  @state  text: string;
*  @state  color: string,
*/
const Feed: React.FC<FeedProps> = ({
    feed = [],
}) => {
    const reducerData = useSelector((state: RootState) => state.games);
    const minigameData = reducerData?.currentMinigame;

    if (minigameData?.gameType !== "terminalshape") {
        return null;
    }

    return (
        <>
            <div 
                style={{ 
                    display: "flex", 
                    justifyContent: "flex-start", 
                    justifyItems: "flex-start",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    alignContent: "flex-start",
                    padding: 0,
                    margin: 0,
                    minHeight: "45vh",
                }}
            >
                <ul 
                    style={{ 
                        marginTop: 0,
                        paddingTop: "1vh",
                        paddingLeft: "1.5vh",
                        listStyleType: 'square', 
                        textIndent: "0.5vh",
                    }}
                >
                    {feed.map((item, index) => (
                        //console.log(item),
                        <div 
                            key={index} 
                            style={{ 
                                filter: `drop-shadow(0 0 0.1vh ${item?.color})`,
                            }}
                        >
                            {item.type === 'user' ? (
                                <li
                                    style={{
                                        color: "white",
                                        fontWeight: 600,
                                        fontSize: "1.25vh",
                                        lineHeight: "2vh",
                                     
                                    }}
                                >
                                    <div
                                        style={{
                                            color: item?.color,
                                            fontWeight: 600,
                                            fontSize: "1.5vh",
                                            textAlign: "left",
                                        }}
                                    >
                                         {'>'} {item?.content}
                                    </div>
                                </li>
                            ) : (
                                <pre 
                                    key={index} 
                                    style={{ 
                                        color: "white",
                                        fontWeight: 600,
                                        fontSize: "1.5vh",
                                        margin: 0,
                                        padding: 0,
                                    }}
                                >
                                    {item.content.map((line: string, lineIndex: number) => (
                                        <li 
                                            key={lineIndex}
                                            style={{
                                                color: "white",
                                                fontWeight: 600,
                                                fontSize: "1.5vh",
                                                lineHeight: "2vh",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    //filter: item?.text === "text" ? `drop-shadow(0 0 0.1vh ${item?.color})` : "none",
                                                    color: item?.color,
                                                    fontWeight: 600,
                                                    fontSize: "1.5vh",
                                                    textAlign: "left",
                                                    textShadow: item?.text === "shape" ? '0.25vh 0.25vh 0.25vh rgba(0, 0, 0, 0.7)' : "none",
                                                }}
                                            >
                                                {item.text === "text" ? (
                                                    item.content.join('')
                                                ) : (
                                                    line
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                   
                                </pre>
                            )}
                        </div>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default Feed;
