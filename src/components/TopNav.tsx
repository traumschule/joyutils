import { FC } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useJoystreamWallets } from '@/providers/wallet'
import { useSettingsStore } from '@/components/Settings'

export const TopNav: FC = () => {
  const {
    connectToWallet,
    disconnectWallet,
    allWallets,
    walletStatus,
    wallet,
  } = useJoystreamWallets()

  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen)

  const handleConnectWallet = async (walletId: string) => {
    try {
      const accounts = await connectToWallet(walletId)
      toast.success(`Wallet connected with ${accounts?.length} accounts`)
    } catch (error) {
      toast.error('Failed to connect wallet')
    }
  }

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet()
      toast.success('Wallet disconnected')
    } catch (error) {
      toast.error('Failed to disconnect wallet')
    }
  }

  const walletNode =
    walletStatus === 'connected' ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Wallet</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>
            Connected to {wallet?.metadata.title}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDisconnectWallet}>
            Disconnect wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : walletStatus === 'pending' ? (
      <Button disabled variant="outline">
        Connecting...
      </Button>
    ) : (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Connect wallet</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Select wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allWallets?.map((wallet) => (
            <DropdownMenuItem
              key={wallet.metadata.id}
              onClick={() => handleConnectWallet(wallet.metadata.id)}
            >
              {wallet.metadata.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )

  return (
    <nav className="px-7 py-5 flex justify-between items-center bg-slate-100 border-b-2">
      <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-4xl">
        Joyutils
      </h1>
      <div className="flex items-center">
        <Button
          variant="outline"
          onClick={() => setSettingsOpen(true)}
          className="mr-3"
        >
          Settings
        </Button>
        {walletNode}
      </div>
    </nav>
  )
}
