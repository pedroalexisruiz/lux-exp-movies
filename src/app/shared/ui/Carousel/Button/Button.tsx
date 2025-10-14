import React from 'react';
import './Button.scss';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  active?: boolean;
}

export function Button({
  children,
  active,
  className = '',
  variant = 'primary',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`ui-button ui-button--${variant} ${active ? `ui-button--${variant}__active` : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
