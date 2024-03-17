import { SubmittableExtrinsic } from '@polkadot/api/types'

enum ExtrinsicStatus {
  Unsigned,
  Signed,
  Completed,
  Error,
}
type ExtrinsicStatusCallbackFn = (
  status: ExtrinsicStatus.Unsigned | ExtrinsicStatus.Signed
) => void

// const sendExtrinsicAndParseEvents = (
//   tx: SubmittableExtrinsic<'promise'>,
//   accountId: string,
//   endpoint: string,
//   cb?: ExtrinsicStatusCallbackFn
// ) =>
//   new Promise<RawExtrinsicResult>((resolve, reject) => {
//     let unsub: () => void
//     let transactionInfo: string
//
//     // { nonce: -1 } takes txs pending in the pool into account when sending a tx
//     // see more here: https://polkadot.js.org/docs/api/cookbook/tx/#how-do-i-take-the-pending-tx-pool-into-account-in-my-nonce
//     tx.signAndSend(accountId, { nonce: -1 }, (result) => {
//       const extrinsicsHash = tx.hash.toHex()
//       const { status, isError, events: rawEvents } = result
//       if (isError) {
//         unsub()
//
//         SentryLogger.error(
//           `Transaction error: ${transactionInfo}`,
//           'JoystreamJs',
//           'error'
//         )
//         reject(
//           new JoystreamLibError({
//             name: 'UnknownError',
//             message: 'Unknown extrinsic error!',
//           })
//         )
//         return
//       }
//
//       if (status.isInBlock) {
//         const hash = status.asInBlock.toString()
//         transactionInfo = [
//           rawEvents.map((event) => event.event.method).join(', '),
//           `on network: ${endpoint}`,
//           `in block: ${hash}`,
//           `extrinsic hash: ${extrinsicsHash}`,
//           `more details at: https://polkadot.js.org/apps/?rpc=${endpoint}#/explorer/query/${hash}`,
//         ].join('\n')
//       }
//
//       if (status.isFinalized) {
//         unsub()
//         SentryLogger.message(
//           `Successful transaction: ${transactionInfo}`,
//           'JoystreamJs',
//           'info'
//         )
//
//         try {
//           const events = parseExtrinsicEvents(registry, rawEvents)
//           resolve({
//             events,
//             blockHash: status.asFinalized,
//             transactionHash: extrinsicsHash,
//           })
//         } catch (error) {
//           reject(error)
//         }
//       }
//     })
//       .then((unsubFn) => {
//         // if signAndSend succeeded, report back to the caller with the update
//         cb?.(ExtrinsicStatus.Signed)
//         unsub = unsubFn
//       })
//       .catch((e) => {
//         reject(e)
//       })
//   })
