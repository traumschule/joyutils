import { FC } from 'react'
import { JoyHapiCard } from '@/pages/General/JoyHapiCard'
import { DurationCard } from '@/pages/General/DurationCard'
import { DateCard } from '@/pages/General/DateCard'
import { VideoFeesCard } from '@/pages/General/VideoFeesCard'

export const GeneralPage: FC = () => {
  return (
    <>
      <h2 className="text-3xl font-semibold tracking-tight text-white first:mt-0 scroll-m-20 pb-2 mb-8">
        General
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
        <JoyHapiCard />
        <DurationCard />
        <DateCard />
        <VideoFeesCard />
      </div>
    </>
  )
}
