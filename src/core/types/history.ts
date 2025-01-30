import { Token } from './token';

export type TransferHistory = {
  account_id: Buffer;
  amount: bigint;
  decimals: number;
  op_index: number;
  type: 'received' | 'sent';
  token: Token;
  blockchain_rid: Buffer | null;
};
