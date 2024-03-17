import { FC } from 'react'
import { Combobox } from '@/components/Combobox'
import { WorkingGroup, workingGroups } from './lead.types'
import { useLeadStore } from './lead.store'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { graphql } from '@/gql'
import request from 'graphql-request'
import { QN_URL } from '@/config'
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
    <>
      <div className="scroll-m-20 pb-2 flex justify-between items-center mb-8">
        <h2 className="text-3xl text-white font-semibold tracking-tight first:mt-0">
          Working group
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
    </>
  )
}
