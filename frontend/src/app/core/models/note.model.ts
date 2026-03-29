export interface Note {
  readonly _id: string;
  readonly text: string;
  readonly date: string;
  readonly tags: readonly string[];
  readonly createdAt: string;
}
