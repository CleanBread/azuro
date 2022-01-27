import React, { ChangeEvent } from 'react';

import BigNumber from 'bignumber.js/bignumber';
import cn from 'classnames';

import style from '../Input.module.scss';

export interface IInput {
  isNumber?: boolean;
  integer?: boolean;
  readonly?: boolean;
  placeholder?: string;
  value?: any;
  onChange: (value: any) => void;
  onBlur?: (e: any) => void;
  min?: number;
  max?: number;
  positiveOnly?: boolean;
  name?: string;
  className?: string;
  field?: any;
  textSize?: 'md' | 'lg';
}

const Input: React.FC<IInput> = React.forwardRef<HTMLInputElement, IInput>(
  (
    {
      isNumber = false,
      integer = false,
      readonly = false,
      placeholder = '',
      value,
      onChange,
      onBlur,
      min,
      max,
      positiveOnly,
      name,
      className,
      field,
      textSize = 'md',
    },
    ref,
  ) => {
    const getRegex = React.useCallback(() => {
      if (integer) {
        return positiveOnly ? /^[+]?[1-9]\d*$/ : /^[-+]?[1-9]\d*$/;
      }
      return positiveOnly ? /^([.]\d+|\d+[.]?\d*)$/ : /^[-+]?([.]\d+|\d+[.]?\d*)$/;
    }, [integer, positiveOnly]);

    const checkMin = React.useCallback(
      (comparingValue: string) => {
        const arrayedComparingValue = Array.from(String(comparingValue), Number);
        const arrayedMin = Array.from(String(min), Number);
        if (new BigNumber(min ?? 0).isLessThanOrEqualTo(comparingValue)) return true;
        for (let i = 0; i < arrayedComparingValue.length; i += 1) {
          if (
            !(
              (
                new BigNumber(arrayedMin[i]).isLessThanOrEqualTo(
                  new BigNumber(arrayedComparingValue[i]),
                ) || // every symbol should be more or equal to min value
                (Number.isNaN(arrayedMin[i]) && Number.isNaN(arrayedComparingValue[i])) || // '.' elements
                (arrayedComparingValue[i] !== undefined && arrayedMin[i] === undefined)
              ) // if arrayedComparingValue longer than arrayedMin
            )
          ) {
            return false;
          }
        }
        return true;
      },
      [min],
    );

    const handleChange = React.useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const reg = getRegex();
        const inputValue = e.target.value;
        if (onChange) {
          if (
            (!Number.isNaN(inputValue) && reg.test(inputValue)) ||
            (!positiveOnly && inputValue === '-')
          ) {
            if ((max || max === 0) && min) {
              if (
                checkMin(inputValue) &&
                (new BigNumber(inputValue).isLessThan(new BigNumber(max)) ||
                  new BigNumber(inputValue).isEqualTo(new BigNumber(max)))
              )
                onChange(e);
            } else if (max || max === 0) {
              if (
                new BigNumber(inputValue).isLessThan(new BigNumber(max)) ||
                new BigNumber(inputValue).isEqualTo(new BigNumber(max))
              )
                onChange(e);
            } else if (min) {
              if (checkMin(inputValue)) onChange(e);
            } else onChange(e);
          }
          if (inputValue === '') onChange(e);
        }
      },
      [checkMin, getRegex, max, min, onChange, positiveOnly],
    );

    const handleInputChange = React.useMemo(() => {
      return isNumber ? handleChange : onChange;
    }, [isNumber, handleChange, onChange]);

    return (
      <input
        name={name}
        autoComplete="off"
        ref={ref}
        className={cn(style.input, className, `text-${textSize}`)}
        type="text"
        readOnly={readonly}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onBlur={onBlur}
        {...field}
      />
    );
  },
);

export default Input;
