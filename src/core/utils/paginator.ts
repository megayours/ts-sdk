export class Paginator<T> {
  readonly fetchNext: () => Promise<Paginator<T>>;
  readonly data: T[];

  constructor(fetchNext: () => Promise<Paginator<T>>, data: T[]) {
    this.fetchNext = fetchNext;
    this.data = data;
  }
}
