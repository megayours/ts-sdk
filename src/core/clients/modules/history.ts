import { HistoryArgs, TransferHistory } from '../../types';
import { IClient } from 'postchain-client';
import { Paginator, createPaginator } from '../../utils/paginator';

export interface IHistoryModule {
  getTransfers(
    args: HistoryArgs,
    pageSize?: number,
    initialPageCursor?: string
  ): Promise<Paginator<TransferHistory>>;
  getTransferEntry(rowid: number): Promise<TransferHistory | null>;
}

export class HistoryModule implements IHistoryModule {
  constructor(private client: IClient) {}

  getTransfers(
    args: HistoryArgs,
    pageSize?: number,
    initialPageCursor?: string
  ): Promise<Paginator<TransferHistory>> {
    return createPaginator<TransferHistory>(
      (params) =>
        this.client.query('yours.get_transfer_history', {
          account_id: args.account_id || null,
          project_blockchain_rid: args.project?.blockchain_rid || null,
          project_name: args.project?.name || null,
          collection: args.collection || null,
          token_id: args.token_id || null,
          token_uid: args.token_uid || null,
          type: args.type || null,
          from_height: args.from_height || null,
          ...params,
        }),
      pageSize,
      initialPageCursor
    );
  }

  getTransferEntry(rowid: number): Promise<TransferHistory | null> {
    return this.client.query<TransferHistory | null>(
      'yours.get_transfer_history_entry',
      {
        rowid,
      }
    );
  }
}
