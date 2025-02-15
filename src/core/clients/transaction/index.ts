import { Session } from '@chromia/ft4';
import { createMegaYoursQueryClient, IMegaYoursQueryClient } from '../query';
import {
  CrosschainTransactionModule,
  ICrosschainTransactionModule,
} from '../modules';

export interface IMegaYoursClient extends Session, IMegaYoursQueryClient {
  crosschain: ICrosschainTransactionModule;
}

export const createMegaYoursClient = (session: Session): IMegaYoursClient => {
  const queryClient = createMegaYoursQueryClient(session.client);
  const crosschain = new CrosschainTransactionModule(session);

  return Object.freeze({
    ...queryClient,
    ...session,
    crosschain,
  });
};
