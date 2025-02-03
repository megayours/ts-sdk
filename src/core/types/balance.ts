import { Project } from './project';

export type TokenBalancesArgs = {
  account_id?: Buffer;
  project?: Project;
  collection?: string;
  token_id?: bigint;
  token_uid?: Buffer;
};

export type TokenBalance = {
  project: Project;
  collection: string;
  token_id: bigint;
  uid: Buffer;
  type: string;
  amount: bigint;
  account_id: Buffer;
};
