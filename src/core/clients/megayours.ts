import type { Session } from '@chromia/ft4';
import type { IClient } from 'postchain-client';
import { TokenMetadata } from '../types';
import { performCrossChainTransfer } from '../utils/crosschain';
import { serializeTokenMetadata } from '../utils';

export interface IMegaYoursClient extends Session {
  transferCrosschain(
    toChain: IClient,
    toAccountId: Buffer,
    project: string,
    collection: string,
    tokenId: number,
    amount: number
  ): Promise<void>;
  getMetadata(
    project: string,
    collection: string,
    tokenId: number
  ): Promise<TokenMetadata>;
}

const fetchMetadata = async (
  session: Session,
  project: string,
  collection: string,
  tokenId: number
) => {
  return session.query<TokenMetadata>('yours.metadata', {
    project,
    collection,
    token_id: tokenId,
  });
};

export const createMegaYoursClient = (session: Session): IMegaYoursClient => {
  return Object.freeze({
    ...session,
    getMetadata: (project: string, collection: string, tokenId: number) => {
      return fetchMetadata(session, project, collection, tokenId);
    },
    transferCrosschain: async (
      toChain: IClient,
      toAccountId: Buffer,
      project: string,
      collection: string,
      tokenId: number,
      amount: number
    ) => {
      const metadata = await fetchMetadata(
        session,
        project,
        collection,
        tokenId
      );
      console.log('metadata', metadata);
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
