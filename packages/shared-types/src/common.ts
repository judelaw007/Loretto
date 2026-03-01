export type Timestamp = {
  seconds: number;
  nanoseconds: number;
};

export type WithId<T> = T & { id: string };
