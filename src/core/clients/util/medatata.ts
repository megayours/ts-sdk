import { Project } from '../../types';

import { IClient } from 'postchain-client';
import { TokenMetadata } from '../../types';

export const fetchMetadata = async (
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
