import type { Session } from '@chromia/ft4';
import type { IClient } from 'postchain-client';
import { Project, TokenMetadata } from '../types';
import { performCrossChainTransfer } from '../utils/crosschain';
import { serializeTokenMetadata } from '../utils';
import { TokenBalance } from '../types/balance';
import { TransferHistory } from '../types/history';
import { Paginator } from '../utils/paginator';

export interface IMegaYoursClient extends Session {
  transferCrosschain(
    toChain: IClient,
    toAccountId: Buffer,
    project: Project,
    collection: string,
    tokenId: bigint,
    amount: bigint
  ): Promise<void>;
  getMetadata(
    project: Project,
    collection: string,
    tokenId: bigint
  ): Promise<TokenMetadata | null>;
  getMetadataByUid(uid: Buffer): Promise<TokenMetadata | null>;
  getTokenBalances(accountId: Buffer): Promise<TokenBalance[]>;
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
    accountId: Buffer,
    type: 'received' | 'sent' | null,
    pageSize: number | null,
    initialPageCursor: string | null
  ): Promise<Paginator<TransferHistory>>;
}

const fetchMetadata = async (
  session: Session,
  project: Project,
  collection: string,
  tokenId: bigint
) => {
  return session.query<TokenMetadata | null>('yours.metadata', {
    project_name: project.name,
    project_blockchain_rid: project.blockchain_rid,
    collection,
    token_id: tokenId,
  });
};

export const createMegaYoursClient = (session: Session): IMegaYoursClient => {
  return Object.freeze({
    ...session,
    getMetadata: (project: Project, collection: string, tokenId: bigint) => {
      return fetchMetadata(session, project, collection, tokenId);
    },
    getMetadataByUid: async (uid: Buffer) => {
      return session.query<TokenMetadata | null>('yours.metadata_by_uid', {
        uid,
      });
    },
    transferCrosschain: async (
      toChain: IClient,
      toAccountId: Buffer,
      project: Project,
      collection: string,
      tokenId: bigint,
      amount: bigint
    ) => {
      const metadata = await fetchMetadata(
        session,
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
    getTokenBalances: async (accountId: Buffer) => {
      return session.query<TokenBalance[]>('yours.get_token_balances', {
        account_id: accountId,
      });
    },
    getTokenBalance: async (
      accountId: Buffer,
      project: Project,
      collection: string,
      tokenId: bigint
    ) => {
      return session.query<TokenBalance | null>('yours.balance', {
        account_id: accountId,
        project_name: project.name,
        project_blockchain_rid: project.blockchain_rid,
        collection,
        token_id: tokenId,
      });
    },
    getTokenBalanceByUid: async (accountId: Buffer, uid: Buffer) => {
      return session.query<TokenBalance | null>('yours.balance_by_uid', {
        account_id: accountId,
        uid,
      });
    },
    getTransferHistory: async (
      accountId: Buffer,
      type: 'received' | 'sent' | null,
      pageSize: number | null,
      initialPageCursor: string | null
    ) => {
      const OUT_OF_PAGES = 'OUT_OF_PAGES';
      const fetchNext = async (
        currentCursor: string | null
      ): Promise<Paginator<TransferHistory>> => {
        if (currentCursor === OUT_OF_PAGES) {
          // Out of data
          return new Paginator(() => fetchNext(currentCursor), []);
        }

        const result = await session.query<{
          data: TransferHistory[];
          next_cursor: string | null;
        }>('yours.get_transfer_history', {
          account_id: accountId,
          type,
          page_size: pageSize,
          page_cursor: currentCursor,
        });

        const nextCursor = result.next_cursor || OUT_OF_PAGES;

        return new Paginator(() => fetchNext(nextCursor), result.data);
      };

      return fetchNext(initialPageCursor);
    },
  });
};
