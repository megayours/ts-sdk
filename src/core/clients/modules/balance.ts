import { IClient } from 'postchain-client';
import { TokenBalance, TokenBalancesArgs } from '../../types/balance';
import { Project } from '../../types';
import { Paginator, createPaginator } from '../../utils/paginator';

export interface IBalanceModule {
  getTokenBalances(
    params: TokenBalancesArgs,
    pageSize?: number,
    initialPageCursor?: string
  ): Promise<Paginator<TokenBalance>>;
  getTokenBalance(
    accountId: Buffer,
    project: Project,
    collection: string,
    tokenId: bigint
  ): Promise<TokenBalance | null>;
  getTokenBalanceByUid(
    accountId: Buffer,
    uid: Buffer
  ): Promise<TokenBalance | null>;
}

export class BalanceModule implements IBalanceModule {
  constructor(private client: IClient) {}

  getTokenBalances(
    args: TokenBalancesArgs,
    pageSize?: number,
    initialPageCursor?: string
  ): Promise<Paginator<TokenBalance>> {
    return createPaginator<TokenBalance>(
      (params) =>
        this.client.query('yours.get_token_balances', {
          account_id: args.account_id || null,
          project_blockchain_rid: args.project?.blockchain_rid || null,
          project_name: args.project?.name || null,
          collection: args.collection || null,
          token_id: args.token_id || null,
          token_uid: args.token_uid || null,
          ...params,
        }),
      pageSize,
      initialPageCursor
    );
  }

  getTokenBalance(
    accountId: Buffer,
    project: Project,
    collection: string,
    tokenId: bigint
  ): Promise<TokenBalance | null> {
    return this.client.query<TokenBalance | null>('yours.balance', {
      account_id: accountId,
      project_name: project.name,
      project_blockchain_rid: project.blockchain_rid,
      collection,
      token_id: tokenId,
    });
  }

  getTokenBalanceByUid(
    accountId: Buffer,
    uid: Buffer
  ): Promise<TokenBalance | null> {
    return this.client.query<TokenBalance | null>('yours.balance_by_uid', {
      account_id: accountId,
      uid,
    });
  }
}
