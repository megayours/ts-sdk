import { Session } from '@chromia/ft4';
import { IClient } from 'postchain-client';
import {
  createMegaYoursClient,
  IMegaYoursClient,
} from '../../src/core/clients';
import { Project, TokenMetadata } from '../../src/core/types';
import { serializeTokenMetadata } from '../../src/core/utils';
import { performCrossChainTransfer } from '../../src/core/utils/crosschain';

// Mock the external modules and functions
jest.mock('../../src/core/utils/crosschain');
jest.mock('../../src/core/utils');

describe('createMegaYoursClient', () => {
  let mockSession: jest.Mocked<Session>;
  let client: IMegaYoursClient;
  let mockPcClient: jest.Mocked<IClient>;

  beforeEach(() => {
    mockPcClient = {
      query: jest.fn(),
    } as unknown as jest.Mocked<IClient>;

    mockSession = {
      query: jest.fn(),
      client: mockPcClient,
    } as unknown as jest.Mocked<Session>;
    client = createMegaYoursClient(mockSession);
  });

  describe('transferCrosschain', () => {
    it('should call performCrossChainTransfer with the expected arguments', async () => {
      const mockToChain = {} as IClient;
      const mockToAccountId = Buffer.from('mockAccountId');
      const mockTokenId = BigInt(123);
      const mockAmount = BigInt(100);
      const mockMetadata: TokenMetadata = {
        yours: {
          modules: [],
          project: {
            name: 'testProject',
            blockchain_rid: Buffer.from('DEADBEEF', 'hex'),
          },
          collection: 'testCollection',
          type: 'yours',
          blockchains: [Buffer.from('DEADBEEF', 'hex')],
        },
        properties: {},
        name: 'Test Token',
      };
      const mockSerializedMetadata = 'serialized_metadata';

      (serializeTokenMetadata as jest.Mock).mockReturnValue(
        mockSerializedMetadata
      );

      mockPcClient.query.mockResolvedValue(mockMetadata);

      await client.crosschain.transfer(
        mockToChain,
        mockToAccountId,
        mockMetadata.yours.project,
        mockMetadata.yours.collection,
        mockTokenId,
        mockAmount
      );

      expect(performCrossChainTransfer).toHaveBeenCalledWith(
        mockSession,
        mockToChain,
        mockToAccountId,
        mockTokenId,
        mockAmount,
        mockSerializedMetadata
      );
      expect(serializeTokenMetadata).toHaveBeenCalledWith(mockMetadata);
    });
  });

  describe('getMetadata', () => {
    it('should call client.query with the expected arguments', async () => {
      const mockProject: Project = {
        name: 'mockProject',
        blockchain_rid: Buffer.from('DEADBEEF', 'hex'),
      };
      const mockCollection = 'testCollection';
      const mockTokenId = BigInt(456);

      await client.token.getMetadata(mockProject, mockCollection, mockTokenId);

      expect(mockPcClient.query).toHaveBeenCalledWith('yours.metadata', {
        project_name: mockProject.name,
        project_blockchain_rid: mockProject.blockchain_rid,
        collection: mockCollection,
        token_id: mockTokenId,
      });
    });
  });
});
