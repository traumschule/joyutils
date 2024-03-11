import { FC, useMemo } from 'react'
import { GetWorkersQuery } from '@/gql/graphql'
import { asJoyPerTerm, formatNumber } from '@/lib/utils'
import { useLeadStore } from '@/pages/Lead/lead.store'
import { useSettingsStore } from '@/components/Settings'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { WorkingGroup, workingGroups } from './lead.types'
import { JoyCard } from '@/components/JoyCard'
import { UseQueryResult } from '@tanstack/react-query'

type WorkersCardProps = {
  group: WorkingGroup
  workersQuery: UseQueryResult<GetWorkersQuery>
}

enum ExtrinsicStatus {
  Unsigned,
  Signed,
  Completed,
  Error,
}
type ExtrinsicStatusCallbackFn = (
  status: ExtrinsicStatus.Unsigned | ExtrinsicStatus.Signed
) => void

const sendExtrinsicAndParseEvents = (
  tx: SubmittableExtrinsic<'promise'>,
  accountId: string,
  endpoint: string,
  cb?: ExtrinsicStatusCallbackFn
) =>
  new Promise<RawExtrinsicResult>((resolve, reject) => {
    let unsub: () => void
    let transactionInfo: string

    // { nonce: -1 } takes txs pending in the pool into account when sending a tx
    // see more here: https://polkadot.js.org/docs/api/cookbook/tx/#how-do-i-take-the-pending-tx-pool-into-account-in-my-nonce
    tx.signAndSend(accountId, { nonce: -1 }, (result) => {
      const extrinsicsHash = tx.hash.toHex()
      const { status, isError, events: rawEvents } = result
      if (isError) {
        unsub()

        SentryLogger.error(
          `Transaction error: ${transactionInfo}`,
          'JoystreamJs',
          'error'
        )
        reject(
          new JoystreamLibError({
            name: 'UnknownError',
            message: 'Unknown extrinsic error!',
          })
        )
        return
      }

      if (status.isInBlock) {
        const hash = status.asInBlock.toString()
        transactionInfo = [
          rawEvents.map((event) => event.event.method).join(', '),
          `on network: ${endpoint}`,
          `in block: ${hash}`,
          `extrinsic hash: ${extrinsicsHash}`,
          `more details at: https://polkadot.js.org/apps/?rpc=${endpoint}#/explorer/query/${hash}`,
        ].join('\n')
      }

      if (status.isFinalized) {
        unsub()
        SentryLogger.message(
          `Successful transaction: ${transactionInfo}`,
          'JoystreamJs',
          'info'
        )

        try {
          const events = parseExtrinsicEvents(registry, rawEvents)
          resolve({
            events,
            blockHash: status.asFinalized,
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

export const WorkersCard: FC<WorkersCardProps> = ({ workersQuery, group }) => {
  const { joyUsdRate, termLength } = useSettingsStore()

  const workers = useMemo(
    () =>
      workersQuery.data?.workers.map((worker) => {
        const joyPerTerm = asJoyPerTerm(worker.rewardPerBlock)
        const usdPerTerm = joyPerTerm * joyUsdRate
        return {
          id: worker.runtimeId,
          handle: worker.membership.handle,
          joyPerTerm,
          usdPerTerm,
        }
      }),
    [workersQuery.data, termLength, joyUsdRate]
  )

  return (
    <JoyCard
      title="Workers"
      isLoading={workersQuery.isLoading}
      isError={workersQuery.isError}
    >
      <Table>
        <TableCaption>Active {workingGroups[group]} workers</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Member</TableHead>
            <TableHead className="text-right">JOY per term</TableHead>
            <TableHead className="text-right">
              USD@{joyUsdRate} per term
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workers?.map((worker) => (
            <TableRow key={worker.id}>
              <TableCell>{worker.id}</TableCell>
              <TableCell>{worker.handle}</TableCell>
              <TableCell className="text-right">
                {formatNumber(worker.joyPerTerm)}
              </TableCell>
              <TableCell className="text-right">
                {formatNumber(worker.usdPerTerm)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </JoyCard>
  )
}
