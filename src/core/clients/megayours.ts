import type { Session } from '@chromia/ft4';
import type { IClient } from 'postchain-client';
import { TokenMetadata } from '../types';
import { performCrossChainTransfer } from '../utils/crosschain';
import { serializeTokenMetadata } from '../utils';
import { TokenBalance } from '../types/balance';

export interface IMegaYoursClient extends Session {
  transferCrosschain(
    toChain: IClient,
    toAccountId: Buffer,
    project: string,
    collection: string,
    tokenId: bigint,
    amount: bigint
  ): Promise<void>;
  getMetadata(
    project: string,
    collection: string,
    tokenId: bigint
  ): Promise<TokenMetadata | null>;
  getTokenBalances(accountId: Buffer): Promise<TokenBalance[]>;
  getTokenBalance(
    accountId: Buffer,
    project: string,
    collection: string,
    tokenId: bigint
  ): Promise<TokenBalance | null>;
}

const fetchMetadata = async (
  session: Session,
  project: string,
  collection: string,
  tokenId: bigint
) => {
  return session.query<TokenMetadata | null>('yours.metadata', {
    project,
    collection,
    token_id: tokenId,
  });
};

export const createMegaYoursClient = (session: Session): IMegaYoursClient => {
  return Object.freeze({
    ...session,
    getMetadata: (project: string, collection: string, tokenId: bigint) => {
      return fetchMetadata(session, project, collection, tokenId);
    },
    transferCrosschain: async (
      toChain: IClient,
      toAccountId: Buffer,
      project: string,
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
      project: string,
      collection: string,
      tokenId: bigint
    ) => {
      return session.query<TokenBalance | null>('yours.balance', {
        account_id: accountId,
        project,
        collection,
        token_id: tokenId,
      });
    },
  });
};
