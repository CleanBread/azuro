import React from 'react';
import { useWeb3React } from '@web3-react/core';

import { Button } from 'components';
import { IButton } from 'components/Button';
import { InjectedConnector } from 'connectors';

const ConnectBtnWrapper =
  (Component: typeof Button) => (props: React.PropsWithChildren<IButton>) => {
    const context = useWeb3React();

    const handleConnect = React.useCallback(() => {
      context.activate(InjectedConnector);
    }, [context.activate]);

    if (!context.account) {
      return (
        <Button {...props} onClick={handleConnect} disabled={false}>
          connect
        </Button>
      );
    }

    return <Component {...props} />;
  };

export default ConnectBtnWrapper;
