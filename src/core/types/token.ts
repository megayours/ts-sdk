import { Project } from './project';

export type Token = {
  project: Project;
  collection: string;
  id: bigint;
  name: string;
  uid: Buffer;
};
