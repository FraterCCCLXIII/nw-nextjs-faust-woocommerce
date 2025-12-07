import React from 'react';

interface ChevronDownProps {
  size?: string;
  color?: string;
  className?: string;
}

const ChevronDown: React.FC<ChevronDownProps> = ({
  size = "16",
  color = "currentColor",
  className = "",
  ...attributes
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...attributes}
    >
      <path
        d="M4 6L8 10L12 6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ChevronDown;

