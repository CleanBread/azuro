import React from 'react';
import { useWeb3React } from '@web3-react/core';

import { InjectedConnector } from 'connectors';
import { Button } from 'components';

import s from './Connect.module.scss';

const Connect: React.VFC = () => {
  const context = useWeb3React();

  const handleConnect = React.useCallback(() => {
    context.activate(InjectedConnector);
  }, [context.activate]);

  const handleDisconnect = React.useCallback(() => {
    context.deactivate();
  }, [context.deactivate]);

  return (
    <div className={s.connect}>
      {context.account ? (
        <Button onClick={handleDisconnect}>disconnect</Button>
      ) : (
        <Button onClick={handleConnect}>connect</Button>
      )}
      {context.account ? (
        <div className={s.connect__info}>{context.account}</div>
      ) : null}
      {context.error?.message ? (
        <div className={s.connect__info}>{context.error?.message}</div>
      ) : null}
    </div>
  );
};

export default React.memo(Connect);
