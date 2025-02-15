import { IClient, gtv, RawGtx } from 'postchain-client';
import { PendingTransfer } from '../../types/crosschain';
import { Project } from '../../types';
import { Session } from '@chromia/ft4';
import {
  performCrossChainTransfer,
  resumeCrossChainTransfer,
} from '../../utils/crosschain';
import { serializeTokenMetadata } from '../../utils';
import { fetchMetadata } from '../util/medatata';

export interface ICrosschainQueryModule {
  getPendingTransfers(accountId: Buffer): Promise<PendingTransfer[]>;
}

export interface ICrosschainTransactionModule extends ICrosschainQueryModule {
  transfer(
    toChain: IClient,
    toAccountId: Buffer,
    project: Project,
    collection: string,
    tokenId: bigint,
    amount: bigint
  ): Promise<void>;
  resumeTransfer(transfer: PendingTransfer): Promise<void>;
}

export class CrosschainQueryModule implements ICrosschainQueryModule {
  constructor(private client: IClient) {}

  getPendingTransfers(accountId: Buffer): Promise<PendingTransfer[]> {
    return this.client
      .query<{ tx_data: Buffer; op_index: number }[]>(
        'yours.get_pending_transfers_for_account',
        {
          account_id: accountId,
        }
      )
      .then((res) =>
        res.map((tx) => ({
          tx: gtv.decode(tx.tx_data) as RawGtx,
          op_index: tx.op_index,
        }))
      );
  }
}

export class CrosschainTransactionModule
  implements ICrosschainTransactionModule
{
  private queryModule: CrosschainQueryModule;

  constructor(private session: Session) {
    this.queryModule = new CrosschainQueryModule(session.client);
  }

  getPendingTransfers(accountId: Buffer): Promise<PendingTransfer[]> {
    return this.queryModule.getPendingTransfers(accountId);
  }

  async transfer(
    toChain: IClient,
    toAccountId: Buffer,
    project: Project,
    collection: string,
    tokenId: bigint,
    amount: bigint
  ): Promise<void> {
    const metadata = await fetchMetadata(
      this.session.client,
      project,
      collection,
      tokenId
    );
    if (!metadata) {
      throw new Error(
        `Token metadata not found for ${project}/${collection}/${tokenId}`
      );
    }
    return performCrossChainTransfer(
      this.session,
      toChain,
      toAccountId,
      tokenId,
      amount,
      serializeTokenMetadata(metadata)
    );
  }

  async resumeTransfer(transfer: PendingTransfer): Promise<void> {
    return resumeCrossChainTransfer(this.session, transfer);
  }
}
