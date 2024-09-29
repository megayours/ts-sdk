import { Session } from '@chromia/ft4';
import { ERC1155Metadata } from '../types';

export interface IERC1155Client extends Session {
  getERC1155Metadata(
    project: string,
    collection: string,
    tokenId: number
  ): Promise<ERC1155Metadata>;
}
