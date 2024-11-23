import { IClient, RawGtv } from 'postchain-client';
import {
  noopAuthenticator,
  nop,
  op,
  Session,
  transactionBuilder,
} from '@chromia/ft4';

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
      .add(op('yours.init_transfer', toAccountId, tokenId, amount, metadata), {
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
      })
      .buildAndSendWithAnchoring()
      .catch((error) => {
        reject(error);
      });
  });
}
