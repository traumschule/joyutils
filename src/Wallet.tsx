import { FormEvent, memo, useCallback, useEffect, useState } from 'react'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { BaseWallet, Account } from '@polkadot-onboard/core'
import { useWalletsContext } from './providers/wallet'

const unitToPlanck = (units: string, decimals: number) => {
  let [whole, decimal] = units.split('.')

  if (typeof decimal === 'undefined') {
    decimal = ''
  }

  return `${whole}${decimal.padEnd(decimals, '0')}`.replace(/^0+/, '')
}

interface SendTransactionData {
  senderAddress: string
  receiverAddress: string
}

const Wallet = ({ wallet }: { wallet: BaseWallet }) => {
  const { connectToWallet } = useWalletsContext()
  // const handleSubmit = useCallback(
  //   async (event: FormEvent<HTMLFormElement>) => {
  //     const form = event.target as HTMLFormElement;
  //     event.preventDefault();
  //     event.stopPropagation();
  //
  //     const data = new FormData(form);
  //     const { senderAddress, receiverAddress } = Object.fromEntries(
  //       data,
  //     ) as unknown as SendTransactionData;
  //
  //     if (api && wallet?.signer) {
  //       const amount = unitToPlanck("0.01", api.registry.chainDecimals[0]);
  //
  //       await api.tx.balances
  //         .transfer(receiverAddress, amount)
  //         .signAndSend(senderAddress, { signer: wallet.signer }, () => {
  //           // do something with result
  //         });
  //     }
  //   },
  //   [api, wallet],
  // );

  return (
    <div>
      <h2>{wallet.metadata.title}</h2>
      {wallet.isConnected() ? (
        <p>Connected</p>
      ) : (
        <button onClick={() => connectToWallet(wallet.metadata.id)}>
          Connect
        </button>
      )}
    </div>
  )

  // return (
  //   <div style={{ marginBottom: "20px" }}>
  //     <button
  //       onClick={getAccounts}
  //     >{`${wallet.metadata.title} ${wallet.metadata.version || ""}`}</button>
  //     {accounts.length > 0 &&
  //       accounts.map(({ address, name = "" }) => (
  //         <form
  //           key={address}
  //           onSubmit={handleSubmit}
  //           style={{ marginBottom: "10px" }}
  //         >
  //           <div>
  //             <label>Account name: {name}</label>
  //           </div>
  //           <div>
  //             <label>
  //               Account address:{" "}
  //               <input
  //                 name="senderAddress"
  //                 type="text"
  //                 required
  //                 readOnly
  //                 value={address}
  //                 size={60}
  //               />
  //             </label>
  //           </div>
  //           <div>
  //             <label>
  //               Receiver address:{" "}
  //               <input name="receiverAddress" type="text" required size={60} />
  //             </label>
  //           </div>
  //           <button type="submit">Send donation</button>
  //         </form>
  //       ))}
  //   </div>
  // );
}

export default memo(Wallet)
