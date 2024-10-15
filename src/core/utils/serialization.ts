import { TokenMetadata } from '../types';

export function serializeTokenMetadata(metadata: TokenMetadata): any[] {
  const yours: any[] = [
    metadata.yours.modules,
    [metadata.yours.project.name, metadata.yours.project.blockchain_rid],
    metadata.yours.collection,
  ];

  const result: any[] = [
    metadata.name,
    JSON.stringify(metadata.properties),
    yours,
  ];

  return result;
}
