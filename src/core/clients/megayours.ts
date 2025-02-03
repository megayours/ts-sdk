import type { Session } from '@chromia/ft4';
import type { IClient } from 'postchain-client';
import { Project, Token, TokenMetadata } from '../types';
import { performCrossChainTransfer } from '../utils/crosschain';
import { serializeTokenMetadata } from '../utils';
import { TokenBalance, TokenBalancesArgs } from '../types/balance';
import { HistoryArgs, TransferHistory } from '../types/history';
import { Paginator } from '../utils/paginator';
import { createPaginator } from '../utils/paginator';
import { Module } from '../types/modules';

export interface IMegaYoursQueryClient extends IClient {
  getSupportedModules(): Promise<Module[]>;
  getToken(
    project: Project,
    collection: string,
    tokenId: bigint
  ): Promise<Token | null>;
  getTokenByUid(uid: Buffer): Promise<Token | null>;
  getMetadata(
    project: Project,
    collection: string,
    tokenId: bigint
  ): Promise<TokenMetadata | null>;
  getMetadataByUid(uid: Buffer): Promise<TokenMetadata | null>;
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
  getTransferHistory(
    args: HistoryArgs,
    pageSize?: number,
    initialPageCursor?: string
  ): Promise<Paginator<TransferHistory>>;
  getTransferHistoryEntry(rowid: number): Promise<TransferHistory | null>;
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

export interface IMegaYoursClient extends Session, IMegaYoursQueryClient {
  transferCrosschain(
    toChain: IClient,
    toAccountId: Buffer,
    project: Project,
    collection: string,
    tokenId: bigint,
    amount: bigint
  ): Promise<void>;
}

const fetchMetadata = async (
  client: IClient,
  project: Project,
  collection: string,
  tokenId: bigint
) => {
  return client.query<TokenMetadata | null>('yours.metadata', {
    project_name: project.name,
    project_blockchain_rid: project.blockchain_rid,
    collection,
    token_id: tokenId,
  });
};

export const createMegaYoursQueryClient = (
  client: IClient
): IMegaYoursQueryClient => {
  return Object.freeze({
    ...client,
    getSupportedModules: async () => {
      return client.query<Module[]>('yours.get_supported_modules');
    },
    getToken: async (project: Project, collection: string, tokenId: bigint) => {
      return client.query<Token | null>('yours.get_token_info', {
        project_name: project.name,
        project_blockchain_rid: project.blockchain_rid,
        collection,
        token_id: tokenId,
      });
    },
    getTokenByUid: async (uid: Buffer) => {
      return client.query<Token | null>('yours.get_token_info_by_uid', {
        uid,
      });
    },
    getMetadata: (project: Project, collection: string, tokenId: bigint) => {
      return fetchMetadata(client, project, collection, tokenId);
    },
    getMetadataByUid: async (uid: Buffer) => {
      return client.query<TokenMetadata | null>('yours.metadata_by_uid', {
        uid,
      });
    },
    getTokenBalances: (
      args: TokenBalancesArgs,
      pageSize?: number,
      initialPageCursor?: string
    ) => {
      return createPaginator<TokenBalance>(
        (params) =>
          client.query('yours.get_token_balances', {
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
    },
    getTokenBalance: async (
      accountId: Buffer,
      project: Project,
      collection: string,
      tokenId: bigint
    ) => {
      return client.query<TokenBalance | null>('yours.balance', {
        account_id: accountId,
        project_name: project.name,
        project_blockchain_rid: project.blockchain_rid,
        collection,
        token_id: tokenId,
      });
    },
    getTokenBalanceByUid: async (accountId: Buffer, uid: Buffer) => {
      return client.query<TokenBalance | null>('yours.balance_by_uid', {
        account_id: accountId,
        uid,
      });
    },

    // Transfer history
    getTransferHistory: (
      args: HistoryArgs,
      pageSize?: number,
      initialPageCursor?: string
    ) => {
      return createPaginator<TransferHistory>(
        (params) =>
          client.query('yours.get_transfer_history', {
            account_id: args.account_id || null,
            project_blockchain_rid: args.project?.blockchain_rid || null,
            project_name: args.project?.name || null,
            collection: args.collection || null,
            token_uid: args.token_uid || null,
            type: args.type || null,
            from_height: args.from_height || null,
            ...params,
          }),
        pageSize,
        initialPageCursor
      );
    },
    getTransferHistoryEntry: async (rowid: number) => {
      return client.query<TransferHistory | null>(
        'yours.get_transfer_history_entry',
        {
          rowid,
        }
      );
    },
    getExternalOwnersAccountIds: async (
      chain: string,
      contract: Buffer,
      token_id: bigint,
      pageSize?: number,
      initialPageCursor?: string
    ) => {
      return createPaginator<Buffer>(
        (params) =>
          client.query('yours.external.owners_account_ids', {
            chain,
            contract,
            token_id,
            ...params,
          }),
        pageSize,
        initialPageCursor
      );
    },
    getExternalTokensByAccountId: async (
      accountId: Buffer,
      pageSize?: number,
      initialPageCursor?: string
    ) => {
      return createPaginator<TokenBalance>(
        (params) =>
          client.query('yours.external.get_tokens', {
            account_id: accountId,
            ...params,
          }),
        pageSize,
        initialPageCursor
      );
    },
  });
};

export const createMegaYoursClient = (session: Session): IMegaYoursClient => {
  return Object.freeze({
    ...createMegaYoursQueryClient(session.client),
    ...session,
    transferCrosschain: async (
      toChain: IClient,
      toAccountId: Buffer,
      project: Project,
      collection: string,
      tokenId: bigint,
      amount: bigint
    ) => {
      const metadata = await fetchMetadata(
        session.client,
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
        session,
        toChain,
        toAccountId,
        tokenId,
        amount,
        serializeTokenMetadata(metadata)
      );
    },
  });
};
