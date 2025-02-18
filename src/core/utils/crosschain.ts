import {
  createClient,
  createIccfProofTx,
  gtv,
  GTX,
  IccfProof,
  IClient,
  RawGtv,
  RawGtx,
  gtx,
} from 'postchain-client';
import {
  getTransactionRid,
  noopAuthenticator,
  nop,
  op,
  Session,
  transactionBuilder,
} from '@chromia/ft4';
import { PendingTransfer } from '../types/crosschain';

export async function performCrossChainTransfer(
  fromSession: Session,
  toChain: IClient,
  toAccountId: Buffer,
  tokenId: bigint,
  amount: bigint,
  metadata: RawGtv[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    fromSession
      .transactionBuilder()
      .add(nop())
      .add(
        op(
          'yours.init_transfer',
          Buffer.from(toChain.config.blockchainRid, 'hex'),
          toAccountId,
          tokenId,
          amount,
          metadata
        ),
        {
          onAnchoredHandler: (initData: any) => {
            if (!initData) {
              reject(new Error('No data provided after init_transfer'));
              return;
            }

            initData
              .createProof(toChain.config.blockchainRid)
              .then((iccfProofOperation: any) => {
                return transactionBuilder(noopAuthenticator, toChain)
                  .add(iccfProofOperation, {
                    authenticator: noopAuthenticator,
                  })
                  .add(
                    op('yours.apply_transfer', initData.tx, initData.opIndex),
                    {
                      authenticator: noopAuthenticator,
                      onAnchoredHandler: (applyData: any) => {
                        if (!applyData) {
                          reject(
                            new Error('No data provided after apply_transfer')
                          );
                          return;
                        }

                        applyData
                          .createProof(fromSession.blockchainRid)
                          .then((iccfProofOperation: any) => {
                            return fromSession
                              .transactionBuilder()
                              .add(iccfProofOperation, {
                                authenticator: noopAuthenticator,
                              })
                              .add(
                                op(
                                  'yours.complete_transfer',
                                  applyData.tx,
                                  applyData.opIndex
                                ),
                                {
                                  authenticator: noopAuthenticator,
                                }
                              )
                              .buildAndSend();
                          })
                          .then(() => {
                            resolve();
                          })
                          .catch((error: Error) => {
                            reject(error);
                          });
                      },
                    }
                  )
                  .buildAndSendWithAnchoring();
              })
              .catch((error: Error) => {
                reject(error);
              });
          },
        }
      )
      .buildAndSendWithAnchoring()
      .catch((error) => {
        reject(error);
      });
  });
}

export async function resumeCrossChainTransfer(
  sourceChain: IClient,
  pendingTransfer: PendingTransfer
) {
  const nodeUrlPool = sourceChain.config.endpointPool.map((e) => e.url);
  const targetBlockchainRid = pendingTransfer.tx[0][1][
    pendingTransfer.op_index
  ][1][0] as Buffer;
  const targetChain = await createClient({
    directoryNodeUrlPool: nodeUrlPool,
    blockchainRid: targetBlockchainRid.toString('hex'),
  });

  const initTransferTxRid = getTransactionRid(pendingTransfer.tx);
  const iccfProof = await createIccfProof(
    nodeUrlPool,
    initTransferTxRid,
    gtv.gtvHash(pendingTransfer.tx),
    pendingTransfer.tx[0][2], // signers
    sourceChain.config.blockchainRid,
    targetChain.config.blockchainRid
  );

  const applyTransferTx = {
    operations: [
      iccfProof.iccfTx.operations[0],
      op('yours.apply_transfer', pendingTransfer.tx, pendingTransfer.op_index),
    ],
    signers: [], // no signers required
  };

  if (
    !(await targetChain.query<boolean>('yours.is_transfer_applied', {
      tx_rid: initTransferTxRid,
      op_index: pendingTransfer.op_index,
    }))
  ) {
    await targetChain.sendTransaction(applyTransferTx);
  }

  const txGtx = {
    blockchainRid: Buffer.from(targetChain.config.blockchainRid, 'hex'),
    operations: applyTransferTx.operations.map((op) => {
      return {
        opName: op.name,
        args: op.args ?? [],
      };
    }),
    signers: [],
    signatures: [],
  } as GTX;
  const rawApplyTransferTx = gtv.decode(gtx.serialize(txGtx)) as RawGtx;

  const applyTransferTxRid = getTransactionRid(rawApplyTransferTx);
  const applyTransferIccfProof = await createIccfProof(
    nodeUrlPool,
    applyTransferTxRid,
    gtv.gtvHash(rawApplyTransferTx),
    [], // no signers
    targetChain.config.blockchainRid,
    sourceChain.config.blockchainRid
  );

  const completeTransferTx = {
    operations: [
      applyTransferIccfProof.iccfTx.operations[0],
      op(
        'yours.complete_transfer',
        rawApplyTransferTx,
        pendingTransfer.op_index
      ),
    ],
    signers: [],
  };

  await sourceChain.sendTransaction(completeTransferTx);
}

async function createIccfProof(
  nodeUrlPool: string[],
  txRid: Buffer,
  txHash: Buffer,
  signers: Buffer[],
  sourceBlockchainRid: string,
  targetBlockchainRid: string
) {
  const directoryChain = await ensureDirectoryChain(nodeUrlPool);
  await new Promise((resolve) => setTimeout(resolve, 10000));
  let iccfProof: IccfProof | null = null;
  let attempt = 0;
  while (attempt < 10) {
    try {
      iccfProof = await createIccfProofTx(
        directoryChain,
        txRid,
        txHash,
        signers,
        sourceBlockchainRid,
        targetBlockchainRid,
        undefined,
        true
      );
      break;
    } catch (error) {
      console.error(`Failed to create iccf proof`, error);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempt++;
    }
  }

  if (!iccfProof) throw new Error('Failed to create iccf proof');
  return iccfProof;
}

async function ensureDirectoryChain(nodeUrlPool: string[]) {
  return createClient({
    nodeUrlPool,
    blockchainIid: 0,
  });
}
