import * as types from '@joystream/types'
import { ApiPromise, WsProvider } from '@polkadot/api'
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react'
import { RPC_URL } from '../../config'

type ApiContextType = {
  api: ApiPromise | null
}
export const ApiContext = createContext<ApiContextType>({ api: null })

export const ApiProvider: FC<PropsWithChildren> = ({ children }) => {
  const [api, setApi] = useState<ApiPromise | null>(null)

  useEffect(() => {
    const setupApi = async () => {
      const provider = new WsProvider(RPC_URL)
      const api = await ApiPromise.create({ provider })

      setApi(api)
    }

    setupApi()
  }, [])

  return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>
}

export const useApiContext = () => {
  const apiContext = useContext(ApiContext)

  if (apiContext === null) {
    throw new Error('useApiContext must be used within a ApiProvider')
  }

  return apiContext
}
