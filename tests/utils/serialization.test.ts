import { TokenMetadata } from '../../src/types/metadata';
import { serializeTokenMetadata } from '../../src/utils/serialization';

describe('Serialization', () => {
  it('should serialize and deserialize TokenMetadata correctly', () => {
    const metadata: TokenMetadata = {
      name: 'test name',
      description: 'test description',
      image: 'test image',
      animation_url: 'test animation url',
      properties: {
        test: 'test property',
      },
      yours: {
        modules: ['test module'],
        project: {
          name: 'test project',
          owner_id: Buffer.from('DEADBEEF', 'hex'),
        },
        collection: 'test collection',
      },
    };

    const serialized = serializeTokenMetadata(metadata);
    expect(serialized).toBeInstanceOf(Array);
    expect(serialized.length).toBe(6);

    expect(serialized[0]).toBe(metadata.name);

    const propertiesJson = JSON.parse(serialized[1]);
    expect(propertiesJson).toEqual(metadata.properties);

    const yours = serialized[2];
    expect(yours[0]).toEqual(metadata.yours.modules);

    const project = yours[1];
    expect(project[0]).toBe(metadata.yours.project.name);
    expect(project[1]).toEqual(metadata.yours.project.owner_id);

    expect(yours[2]).toBe(metadata.yours.collection);

    expect(serialized[3]).toBe(metadata.description);
    expect(serialized[4]).toBe(metadata.image);
    expect(serialized[5]).toBe(metadata.animation_url);
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
          owner_id: Buffer.from('DEADBEEF', 'hex'),
        },
        collection: 'test collection',
      },
    };

    const serialized = serializeTokenMetadata(metadata);
    expect(serialized).toBeInstanceOf(Array);
    expect(serialized.length).toBe(6);

    expect(serialized[0]).toBe(metadata.name);

    const propertiesJson = JSON.parse(serialized[1]);
    expect(propertiesJson).toEqual(metadata.properties);

    const yours = serialized[2];
    expect(yours[0]).toEqual(metadata.yours.modules);

    const project = yours[1];
    expect(project[0]).toBe(metadata.yours.project.name);
    expect(project[1]).toEqual(metadata.yours.project.owner_id);

    expect(yours[2]).toBe(metadata.yours.collection);

    expect(serialized[3]).toBe(null);
    expect(serialized[4]).toBe(null);
    expect(serialized[5]).toBe(null);
  });
});
