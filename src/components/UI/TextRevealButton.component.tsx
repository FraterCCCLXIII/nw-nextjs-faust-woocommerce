"use client";

import { ReactNode } from 'react';

interface TextRevealButtonProps {
  children: ReactNode;
  dataText?: string;
  className?: string;
}

/**
 * Text Reveal Button component matching Tether design
 * Creates a text reveal effect on hover
 */
const TextRevealButton = ({ children, dataText, className = '' }: TextRevealButtonProps) => {
  const text = typeof children === 'string' ? children : dataText || '';
  
  return (
    <span className={`nectar-text-reveal-button ${className}`} data-text={text}>
      <span className="nectar-text-reveal-button__text">{children}</span>
    </span>
  );
};

export default TextRevealButton;

