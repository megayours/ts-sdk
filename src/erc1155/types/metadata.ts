import { Property, YoursMetadata } from '../../core/types/metadata';

export type ERC1155BaseMetadata = {
  description: string;
  image: string;
  animation_url: string;
};

export type ERC1155Metadata = ERC1155BaseMetadata & {
  name: string;
  yours: YoursMetadata;
  properties: {
    [key: string]: string | number | boolean | Property;
  };
};
