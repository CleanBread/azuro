import { useCallback, useEffect, useState } from 'react';

import { useWalletConnectorContext } from 'contexts';
import { TNullable } from 'types';

export default (
  userAddress?: TNullable<string>,
  isIntervalUpdate = false,
  contractName: 'usdt' | 'staking' = 'usdt',
): [string, number, () => void] => {
  const [balance, setBalance] = useState('0');
  const [decimals, setDecimals] = useState(0);

  const { walletService } = useWalletConnectorContext();

  const getUserTokenBalance = useCallback(async () => {
    if (userAddress && walletService) {
      let method = walletService.usdtContract.balanceOf(userAddress);
      if (contractName === 'staking') {
        method = walletService.stakingContract.balance(userAddress);
      }
      const { _hex: tokenBalance } = await method;
      const amount = await walletService.weiToEth(tokenBalance.toString());

      setBalance(amount);
    }
  }, [userAddress, walletService]);

  const getTokenDecimals = useCallback(async () => {
    if (walletService) {
      const tokenDecimals = await walletService?.usdtContract.decimals();
      setDecimals(tokenDecimals);
    }
  }, [userAddress, walletService]);

  useEffect(() => {
    getTokenDecimals();
  }, [getTokenDecimals]);

  useEffect(() => {
    let interval: any = null;
    if (userAddress) {
      getUserTokenBalance();

      if (isIntervalUpdate && !interval) {
        interval = setInterval(getUserTokenBalance, 30000);
      }
    } else {
      setBalance('0');
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [getUserTokenBalance, userAddress, isIntervalUpdate]);

  return [balance, decimals, getUserTokenBalance];
};
