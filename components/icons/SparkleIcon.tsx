
import React from 'react';

interface SparkleIconProps extends React.SVGProps<SVGSVGElement> {}

export const SparkleIcon: React.FC<SparkleIconProps> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    stroke="currentColor" 
    strokeWidth="1" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    <path d="M4.5 4.5L6 8L9.5 9.5L6 11L4.5 14.5L3 11L0 9.5L3 8L4.5 4.5Z" transform="translate(15,2)" />
    <path d="M4.5 4.5L6 8L9.5 9.5L6 11L4.5 14.5L3 11L0 9.5L3 8L4.5 4.5Z" transform="translate(2,16)" />
  </svg>
);
