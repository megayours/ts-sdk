import { Project } from './project';

export type TokenBalance = {
  project: Project;
  collection: string;
  token_id: bigint;
  type: string;
  amount: bigint;
};
