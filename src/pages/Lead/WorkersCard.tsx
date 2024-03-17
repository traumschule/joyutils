import { FC, useMemo } from 'react'
import { GetWorkersQuery } from '@/gql/graphql'
import { asJoyPerTerm, formatNumber } from '@/lib/utils'
import { useSettingsStore } from '@/components/Settings'
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
