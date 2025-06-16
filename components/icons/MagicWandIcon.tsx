
import React from 'react';

interface MagicWandIconProps extends React.SVGProps<SVGSVGElement> {}

export const MagicWandIcon: React.FC<MagicWandIconProps> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M14.5 3.5l-12 12 5 5 12-12-5-5z"></path>
    <path d="M19 8l-2-2"></path>
    <path d="M21 4l-2-2"></path>
    <path d="M17 6l-2-2"></path>
    <path d="M5 18l-2 2"></path>
  </svg>
);
