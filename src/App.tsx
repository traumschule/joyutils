import { ApiProvider } from './providers/api'
import { WalletProvider } from './providers/wallet'
import { TopNav } from '@/components/TopNav'

import { Toaster } from '@/components/ui/sonner'
import { Settings } from '@/components/Settings'
import { LeadPage } from '@/pages/Lead/Lead'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const App = () => {
  return (
    <ApiProvider>
      <WalletProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <TopNav />
          <Settings />
          <LeadPage />
        </QueryClientProvider>
      </WalletProvider>
    </ApiProvider>
  )
}

export default App
