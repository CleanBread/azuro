import type { AppProps } from 'next/app';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

import WalletServiceContextProvider from 'contexts/WalletService';

import '../styles/index.scss';

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;

  return library;
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <WalletServiceContextProvider>
        <Component {...pageProps} />
      </WalletServiceContextProvider>
    </Web3ReactProvider>
  );
}

export default MyApp;
