import { FC, useEffect, useState } from 'react'
import { JoyCard } from '@/components/JoyCard'
import { JoyHapiInput } from '@/pages/General/JoyHapiInput'

export const JoyHapiCard: FC = () => {
  const [hapiValue, setHapiValue] = useState(0n)

  return (
    <JoyCard
      title="JOY ↔︎ HAPI conversion"
      contentClassName="flex flex-col space-y-5"
    >
      <JoyHapiInput
        type="joy"
        hapiValue={hapiValue}
        setHapiValue={setHapiValue}
      />
      <JoyHapiInput
        type="hapi"
        hapiValue={hapiValue}
        setHapiValue={setHapiValue}
      />
    </JoyCard>
  )
}
