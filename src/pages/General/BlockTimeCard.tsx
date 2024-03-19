import { FC, useEffect, useRef, useState } from 'react'
import { JoyCard } from '@/components/JoyCard'
import { useApiContext } from '@/providers/api'
import { JoyInput } from '@/components/JoyInput'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/utils'

type BlockTimeData = {
  blockNumber: number
  timestamp: number
}

type BlockTimes = {
  start: BlockTimeData
  end: BlockTimeData
  averageBlockTime: number
}

export const BlockTimeCard: FC = () => {
  const [startBlock, setStartBlock] = useState<number | null>(null)
  const [endBlock, setEndBlock] = useState<number | null>(null)
  const [blockTimes, setBlockTimes] = useState<BlockTimes | null>(null)

  const { api, apiAt } = useApiContext()

  const initialBlocksSetRef = useRef(false)

  const isStartBlockValid = startBlock !== null && startBlock >= 0
  const isEndBlockValid = endBlock !== null && endBlock >= 0
  const isBlockRangeValid =
    isStartBlockValid && isEndBlockValid && startBlock <= endBlock

  const updateBlockTimes = async (startBlock: number, endBlock: number) => {
    const start = await apiAt(startBlock!)
    const end = await apiAt(endBlock!)
    if (!start || !end) return
    const startTimestamp = await start.query.timestamp.now()
    const endTimestamp = await end.query.timestamp.now()
    const startTimestampNumber = startTimestamp.toNumber()
    const endTimestampNumber = endTimestamp.toNumber()
    setBlockTimes({
      start: {
        blockNumber: startBlock!,
        timestamp: startTimestampNumber,
      },
      end: {
        blockNumber: endBlock!,
        timestamp: endTimestampNumber,
      },
      averageBlockTime:
        (endTimestampNumber - startTimestampNumber) /
        (endBlock - startBlock) /
        1000,
    })
  }

  useEffect(() => {
    if (initialBlocksSetRef.current) return
    if (!api) return
    const setInitialBlocks = async () => {
      const latest = await api.rpc.chain.getHeader()
      const blockNumber = latest.number.toNumber()
      setEndBlock(blockNumber)
      setStartBlock(blockNumber - 500000)
      await updateBlockTimes(blockNumber - 500000, blockNumber)
      initialBlocksSetRef.current = true
    }
    setInitialBlocks()
  }, [api])

  const handleUpdateClick = async () => {
    if (!api || !isBlockRangeValid) return
    setBlockTimes(null)
    await updateBlockTimes(startBlock!, endBlock!)
  }

  return (
    <JoyCard title="Average block time" contentClassName="flex flex-col gap-4">
      <JoyInput
        label="Start block"
        type="number"
        value={startBlock ?? ''}
        onChange={(e) => {
          const asNumber = parseInt(e.target.value)
          if (isNaN(asNumber)) setStartBlock(null)
          else setStartBlock(asNumber)
        }}
        isInvalid={
          (!isStartBlockValid && initialBlocksSetRef.current) ||
          (startBlock ?? 0) > (endBlock ?? 0)
        }
      />
      <JoyInput
        label="End block"
        type="number"
        value={endBlock ?? ''}
        onChange={(e) => {
          const asNumber = parseInt(e.target.value)
          if (isNaN(asNumber)) setEndBlock(null)
          else setEndBlock(asNumber)
        }}
        isInvalid={!isEndBlockValid && initialBlocksSetRef.current}
      />
      <Button onClick={handleUpdateClick} disabled={!blockTimes}>
        Update
      </Button>
      <p>
        {!blockTimes
          ? 'Loading...'
          : `Average block time: ${formatNumber(blockTimes.averageBlockTime)} seconds`}
      </p>
    </JoyCard>
  )
}
