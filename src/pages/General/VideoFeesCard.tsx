import { sidecarUrl } from '../../config'
import { FC, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { hapiToJoy } from '@/lib/utils'
import { JoyCard } from '@/components/JoyCard'
import { JoyInput } from '@/components/JoyInput'

type VideoFees = {
  dataObjectStateBloatBond: bigint
  dataObjectMegaByteFee: bigint
  videoStateBloatBond: bigint
}

async function getVideoFees(): Promise<VideoFees> {
  try {
    const responses = await Promise.all([
      fetch(sidecarUrl + 'pallets/storage/storage/DataObjectStateBloatBondValue'),
      fetch(sidecarUrl + 'pallets/storage/storage/DataObjectPerMegabyteFee'),
      fetch(sidecarUrl + 'pallets/content/storage/VideoStateBloatBondValue'),
    ])
    if (!responses.every((response) => response.ok)) {
      throw new Error('Bad response')
    }
    const jsons = await Promise.all(
      responses.map((response) => response.json())
    )
    const dataObjectStateBloatBond = BigInt(jsons[0].value)
    const dataObjectMegaByteFee = BigInt(jsons[1].value)
    const videoStateBloatBond = BigInt(jsons[2].value)
    return {
      dataObjectStateBloatBond,
      dataObjectMegaByteFee,
      videoStateBloatBond,
    }
  } catch (e) {
    console.error('Failed to fetch video fees', e)
    return Promise.reject(e)
  }
}

export const VideoFeesCard: FC = () => {
  const [numberOfObjects, setNumberOfObjects] = useState('')
  const [totalObjectsSize, setTotalObjectsSize] = useState('')

  const { data: videoFees } = useQuery({
    queryKey: ['videoFees'],
    queryFn: getVideoFees,
  })

  const isNumberOfObjectsValueValid =
    !numberOfObjects || parseInt(numberOfObjects) > 0

  const isTotalObjectsSizeValueValid =
    !totalObjectsSize || parseFloat(totalObjectsSize) > 0

  const handleNumberOfObjectsChange = (rawStringValue: string) => {
    setNumberOfObjects(rawStringValue)
  }

  const handleTotalObjectsSizeChange = (rawStringValue: string) => {
    setTotalObjectsSize(rawStringValue)
  }

  const videoFeesInfo = () => {
    const videoFeesValue = videoFees
    const numberOfObjectsValue = parseInt(numberOfObjects)
    const totalObjectsSizeValue = parseFloat(totalObjectsSize)

    if (!(numberOfObjectsValue > 0 && totalObjectsSizeValue > 0)) {
      return null
    }

    if (!videoFeesValue) {
      return 'Failed to fetch video fees. Please try again later.'
    }

    const totalDataObjectStateBloatBond =
      BigInt(numberOfObjectsValue) * videoFeesValue.dataObjectStateBloatBond
    const totalDataObjectMegaByteFee =
      BigInt(totalObjectsSizeValue) * videoFeesValue.dataObjectMegaByteFee

    const TX_FEE = 200000000n

    const totalVideoFees =
      TX_FEE +
      videoFeesValue.videoStateBloatBond +
      totalDataObjectStateBloatBond +
      totalDataObjectMegaByteFee

    const formatJoy = (value: bigint) => {
      const formatNumber = new Intl.NumberFormat('en-US', {
        minimumSignificantDigits: 2,
        maximumSignificantDigits: 2,
      }).format
      return formatNumber(hapiToJoy(value)) + ' JOY'
    }

    return (
      <>
        <p>Tx fee: {formatJoy(TX_FEE)}</p>
        <p>Video state bond: {formatJoy(videoFeesValue.videoStateBloatBond)}</p>
        <p>
          Objects state bond: {numberOfObjectsValue} *{' '}
          {formatJoy(videoFeesValue.dataObjectStateBloatBond)} ={' '}
          {formatJoy(totalDataObjectStateBloatBond)}
        </p>
        <p>
          Data object per megabyte fee: {totalObjectsSizeValue} *{' '}
          {formatJoy(videoFeesValue.dataObjectMegaByteFee)} ={' '}
          {formatJoy(totalDataObjectMegaByteFee)}
        </p>
        <p>
          Total fees: <b>{formatJoy(totalVideoFees)}</b>
        </p>
        <p>
          Refundable:{' '}
          <b>
            {formatJoy(
              videoFeesValue.videoStateBloatBond + totalDataObjectStateBloatBond
            )}
          </b>
        </p>
      </>
    )
  }

  return (
    <JoyCard title="Video fees" contentClassName="grid grid-col-1 gap-y-3">
      <div className="flex flex-col space-y-5 flex-1">
        <JoyInput
          label="Number of objects (media + images)"
          isInvalid={!isNumberOfObjectsValueValid}
          value={numberOfObjects}
          onChange={(e) => handleNumberOfObjectsChange(e.target.value)}
        />
        <JoyInput
          label="Total object size (MB)"
          isInvalid={!isTotalObjectsSizeValueValid}
          value={totalObjectsSize}
          onChange={(e) => handleTotalObjectsSizeChange(e.target.value)}
        />
      </div>
      <div className="text-slate-600 text-sm">{videoFeesInfo()}</div>
    </JoyCard>
  )
}
