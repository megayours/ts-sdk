import { Project } from './project';

export type TokenBalance = {
  project: Project;
  collection: string;
  token_id: bigint;
  uid: Buffer;
  type: string;
  amount: bigint;
  account_id: Buffer;
};
