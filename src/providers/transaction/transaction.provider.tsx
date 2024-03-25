import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import { CircleCheck, CircleX } from 'lucide-react'
import {
  ExtrinsicStatus,
  ExtrinsicStatusCallbackFn,
  RawExtrinsicResult,
} from './transaction.types'
import { useWalletStore } from '@/providers/wallet/wallet.store'

type TransactionContextType = {
  setTxForConfirmation: (
    tx: SubmittableExtrinsic<'promise'>,
    accountId: string
  ) => void
}

const TransactionContext = createContext<TransactionContextType>({
  setTxForConfirmation: () => {},
})

export const TransactionProvider: FC<PropsWithChildren> = ({ children }) => {
  const [transaction, setTransaction] =
    useState<SubmittableExtrinsic<'promise'> | null>(null)
  const [transactionStatus, setTransactionStatus] =
    useState<ExtrinsicStatus | null>(null)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [result, setResult] = useState<RawExtrinsicResult | null>(null)

  const setTxForConfirmation = useCallback(
    async (tx: SubmittableExtrinsic<'promise'>, accountId: string) => {
      setTransaction(tx)
      setAccountId(accountId)
    },
    []
  )

  const handleClose = () => {
    setTransaction(null)
    setTimeout(() => {
      setTransactionStatus(null)
      setAccountId(null)
      setResult(null)
    })
  }

  const handleContinue = async () => {
    if (!transaction || !accountId) {
      return
    }

    setTransactionStatus(ExtrinsicStatus.Unsigned)

    try {
      const result = await sendExtrinsic(transaction, accountId, (status) => {
        setTransactionStatus(status)
      })
      setResult(result)
      if (result.events.includes('system.ExtrinsicFailed')) {
        setTransactionStatus(ExtrinsicStatus.Error)
      } else {
        setTransactionStatus(ExtrinsicStatus.Completed)
      }
    } catch (error) {
      console.error('Error sending extrinsic:', error)
      setTransactionStatus(ExtrinsicStatus.Error)
    }
  }

  const renderTransactionStatus = () => {
    if (transactionStatus === ExtrinsicStatus.Signed) {
      return 'Waiting for confirmation...'
    }

    if (transactionStatus === ExtrinsicStatus.Completed) {
      return (
        <div>
          <h3 className="flex gap-2 text-green-600 items-center">
            <CircleCheck className="w-5 h-5" /> Success
          </h3>
          <a
            href={`https://joystream.subscan.io/extrinsic/${result?.transactionHash}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            Subscan
          </a>
          <div>Events:</div>
          <ul>
            {result?.events.map((event, index) => <li key={index}>{event}</li>)}
          </ul>
        </div>
      )
    }

    if (transactionStatus === ExtrinsicStatus.Error) {
      return (
        <div>
          <h3 className="flex gap-2 text-destructive items-center">
            <CircleX className="w-5 h-5" /> Failed
          </h3>
          {result ? (
            <>
              <a
                href={`https://joystream.subscan.io/extrinsic/${result.transactionHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                Subscan
              </a>
              <div>Events:</div>
              <ul>
                {result.events.map((event, index) => (
                  <li key={index}>{event}</li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      )
    }

    return 'Waiting for signature...'
  }

  return (
    <TransactionContext.Provider value={{ setTxForConfirmation }}>
      <AlertDialog open={!!transaction}>
        <AlertDialogContent className="max-w-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm transaction</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="mt-6 border-t border-gray-100">
            <dl className="divide-y divide-gray-100">
              <div className="px-4 py-6 sm:grid sm:grid-cols-5 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Method
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {transaction?.method.section}.{transaction?.method.method}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-5 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Arguments
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {/* @ts-ignore */}
                  {JSON.stringify(transaction?.method.toHuman()?.args)}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-5 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Status
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {renderTransactionStatus()}
                </dd>
              </div>
            </dl>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleClose}
              disabled={transactionStatus === ExtrinsicStatus.Signed}
            >
              {!transactionStatus ? 'Cancel' : 'Close'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleContinue}
              disabled={
                !!transactionStatus &&
                transactionStatus !== ExtrinsicStatus.Error
              }
            >
              Sign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {children}
    </TransactionContext.Provider>
  )
}

export const useTransactionContext = () => {
  const transactionContext = useContext(TransactionContext)

  if (transactionContext === null) {
    throw new Error(
      'useTransactionContext must be used within a TransactionProvider'
    )
  }

  return transactionContext
}

function sendExtrinsic(
  tx: SubmittableExtrinsic<'promise'>,
  accountId: string,
  cb?: ExtrinsicStatusCallbackFn
) {
  const signer = useWalletStore.getState().wallet?.signer
  return new Promise<RawExtrinsicResult>((resolve, reject) => {
    let unsub: () => void
    let transactionInfo: string

    // { nonce: -1 } takes txs pending in the pool into account when sending a tx
    // see more here: https://polkadot.js.org/docs/api/cookbook/tx/#how-do-i-take-the-pending-tx-pool-into-account-in-my-nonce
    tx.signAndSend(accountId, { nonce: -1, signer }, (result) => {
      const extrinsicsHash = tx.hash.toHex()
      const { status, isError, events: rawEvents } = result
      if (isError) {
        unsub()

        console.error(`Transaction error: ${transactionInfo}`)
        reject(new Error('UnknownError'))
        return
      }

      if (status.isInBlock) {
        unsub()

        const events = rawEvents.map((record) => {
          const { event } = record
          return `${event.section}.${event.method}`
        })

        try {
          resolve({
            events,
            blockHash: status.asInBlock.toString(),
            transactionHash: extrinsicsHash,
          })
        } catch (error) {
          reject(error)
        }
      }
    })
      .then((unsubFn) => {
        // if signAndSend succeeded, report back to the caller with the update
        cb?.(ExtrinsicStatus.Signed)
        unsub = unsubFn
      })
      .catch((e) => {
        reject(e)
      })
  })
}
