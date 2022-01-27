import React from 'react';
import cn from 'classnames';

import s from './Button.module.scss';

export interface IButton {
  className?: string;
  onClick?: (event: any) => void;
  loading?: boolean;
  disabled?: boolean;
}

const Button: React.FC<IButton> = ({
  children,
  className,
  loading,
  disabled,
  onClick,
}) => {
  return (
    <button
      className={cn(s.btn, className)}
      onClick={onClick}
      disabled={disabled || loading}>
      {loading ? 'In progress...' : <span>{children}</span>}
    </button>
  );
};

export default Button;
