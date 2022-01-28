import type { NextPage, GetServerSideProps } from 'next';
import React from 'react';
import { useWeb3React } from '@web3-react/core';
import { utils } from 'ethers';

import { Form } from 'components';
import { Connect, TxTable } from 'containers';
import { checkValueDecimals } from 'utils';
import { useWalletConnectorContext } from 'contexts';
import { WalletService } from 'services';
import { useBalance, useApprove } from 'hooks';
import { Contracts } from 'config';
import { FORM_TYPE, ITxTableItem } from 'types';
import { ProvideEvent, WithdrawEvent } from 'types/abis/Staking';
import { StakingAbi } from 'abis';

import s from './Home.module.scss';

interface IHome {
  items: ITxTableItem[];
}

const Home: NextPage<IHome> = ({ items }) => {
  const { account } = useWeb3React();
  const { walletService } = useWalletConnectorContext();

  const [usdtBalance, usdtDecimals, handleUpdateUserBalance] = useBalance(
    account,
    true,
  );
  const [stakingBalance, _, handleUpdateStakingBalance] = useBalance(
    account,
    true,
    'staking',
  );

  const [isProvideLoading, setProvideLoading] = React.useState(false);
  const [isWithdrawLoading, setWithdrawLoading] = React.useState(false);
  const [provideAmount, setProvideAmount] = React.useState('');
  const [withdrawAmount, setWithdrawAmount] = React.useState('');

  const [txItems, setTxItems] = React.useState<ITxTableItem[]>(items);

  const [isApproved, isApproving, handleApprove] = useApprove({
    walletAddress: account,
    amount: provideAmount,
    approvingAddress: Contracts.STAKING,
  });

  const handleChangeAmount = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = checkValueDecimals(e.target.value, usdtDecimals);
      if (e.target.name === 'provide') {
        setProvideAmount(value);
      }
      if (e.target.name === 'withdraw') {
        setWithdrawAmount(value);
      }
    },
    [usdtDecimals],
  );

  const handleUpdateBalances = React.useCallback(() => {
    handleUpdateUserBalance();
    handleUpdateStakingBalance();
  }, [handleUpdateUserBalance, handleUpdateStakingBalance]);

  const handleProvide = React.useCallback(async () => {
    if (walletService && account) {
      try {
        setProvideLoading(true);
        const trxAmount = await walletService.calcTransactionAmount(
          provideAmount,
        );
        const tx = await walletService.stakingContract.provide(trxAmount, {
          from: account,
        });
        await tx.wait();

        setProvideLoading(false);
        setProvideAmount('');
        handleUpdateBalances();
      } catch (err) {
        setProvideLoading(false);
        console.log(err);
      }
    }
  }, [walletService, provideAmount, account, handleUpdateBalances]);

  const handleWithdraw = React.useCallback(async () => {
    if (walletService && account) {
      try {
        setWithdrawLoading(true);
        const trxAmount = await walletService.calcTransactionAmount(
          withdrawAmount,
        );
        const tx = await walletService.stakingContract.withdraw(trxAmount, {
          from: account,
        });
        await tx.wait();
        setWithdrawLoading(false);
        setWithdrawAmount('');
        handleUpdateBalances();
      } catch (err) {
        setWithdrawLoading(false);
        console.log(err);
      }
    }
  }, [walletService, account, withdrawAmount, handleUpdateBalances]);

  const eventListener = React.useCallback(
    async (
      event: ProvideEvent | WithdrawEvent,
      eventName: 'Provide' | 'Withdraw',
    ) => {
      if (walletService) {
        try {
          const contractInterface = new utils.Interface(StakingAbi);
          const data = await contractInterface.decodeEventLog(
            eventName,
            event.data,
          );

          const blockInfo = await walletService.provider.getBlock(
            event.blockNumber,
          );

          setTxItems((txs) =>
            [
              {
                data: blockInfo.timestamp,
                action: eventName,
                sender: data[0],
                amount: WalletService.weiToEthWithDecimals(
                  data.amount._hex,
                  usdtDecimals,
                ),
              },
              ...txs,
            ].slice(0, 10),
          );
        } catch (error) {
          console.log(error, 'error');
        }
      }
    },
    [walletService],
  );

  React.useEffect(() => {
    if (walletService && usdtDecimals) {
      walletService.provider.on(
        {
          address: Contracts.STAKING,
          topics: [utils.id('Provide(address,uint256)')],
        },
        (event) => eventListener(event, 'Provide'),
      );
      walletService.provider.on(
        {
          address: Contracts.STAKING,
          topics: [utils.id('Withdraw(address,uint256)')],
        },
        (event) => eventListener(event, 'Withdraw'),
      );
    }
  }, [walletService, eventListener, usdtDecimals]);

  return (
    <div className={s.home}>
      <div className="container">
        <Connect />
        <div className={s.home__form}>
          <Form
            name="provide"
            type={FORM_TYPE.WITH_APPROVE}
            title="Provide Tokens"
            amount={provideAmount}
            handleChangeAmount={handleChangeAmount}
            inputTitleText={`Your Balance: ${usdtBalance}`}
            btnText="Provide"
            available={usdtBalance}
            handleSubmit={handleProvide}
            isApproved={isApproved}
            handleApprove={handleApprove}
            isLoading={isApproving || isProvideLoading}
          />
          <Form
            name="withdraw"
            type={FORM_TYPE.WITHOUT_APPROVE}
            title="Withdraw Tokens"
            amount={withdrawAmount}
            handleChangeAmount={handleChangeAmount}
            inputTitleText={`Available: ${stakingBalance}`}
            btnText="Withdraw"
            available={stakingBalance}
            handleSubmit={handleWithdraw}
            isLoading={isWithdrawLoading}
          />
        </div>
        <div className={s.home__table}>
          <TxTable items={txItems} />
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const walletService = new WalletService(
      'https://rinkeby.infura.io/v3/d21662b57aec47daa7b87f182cd87e0b',
    );
    const provideFilter = walletService.stakingContract.filters.Provide();
    const withdrawFilter = walletService.stakingContract.filters.Withdraw();
    const provideEvents = await walletService.stakingContract.queryFilter(
      provideFilter,
    );
    const withdrawEvents = await walletService.stakingContract.queryFilter(
      withdrawFilter,
    );

    const filteredEvents = [
      ...provideEvents.slice(provideEvents.length - 10, provideEvents.length),
      ...withdrawEvents.slice(
        withdrawEvents.length - 10,
        withdrawEvents.length,
      ),
    ]
      .sort((prevEvent, nextEvent) => {
        return nextEvent.blockNumber - prevEvent.blockNumber;
      })
      .slice(0, 10);

    const bloksInfoPromises = filteredEvents.map((event) =>
      walletService.provider.getBlock(event.blockNumber),
    );

    const bloksInfo = await Promise.all(bloksInfoPromises);

    const usdtDecimals = await walletService.usdtContract.decimals();

    const lastTrxData = bloksInfo.map((info, index) => ({
      data: info.timestamp,
      action: filteredEvents[index].event,
      sender: filteredEvents[index].args[0],
      amount: WalletService.weiToEthWithDecimals(
        filteredEvents[index].args.amount._hex,
        usdtDecimals,
      ),
    }));
    return {
      props: {
        items: lastTrxData,
      },
    };
  } catch (err) {
    console.log(err, 'events');
  }
  return {
    props: {
      items: [],
    },
  };
};

export default Home;
