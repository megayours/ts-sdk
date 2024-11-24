import { Project } from './project';

export type TokenBalance = {
  project: Project;
  collection: string;
  tokenId: bigint;
  type: string;
  amount: bigint;
};
