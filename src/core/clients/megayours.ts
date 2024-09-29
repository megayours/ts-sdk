import type { Session } from '@chromia/ft4';
import type { IClient } from 'postchain-client';
import { TokenMetadata } from '../types';
import { performCrossChainTransfer } from '../utils/crosschain';
import { serializeTokenMetadata } from '../utils';

export interface IMegaYoursClient extends Session {
  transferCrosschain(
    toChain: IClient,
    toAccountId: Buffer,
    tokenId: number,
    amount: number,
    metadata: TokenMetadata
  ): Promise<void>;
  getMetadata(
    project: string,
    collection: string,
    tokenId: number
  ): Promise<TokenMetadata>;
}

export const createMegaYoursClient = (session: Session): IMegaYoursClient => {
  return Object.freeze({
    ...session,
    transferCrosschain: (
      toChain: IClient,
      toAccountId: Buffer,
      tokenId: number,
      amount: number,
      metadata: TokenMetadata
    ) => {
      return performCrossChainTransfer(
        session,
        toChain,
        toAccountId,
        tokenId,
        amount,
        serializeTokenMetadata(metadata)
      );
    },
    getMetadata: (project: string, collection: string, tokenId: number) => {
      return session.query<TokenMetadata>('megayours.metadata', {
        project,
        collection,
        token_id: tokenId,
      });
    },
  });
};
