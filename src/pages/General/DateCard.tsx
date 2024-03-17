import { FC, useState } from 'react'
import { JoyCard } from '@/components/JoyCard'
import { JoyInput } from '@/components/JoyInput'
import { DateTime } from 'luxon'
import { useQuery } from '@tanstack/react-query'

const BLOCKS_REGEX = /^\d*$/

type Reference = {
  block: number
  timestamp: number
}

const REFERENCE_FALLBACK: Reference = {
  block: 6660470,
  timestamp: 1710695202,
}

async function getLatestBlock(): Promise<Reference> {
  try {
    const response = await fetch(
      'https://monitoring.joyutils.org/sidecar/blocks/head'
    )
    if (!response.ok) {
      throw new Error('Bad response')
    }
    const json = await response.json()
    const block = parseInt(json.number)
    const timestampExtrinsic = json.extrinsics.find(
      (extrinsic: any) =>
        extrinsic?.method?.method === 'set' &&
        extrinsic?.method?.pallet === 'timestamp'
    )
    if (!timestampExtrinsic) {
      throw new Error('Failed to find timestamp extrinsic')
    }
    const timestamp = timestampExtrinsic.args?.now
    return { block, timestamp: Math.floor(parseInt(timestamp) / 1000) }
  } catch (e) {
    console.error('Failed to fetch latest block', e)
    return Promise.reject(e)
  }
}

export const DateCard: FC = () => {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null)
  const [blockNumber, setBlockNumber] = useState('')

  const { data } = useQuery({
    queryKey: ['referenceBlock'],
    queryFn: getLatestBlock,
    initialData: REFERENCE_FALLBACK,
  })

  const reference = data ?? REFERENCE_FALLBACK

  const isBlocksValueValid = BLOCKS_REGEX.test(blockNumber)

  const handleDateChange = (rawStringValue: string) => {
    if (rawStringValue === '') {
      setSelectedDate(null)
      setBlockNumber('')
      return
    }
    const date = DateTime.fromISO(rawStringValue)
    const timestamp = date.toSeconds()
    const timestampDelta = timestamp - reference.timestamp
    const blocksDelta = Math.floor(timestampDelta / 6)
    const blockNumber = reference.block + blocksDelta
    setSelectedDate(date)
    setBlockNumber(blockNumber.toString())
  }

  const handleBlockNumberChange = (rawStringValue: string) => {
    if (rawStringValue === '') {
      setSelectedDate(null)
      setBlockNumber('')
      return
    }

    if (!BLOCKS_REGEX.test(rawStringValue)) {
      return
    }

    setBlockNumber(rawStringValue)
    const blockNumber = parseInt(rawStringValue)
    const timestamp = (blockNumber - reference.block) * 6 + reference.timestamp
    const date = DateTime.fromSeconds(timestamp)
    setSelectedDate(date)
  }

  const blockHeightInfo = (
    <div>
      <span>Block height assuming 6s block time</span>
      <br />
      <span>Reference block: {reference.block}</span>
      <br />
      <span>Reference timestamp: {reference.timestamp}</span>
    </div>
  )

  return (
    <JoyCard
      title="Date ↔︎ block conversion"
      contentClassName="flex flex-col space-y-5"
    >
      <JoyInput
        label="Date"
        tooltip="Date in your local timezone"
        type="datetime-local"
        value={selectedDate?.toString().slice(0, 16) ?? ''}
        onChange={(e) => handleDateChange(e.target.value)}
      />
      <JoyInput
        copy
        label="Block height"
        tooltip={blockHeightInfo}
        value={blockNumber}
        isInvalid={!isBlocksValueValid}
        onChange={(e) => handleBlockNumberChange(e.target.value)}
      />
    </JoyCard>
  )
}
