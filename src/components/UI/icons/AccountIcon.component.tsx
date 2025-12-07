import React from "react";

const AccountIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      role="presentation"
      strokeWidth="2"
      focusable="false"
      width="22"
      height="22"
      className="icon icon-account"
      viewBox="0 0 22 22"
      {...props}
    >
      <circle cx="11" cy="7" r="4" fill="none" stroke="currentColor" />
      <path
        d="M3.5 19c1.421-2.974 4.247-5 7.5-5s6.079 2.026 7.5 5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default AccountIcon;

