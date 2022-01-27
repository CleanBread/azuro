import React from 'react';

import cn from 'classnames';

import { IInput } from '../Input';
import { Input } from '..';

import style from '../Input.module.scss';

interface IInputColor {
  color?: 'blue' | 'dark';
}

interface IInputWrapper extends IInputColor, IInput {
  title?: React.ReactElement;
  prefix?: React.ReactElement;
  postfix?: React.ReactElement;
  component?: 'input';
  error?: string;
  subtitle?: React.ReactElement;
  className?: string;
}

const InputWrapper: React.FC<IInputWrapper> = ({
  title,
  prefix,
  postfix,
  component = 'input',
  color = 'blue',
  error,
  subtitle,
  className,
  ...other
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClickPrefixPostfix = React.useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className={cn(style.wrapper, className)}>
      {title ? <div className={style.title}>{title}</div> : null}
      <div className={cn(style.content, style[`content_${color}`])}>
        {prefix ? (
          <div
            className={style.prefix}
            onClick={handleClickPrefixPostfix}
            onKeyDown={() => {}}
            role="button"
            tabIndex={0}>
            {prefix}
          </div>
        ) : null}
        {component === 'input' ? (
          <Input ref={inputRef} {...(other as any)} />
        ) : null}
        {postfix ? (
          <div
            className={style.postfix}
            onClick={handleClickPrefixPostfix}
            onKeyDown={() => {}}
            role="button"
            tabIndex={-1}>
            {postfix}
          </div>
        ) : null}
      </div>
      {error ? (
        <div className={style.error}>
          <span className="text-red text-smd">{error}</span>
        </div>
      ) : null}
      {subtitle ? <div className={style.subtitle}>{subtitle}</div> : null}
    </div>
  );
};

export default InputWrapper;
