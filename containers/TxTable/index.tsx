import React from 'react';
import cn from 'classnames';

import { ITxTableItem } from 'types';
import { addressWithDots } from 'utils';

import s from './TxTable.module.scss';

interface ITxTable {
  items: ITxTableItem[];
}

const TxTable: React.VFC<ITxTable> = ({ items }) => {
  if (!items.length) {
    return null;
  }

  return (
    <div className={s.tx_table}>
      <div className={cn(s.tx_table__row, s.tx_table__head)}>
        <div className={s.tx_table__item}>Data</div>
        <div className={s.tx_table__item}>Action</div>
        <div className={s.tx_table__item}>Amount</div>
        <div className={s.tx_table__item}>Sender</div>
      </div>
      {items.map((tx) => (
        <div className={s.tx_table__row} key={tx.data}>
          <div className={s.tx_table__item}>
            {new Date(tx.data * 1000).toUTCString()}
          </div>
          <div className={s.tx_table__item}>{tx.action}</div>
          <div className={s.tx_table__item}>{tx.amount}</div>
          <div className={s.tx_table__item}>{addressWithDots(tx.sender)}</div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(TxTable);
