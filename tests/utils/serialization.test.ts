import { TokenMetadata } from '../../src/core/types/metadata';
import { serializeTokenMetadata } from '../../src/core/utils/serialization';

describe('Serialization', () => {
  it('should serialize and deserialize TokenMetadata correctly', () => {
    const metadata: TokenMetadata = {
      name: 'test name',
      properties: {
        test: 'test property',
      },
      yours: {
        modules: ['test module'],
        project: {
          name: 'test project',
          blockchain_rid: Buffer.from('DEADBEEF', 'hex'),
        },
        collection: 'test collection',
        type: 'yours',
      },
    };

    const serialized = serializeTokenMetadata(metadata);
    expect(serialized).toBeInstanceOf(Array);
    expect(serialized.length).toBe(3);

    expect(serialized[0]).toBe(metadata.name);

    const propertiesJson = JSON.parse(serialized[1]);
    expect(propertiesJson).toEqual(metadata.properties);

    const yours = serialized[2];
    expect(yours[0]).toEqual(metadata.yours.modules);

    const project = yours[1];
    expect(project[0]).toBe(metadata.yours.project.name);
    expect(project[1]).toEqual(metadata.yours.project.blockchain_rid);

    expect(yours[2]).toBe(metadata.yours.collection);
  });

  it('should serialize TokenMetadata with null values', () => {
    const metadata: TokenMetadata = {
      name: 'test name',
      properties: {
        test: 'test property',
      },
      yours: {
        modules: ['test module'],
        project: {
          name: 'test project',
          blockchain_rid: Buffer.from('DEADBEEF', 'hex'),
        },
        collection: 'test collection',
        type: 'yours',
      },
    };

    const serialized = serializeTokenMetadata(metadata);
    expect(serialized).toBeInstanceOf(Array);
    expect(serialized.length).toBe(3);

    expect(serialized[0]).toBe(metadata.name);

    const propertiesJson = JSON.parse(serialized[1]);
    expect(propertiesJson).toEqual(metadata.properties);

    const yours = serialized[2];
    expect(yours[0]).toEqual(metadata.yours.modules);

    const project = yours[1];
    expect(project[0]).toBe(metadata.yours.project.name);
    expect(project[1]).toEqual(metadata.yours.project.blockchain_rid);
    expect(yours[2]).toBe(metadata.yours.collection);
  });
});
