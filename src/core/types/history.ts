import { Token } from './token';

export type TransferHistory = {
  account_id: Buffer;
  amount: bigint;
  decimals: number;
  op_index: number;
  type: 'received' | 'sent' | 'external_received' | 'external_sent';
  token: Token;
  blockchain_rid: Buffer | null;
};
