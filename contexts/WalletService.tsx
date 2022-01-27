import React, { createContext, useContext } from 'react';

import { WalletService } from 'services';

const WalletServiceContext = createContext<{
  walletService?: WalletService;
}>({
  walletService: undefined,
});

const WalletServiceContextProvider: React.FC = ({ children }) => {
  const [walletService, setWalletService] = React.useState<WalletService>();

  React.useEffect(() => {
    if (window.ethereum) {
      setWalletService(
        new WalletService(),
        // new WalletService(
        //   'https://rinkeby.infura.io/v3/d21662b57aec47daa7b87f182cd87e0b',
        // ),
      );
    }
  }, []);

  return (
    <WalletServiceContext.Provider
      value={{
        walletService,
      }}>
      {children}
    </WalletServiceContext.Provider>
  );
};

export default WalletServiceContextProvider;

export function useWalletConnectorContext() {
  return useContext(WalletServiceContext);
}
