import { RawGtv } from 'postchain-client';

export type Attribute = {
  trait_type: string;
  value: string;
};

export type YoursMetadata = {
  modules: string[];
  project: ProjectMetadata;
  collection: string;
  type: string;
  blockchains: Buffer[];
};

export type ProjectMetadata = {
  name: string;
  blockchain_rid: Buffer;
};

export type Property = {
  name?: string;
  value: RawGtv;
  display_value?: string;
  class?: string;
  css?: {
    [key: string]: RawGtv;
  };
};

export type TokenMetadata = {
  name: string;
  yours: YoursMetadata;
  properties: {
    [key: string]: string | number | boolean | Property | Property[];
  };
};
