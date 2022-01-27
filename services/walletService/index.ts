import BigNumber from 'bignumber.js/bignumber';
import { ethers } from 'ethers';

import { Usdt__factory } from 'types/abis/factories/Usdt__factory';
import { Staking__factory } from 'types/abis/factories/Staking__factory';
import { Usdt } from 'types/abis/Usdt';
import { Staking } from 'types/abis/Staking';
import { Contracts } from 'config';

declare global {
  interface Window {
    ethereum: any;
  }
}

export default class WalletService {
  public walletAddress = '';
  public provider;

  public usdtContract: Usdt;
  public stakingContract: Staking;
  private signer: any;

  constructor(rpc?: string) {
    if (rpc) {
      this.provider = new ethers.providers.JsonRpcProvider(rpc);
      this.signer = new ethers.Wallet(
        '0xb4b0f4d42079badfcd0f92273494e09f53cf0c7889ae5f7e8c1dd73899f5a044',
      );
      this.signer = this.signer.connect(this.provider);
    } else {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
    }

    this.usdtContract = Usdt__factory.connect(Contracts.USDT, this.signer);

    this.stakingContract = Staking__factory.connect(
      Contracts.STAKING,
      this.signer,
    );
  }

  public setAccountAddress(address: string) {
    this.walletAddress = address;
  }

  static getMethodInterface(abi: Array<any>, methodName: string) {
    return abi.filter((m) => {
      return m.name === methodName;
    })[0];
  }

  encodeFunctionCall(methodName: string, method: any, data: Array<any>) {
    let iface = new ethers.utils.Interface(method);
    return iface.encodeFunctionData(methodName, data);
  }

  sendTransaction(transactionConfig: any) {
    return this.provider.sendTransaction({
      ...transactionConfig,
      from: this.walletAddress,
    });
  }

  public async calcTransactionAmount(amount: number | string): Promise<string> {
    if (amount === '0') {
      return amount;
    }
    const tokenDecimals = await this.usdtContract.decimals();
    return new BigNumber(amount)
      .times(new BigNumber(10).pow(tokenDecimals))
      .toString(10);
  }

  public async weiToEth(amount: number | string): Promise<string> {
    if (amount === '0') {
      return amount;
    }
    const tokenDecimals = await this.usdtContract.decimals();
    return new BigNumber(amount)
      .dividedBy(new BigNumber(10).pow(tokenDecimals))
      .toString(10);
  }

  static weiToEthWithDecimals(amount: number | string, decimals = 18): string {
    return new BigNumber(amount)
      .dividedBy(new BigNumber(10).pow(decimals))
      .toString(10);
  }

  static ethToWei(amount: number | string, decimals = 18): string {
    return new BigNumber(amount)
      .multipliedBy(new BigNumber(10).pow(decimals))
      .toString(10);
  }
}
