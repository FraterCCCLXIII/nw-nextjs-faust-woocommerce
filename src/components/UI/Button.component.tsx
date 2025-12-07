import { ReactNode } from 'react';
import Link from 'next/link';

type TButtonVariant = 'primary' | 'secondary' | 'hero' | 'filter' | 'reset' | 'danger';

interface IButtonProps {
  handleButtonClick?: () => void;
  buttonDisabled?: boolean;
  variant?: TButtonVariant;
  children?: ReactNode;
  fullWidth?: boolean;
  href?: string;
  title?: string;
  selected?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Renders a clickable button
 * @function Button
 * @param {void} handleButtonClick - Handle button click
 * @param {boolean?} buttonDisabled - Is button disabled?
 * @param {TButtonVariant?} variant - Button variant
 * @param {ReactNode} children - Children for button
 * @param {boolean?} fullWidth - Whether the button should be full-width on mobile
 * @param {boolean?} selected - Whether the button is in a selected state
 * @returns {JSX.Element} - Rendered component
 */
const Button = ({
  handleButtonClick,
  buttonDisabled,
  variant = 'primary',
  children,
  fullWidth = false,
  href,
  title,
  selected = false,
  type = 'button',
}: IButtonProps) => {
  const getVariantClasses = (variant: TButtonVariant = 'primary') => {
    switch (variant) {
      case 'hero':
        return 'inline-block px-8 py-4 text-lg font-semibold bg-black text-white rounded-full hover:bg-gray-800 transition-colors';
      case 'filter':
        return selected 
          ? 'px-3 py-1 border rounded-full bg-gray-900 text-white'
          : 'px-3 py-1 border rounded-full hover:bg-gray-100 bg-white text-gray-900';
      case 'reset':
        return 'w-full mt-8 py-2 px-4 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors';
      case 'secondary':
        return 'px-2 lg:px-4 py-2 font-semibold border-2 border-gray-900 rounded-full bg-white text-gray-900 hover:bg-gray-50 transition-colors';
      case 'danger':
        return 'px-2 lg:px-4 py-2 font-semibold border border-red-500 border-solid rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors';
      default: // primary - matches Medusa product page button style
        return 'w-full h-10 px-4 py-2 font-semibold rounded-full bg-black text-white hover:bg-gray-800 transition-colors';
    }
  };

  const classes = `${getVariantClasses(variant)} ease-in-out transition-all duration-300 disabled:opacity-50 ${
    fullWidth ? 'w-full md:w-auto' : ''
  }`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={handleButtonClick}
      disabled={buttonDisabled}
      className={classes}
      title={title}
    >
      {children}
    </button>
  );
};

export default Button;
