export enum ExtrinsicStatus {
  Unsigned,
  Signed,
  Completed,
  Error,
}
export type ExtrinsicStatusCallbackFn = (status: ExtrinsicStatus.Signed) => void

export type RawExtrinsicResult = {
  events: string[]
  blockHash: string
  transactionHash: string
}
