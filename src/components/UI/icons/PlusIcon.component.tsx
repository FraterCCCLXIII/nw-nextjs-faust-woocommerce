import React from "react";

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      role="presentation"
      focusable="false"
      strokeWidth="2"
      width="12"
      height="12"
      className="icon icon-plus"
      viewBox="0 0 12 12"
      {...props}
    >
      <path
        d="M6 0V12"
        fill="none"
        stroke="currentColor"
      />
      <path
        d="M0 6L12 6"
        fill="none"
        stroke="currentColor"
      />
    </svg>
  );
};

export default PlusIcon;

