import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { WorkingGroup, workingGroups } from '@/pages/Lead/lead.types'

type LeadStoreState = {
  selectedWorkingGroup: WorkingGroup
}

type LeadStoreActions = {
  setSelectedWorkingGroup: (group: WorkingGroup) => void
}

export const useLeadStore = create<LeadStoreState & LeadStoreActions>()(
  persist(
    immer((set) => ({
      selectedWorkingGroup: Object.keys(workingGroups)[0] as WorkingGroup,
      setSelectedWorkingGroup: (group: WorkingGroup) => {
        set((state) => {
          state.selectedWorkingGroup = group
        })
      },
    })),
    {
      name: 'joyutils-lead',
      partialize: (s) => ({
        selectedWorkingGroup: s.selectedWorkingGroup,
      }),
    }
  )
)
