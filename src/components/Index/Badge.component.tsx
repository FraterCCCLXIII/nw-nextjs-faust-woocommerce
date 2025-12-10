interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'blur' | 'border';
  size?: 'small' | 'medium';
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
  className?: string;
}

/**
 * Badge component matching Tether design
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'medium',
  textColor = '#161514',
  bgColor,
  borderColor,
  className = '',
}: BadgeProps) => {
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
  };

  const variantClasses = {
    default: '',
    blur: 'backdrop-blur-[16px]',
    border: 'border',
  };

  return (
    <span
      className={`inline-block rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      style={{
        color: textColor,
        backgroundColor: bgColor || 'transparent',
        borderColor: borderColor,
      }}
    >
      {children}
    </span>
  );
};

export default Badge;

