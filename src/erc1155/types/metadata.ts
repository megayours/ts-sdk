import {
  Property,
  RootMetadata,
  YoursMetadata,
} from '../../core/types/metadata';

export type ERC1155RootMetadata = RootMetadata & {
  description: string;
  image: string;
  animation_url: string;
};

export type ERC1155Metadata = ERC1155RootMetadata & {
  description: string;
  image: string;
  animation_url: string;
  yours: YoursMetadata;
  properties: {
    [key: string]: string | number | boolean | Property;
  };
};
