import { Project } from './project';
import { Token } from './token';

export type HistoryArgs = {
  account_id?: Buffer;
  project?: Project;
  collection?: string;
  token_uid?: Buffer;
  from_height?: number;
  type?: 'received' | 'sent' | 'external_received' | 'external_sent';
};

export type TransferHistory = {
  account_id: Buffer;
  amount: bigint;
  decimals: number;
  op_index: number;
  type: 'received' | 'sent' | 'external_received' | 'external_sent';
  token: Token;
  blockchain_rid: Buffer | null;
};
