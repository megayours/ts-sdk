import { RawGtx } from 'postchain-client';

export type PendingTransfer = {
  tx: RawGtx;
  op_index: number;
};
