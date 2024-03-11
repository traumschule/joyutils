import { memo } from 'react'
import { useWallets } from '@polkadot-onboard/react'
import { BaseWallet } from '@polkadot-onboard/core'
import Wallet from './Wallet'
import { useWalletStore } from './providers/wallet/wallet.store'
import { useWalletsContext } from './providers/wallet'

const Wallets = () => {
  const { wallets } = useWallets()
  const disconnectWallet = useWalletsContext().disconnectWallet
  const wallet = useWalletStore((s) => s.wallet)
  const walletStatus = useWalletStore((s) => s.walletStatus)
  const walletAccounts = useWalletStore((s) => s.walletAccounts)

  if (!Array.isArray(wallets)) {
    return null
  }

  if (walletStatus === 'pending') {
    return <div>Connecting...</div>
  }

  if (walletStatus === 'connected' && wallet) {
    return (
      <div>
        <span>Connected to {wallet.metadata.title}</span>
        <ul>
          {walletAccounts.map((account) => (
            <li key={account.address}>{account.address}</li>
          ))}
        </ul>
        <button onClick={disconnectWallet}>Disconnect</button>
      </div>
    )
  }

  return (
    <div>
      <h2>Wallets:</h2>
      {wallets.map((wallet: BaseWallet) => (
        <Wallet key={wallet.metadata.title} wallet={wallet} />
      ))}
    </div>
  )
}

export default memo(Wallets)
