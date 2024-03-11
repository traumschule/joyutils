import { FC, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Combobox } from '@/components/Combobox'
import { WorkingGroup, workingGroups } from './lead.types'
import { useLeadStore } from './lead.store'
import { useQuery } from '@tanstack/react-query'
import { graphql } from '@/gql'
import request from 'graphql-request'
import { QN_URL } from '@/config'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSettingsStore } from '@/components/Settings'
import { formatNumber, asJoyPerTerm } from '@/lib/utils'
import { WorkersCard } from '@/pages/Lead/WorkersCard'
import { SetSalaryCard } from '@/pages/Lead/SetSalaryCard'

const getAllWorkers = graphql(/* GraphQL */ `
  query GetWorkers($groupId: String!) {
    workers(
      where: { groupId_eq: $groupId, isActive_eq: true }
      orderBy: runtimeId_ASC
    ) {
      id
      isLead
      runtimeId
      rewardPerBlock
      roleAccount
      stakeAccount
      rewardAccount
      workerstartedleavingeventworker {
        inBlock
      }
      stake
      membership {
        id
        handle
      }
      missingRewardAmount
    }
  }
`)

const workingGroupsOptions = Object.entries(workingGroups).map(
  ([key, value]) => ({
    label: value,
    value: key,
  })
)

export const LeadPage: FC = () => {
  const { selectedWorkingGroup, setSelectedWorkingGroup } = useLeadStore()

  const workersQuery = useQuery({
    queryKey: ['workers', selectedWorkingGroup],
    queryFn: async () =>
      await request(QN_URL, getAllWorkers, {
        groupId: selectedWorkingGroup,
      }),
  })

  return (
    <main className="mx-auto max-w-[1200px] mt-[50px]">
      <div className="scroll-m-20 border-b pb-2 flex justify-between items-center mb-8">
        <h2 className="text-3xl font-semibold tracking-tight first:mt-0">
          Manage working group
        </h2>
        <Combobox
          options={workingGroupsOptions}
          value={selectedWorkingGroup}
          onChange={(value) => setSelectedWorkingGroup(value as WorkingGroup)}
          itemName="working group"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <WorkersCard group={selectedWorkingGroup} workersQuery={workersQuery} />
        <SetSalaryCard
          group={selectedWorkingGroup}
          workersQuery={workersQuery}
        />
      </div>
    </main>
  )
}
