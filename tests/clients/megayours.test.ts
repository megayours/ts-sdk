import { Session } from '@chromia/ft4';
import { IClient } from 'postchain-client';
import { createMegaYoursClient, IMegaYoursClient } from '../../src/clients';
import { TokenMetadata } from '../../src/types';
import { serializeTokenMetadata } from '../../src/utils';
import { performCrossChainTransfer } from '../../src/utils/crosschain';

// Mock the external modules and functions
jest.mock('../../src/utils/crosschain');
jest.mock('../../src/utils');

describe('createMegaYoursClient', () => {
  let mockSession: jest.Mocked<Session>;
  let client: IMegaYoursClient;

  beforeEach(() => {
    mockSession = {
      query: jest.fn(),
    } as unknown as jest.Mocked<Session>;

    client = createMegaYoursClient(mockSession);
  });

  describe('transferCrosschain', () => {
    it('should call performCrossChainTransfer with the expected arguments', async () => {
      const mockToChain = {} as IClient;
      const mockToAccountId = Buffer.from('mockAccountId');
      const mockTokenId = 123;
      const mockAmount = 100;
      const mockMetadata: TokenMetadata = {
        yours: {
          modules: [],
          project: {
            name: 'testProject',
            owner_id: Buffer.from('testOwnerId'),
          },
          collection: 'testCollection',
        },
        properties: {},
        name: 'Test Token',
        description: 'A test token',
      };
      const mockSerializedMetadata = 'serialized_metadata';

      (serializeTokenMetadata as jest.Mock).mockReturnValue(
        mockSerializedMetadata
      );

      await client.transferCrosschain(
        mockToChain,
        mockToAccountId,
        mockTokenId,
        mockAmount,
        mockMetadata
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
    it('should call session.query with the expected arguments', async () => {
      const mockProject = 'testProject';
      const mockCollection = 'testCollection';
      const mockTokenId = 456;

      await client.getMetadata(mockProject, mockCollection, mockTokenId);

      expect(mockSession.query).toHaveBeenCalledWith('megayours.metadata', {
        project: mockProject,
        collection: mockCollection,
        token_id: mockTokenId,
      });
    });
  });
});