declare global {
  interface Buffer extends Uint8Array {
    write(
      string: string,
      offset?: number,
      length?: number,
      encoding?: string
    ): number;
    toString(encoding?: string, start?: number, end?: number): string;
    toJSON(): { type: 'Buffer'; data: number[] };
    equals(otherBuffer: Uint8Array): boolean;
    compare(
      target: Uint8Array,
      targetStart?: number,
      targetEnd?: number,
      sourceStart?: number,
      sourceEnd?: number
    ): number;
    copy(
      target: Uint8Array,
      targetStart?: number,
      sourceStart?: number,
      sourceEnd?: number
    ): number;
    slice(start?: number, end?: number): Buffer;
    writeUInt8(value: number, offset: number): number;
    readUInt8(offset: number): number;
    // Add more methods as needed
  }

  const Buffer: {
    from(array: Uint8Array): Buffer;
    from(
      arrayBuffer: ArrayBuffer,
      byteOffset?: number,
      length?: number
    ): Buffer;
    from(data: number[]): Buffer;
    from(data: Uint8Array): Buffer;
    from(str: string, encoding?: string): Buffer;
    isBuffer(obj: any): obj is Buffer;
    // Add more static methods as needed
  };
}

export {};
