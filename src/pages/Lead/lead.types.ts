export const workingGroups = {
  operationsWorkingGroupAlpha: 'Builders',
  operationsWorkingGroupBeta: 'HR',
  operationsWorkingGroupGamma: 'Marketing',
  storageWorkingGroup: 'Storage',
  distributionWorkingGroup: 'Distribution',
  membershipWorkingGroup: 'Membership',
  contentWorkingGroup: 'Content',
  forumWorkingGroup: 'Forum',
}

export type WorkingGroup = keyof typeof workingGroups
