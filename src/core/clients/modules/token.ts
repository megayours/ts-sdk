import { IClient } from 'postchain-client';
import { Project, Token, TokenMetadata } from '../../types';
import { fetchMetadata } from '../util/medatata';

export interface ITokenModule {
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
}

export class TokenModule implements ITokenModule {
  constructor(private client: IClient) {}

  getToken(
    project: Project,
    collection: string,
    tokenId: bigint
  ): Promise<Token | null> {
    return this.client.query<Token | null>('yours.get_token_info', {
      project_name: project.name,
      project_blockchain_rid: project.blockchain_rid,
      collection,
      token_id: tokenId,
    });
  }

  getTokenByUid(uid: Buffer): Promise<Token | null> {
    return this.client.query<Token | null>('yours.get_token_info_by_uid', {
      uid,
    });
  }

  getMetadata(
    project: Project,
    collection: string,
    tokenId: bigint
  ): Promise<TokenMetadata | null> {
    return fetchMetadata(this.client, project, collection, tokenId);
  }

  getMetadataByUid(uid: Buffer): Promise<TokenMetadata | null> {
    return this.client.query<TokenMetadata | null>('yours.metadata_by_uid', {
      uid,
    });
  }
}
