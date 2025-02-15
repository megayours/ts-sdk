import { IClient } from 'postchain-client';
import { TokenBalance } from '../../types/balance';
import { Paginator, createPaginator } from '../../utils/paginator';

export interface IExternalModule {
  getExternalOwnersAccountIds(
    chain: string,
    contract: Buffer,
    token_id: bigint,
    pageSize?: number,
    initialPageCursor?: string
  ): Promise<Paginator<Buffer>>;
  getExternalTokensByAccountId(
    accountId: Buffer,
    pageSize?: number,
    initialPageCursor?: string
  ): Promise<Paginator<TokenBalance>>;
}

export class ExternalModule implements IExternalModule {
  constructor(private client: IClient) {}

  getExternalOwnersAccountIds(
    chain: string,
    contract: Buffer,
    token_id: bigint,
    pageSize?: number,
    initialPageCursor?: string
  ): Promise<Paginator<Buffer>> {
    return createPaginator<Buffer>(
      (params) =>
        this.client.query('yours.external.owners_account_ids', {
          chain,
          contract,
          token_id,
          ...params,
        }),
      pageSize,
      initialPageCursor
    );
  }

  getExternalTokensByAccountId(
    accountId: Buffer,
    pageSize?: number,
    initialPageCursor?: string
  ): Promise<Paginator<TokenBalance>> {
    return createPaginator<TokenBalance>(
      (params) =>
        this.client.query('yours.external.get_tokens', {
          account_id: accountId,
          ...params,
        }),
      pageSize,
      initialPageCursor
    );
  }
}
