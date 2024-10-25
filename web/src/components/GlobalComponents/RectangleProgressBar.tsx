import React from 'react';

interface RectangleProgressBarProps {
    filledAmount: number;
    totalAmount: number;
    bgColor: string;
    fillColor: string;
}


/**
* Global Rectangle Progress Bar, used to create amazing progress bars
* @state {number} filledAmount - how much the bar is filled
* @state {number} totalAmount - how much total the bar can be filled
* @state {string} bgColor - color of the non filled amount
* @state {string} fillColor - color of the filled amount 
*/
const RectangleProgressBar: React.FC<RectangleProgressBarProps> = (
    { 
        filledAmount = 100, 
        totalAmount = 100, 
        bgColor = `rgba(168, 168, 168, 0.5)`, 
        fillColor = `rgba(86, 245, 128, 0.9)`,
    }
) => {
    const percentageFilled = (filledAmount / totalAmount) * 100;

    return (
        <div 
            style={{
                height: "1vh",
                width: '100%',
                backgroundColor: `${bgColor}`,
                borderRadius: "5vh",
            }}
        >
            <div 
                style={{
                    height: '100%',
                    width: `${percentageFilled}%`,
                    backgroundColor: `${fillColor}`,
                    //backgroundColor: percentageFilled > 66 ? 'rgba(65, 209, 72, 0.8)' : percentageFilled > 33 ? 'orange' : 'red',
                    borderRadius: 'inherit',
                    textAlign: 'right',
                    transition: 'width 0.2s ease-in-out',
                    filter: `drop-shadow(0 0 0.25vh ${fillColor})`,
                }}
            >
                {/* 
                <span 
                    style={{
                        padding: 5,
                        color: 'white',
                        fontWeight: 'bold',
                    }}
                >
                    {`${percentageFilled.toFixed(0)}%`}
                </span>  
                */}
            </div>
        </div>
    );
};

export default RectangleProgressBar;
