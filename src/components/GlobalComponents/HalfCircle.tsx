import React from 'react';

/**
* This Sets the green width for the half circle in the needle minigame, can also be used as a base svg file
*
* @param greenWidth - Green Area Width (25-90 Seems Good, Dont Go Above 120-150 because it looks weird)
*/

const HalfCircle: React.FC<{ greenWidth: number }> = ({ greenWidth = 50 }) => {
  const paddingAngle = 0.055; 
  const greenWidthRad = (greenWidth * Math.PI) / 180;
  const redWidthRad = ((180 - greenWidth) / 2) * (Math.PI / 180);
  
  const startRed1 = paddingAngle;
  const endRed1 = redWidthRad - paddingAngle; 
  
  const startGreen = endRed1 + paddingAngle; 
  const endGreen = startGreen + greenWidthRad - paddingAngle;
  
  const startRed2 = endGreen + paddingAngle; 
  const endRed2 = startRed2 + redWidthRad - paddingAngle; 

  const calcX = (angle: number, size: number) => (size / 2) + (size / 2) * Math.cos(Math.PI - angle);
  const calcY = (angle: number, size: number) => (size / 2) - (size / 2) * Math.sin(Math.PI - angle) + 5;

  const size = 200;
  const strokeWidth = 2; 

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <svg width="100%" height="100%" viewBox={`-10 -10 ${size + 20} ${(size / 2) + 20}`}>
        <defs>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "rgba(92, 255, 95, 0.5)", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "rgba(0, 0, 0, 0.5)", stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        <path
          d={`M ${size / 2.05} ${size / 2} L ${calcX(startRed1, size)} ${calcY(startRed1, size)} A ${size / 2} ${size / 2} 0 0 1 ${calcX(endRed1, size) + 3} ${calcY(endRed1, size)} Z`}
          fill="rgba(77, 15, 15, 0.5)"
          stroke="rgba(163, 31, 31, 0.8)"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />

        <path
          d={`M ${size / 2} ${size / 2} L ${calcX(startGreen, size)} ${calcY(startGreen, size) + 1.5} A ${size / 2} ${size / 2} 0 0 1 ${calcX(endGreen, size)} ${calcY(endGreen, size) + 1.5} Z`}
          fill="rgba(57, 82, 22, 0.5)"
          stroke="rgba(191, 232, 135, 0.8)"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />

        <path
          d={`M ${size / 1.95} ${size / 2} L ${calcX(startRed2, size) - 3} ${calcY(startRed2, size)} A ${size / 2} ${size / 2} 0 0 1 ${calcX(endRed2, size)} ${calcY(endRed2, size)} Z`}
          fill="rgba(77, 15, 15, 0.5)"
          stroke="rgba(163, 31, 31, 0.8)"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default HalfCircle;
