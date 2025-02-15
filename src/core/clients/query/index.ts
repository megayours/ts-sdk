import { Module } from '../../types/modules';
import { IClient } from 'postchain-client';
import {
  BalanceModule,
  ExternalModule,
  HistoryModule,
  TokenModule,
  CrosschainQueryModule,
  IBalanceModule,
  IExternalModule,
  IHistoryModule,
  ITokenModule,
  ICrosschainQueryModule,
} from '../modules';

export interface IMegaYoursQueryClient extends IClient {
  history: IHistoryModule;
  token: ITokenModule;
  balance: IBalanceModule;
  external: IExternalModule;
  crosschain: ICrosschainQueryModule;
  getSupportedModules(): Promise<Module[]>;
}

export const createMegaYoursQueryClient = (
  client: IClient
): IMegaYoursQueryClient => {
  const history = new HistoryModule(client);
  const token = new TokenModule(client);
  const balance = new BalanceModule(client);
  const external = new ExternalModule(client);
  const crosschain = new CrosschainQueryModule(client);

  return Object.freeze({
    ...client,
    history,
    token,
    balance,
    external,
    crosschain,
    getSupportedModules: async () => {
      return client.query<Module[]>('yours.get_supported_modules');
    },
  });
};
