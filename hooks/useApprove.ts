import React from 'react';
import BigNumber from 'bignumber.js';

import { useWalletConnectorContext } from 'contexts';
import { TNullable } from 'types';

const useApprove = ({
  walletAddress,
  approvingAddress,
  amount,
}: {
  approvingAddress: string;
  amount: string;
  walletAddress?: TNullable<string>;
}): [boolean, boolean, () => void] => {
  const { walletService } = useWalletConnectorContext();

  const [isApproved, setApproved] = React.useState(true);
  const [isApproving, setApproving] = React.useState(false);

  const handleApprove = React.useCallback(async () => {
    if (walletService && amount) {
      try {
        setApproving(true);
        const approveAmount = await walletService?.calcTransactionAmount(
          amount,
        );
        const tx = await walletService?.usdtContract.approve(
          approvingAddress,
          approveAmount,
        );
        await tx.wait();
        setApproving(false);
        setApproved(true);
      } catch (err) {
        console.log(err, 'err');
        setApproving(false);
      }
    }
  }, [walletService, approvingAddress, amount]);

  const handleCheckApprove = React.useCallback(async () => {
    try {
      if (
        walletAddress &&
        walletService &&
        new BigNumber(amount).isGreaterThan(0)
      ) {
        const { _hex: result } = await walletService?.usdtContract.allowance(
          walletAddress,
          approvingAddress,
        );

        if (new BigNumber(result).isGreaterThan(0)) {
          const apprAmount = await walletService.weiToEth(result);
          setApproved(new BigNumber(apprAmount).isGreaterThanOrEqualTo(amount));
        } else {
          setApproved(false);
        }
      }
    } catch (err) {
      setApproved(false);
    }
  }, [walletService, walletAddress, amount]);

  React.useEffect(() => {
    handleCheckApprove();
  }, [handleCheckApprove]);

  return [isApproved, isApproving, handleApprove];
};

export default useApprove;
