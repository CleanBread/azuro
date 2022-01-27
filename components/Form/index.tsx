import React from 'react';
import BigNumber from 'bignumber.js';

import { Input, Button } from 'components';
import { ConnectBtnWrapper } from 'HOC';
import { SelectedModeProps, FORM_TYPE } from 'types';

import s from './Form.module.scss';

const Btn = ConnectBtnWrapper(Button);

const Form: React.VFC<SelectedModeProps> = ({
  title,
  amount,
  handleChangeAmount,
  inputTitleText,
  btnText,
  available,
  handleSubmit,
  isApproved,
  handleApprove,
  isLoading,
  type,
  name,
}) => {
  const selectedMode = type as FORM_TYPE;
  return (
    <div className={s.form}>
      <div className={s.form__title}>{title}</div>
      <Input
        value={amount}
        name={name}
        onChange={handleChangeAmount}
        positiveOnly
        isNumber
        title={<span>{inputTitleText}</span>}
        placeholder="Amount"
        error={
          new BigNumber(amount).isGreaterThan(available)
            ? `Value is greater than ${available}`
            : ''
        }
      />
      {isApproved || selectedMode === FORM_TYPE.WITHOUT_APPROVE ? (
        <Btn
          disabled={!amount || new BigNumber(amount).isGreaterThan(available)}
          onClick={handleSubmit}
          loading={isLoading}>
          {btnText}
        </Btn>
      ) : (
        <Button onClick={handleApprove} disabled={!amount} loading={isLoading}>
          Approve
        </Button>
      )}
    </div>
  );
};

export default React.memo(Form);
