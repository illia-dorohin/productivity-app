export type TaskStatus = 'not_started' | 'in_progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  readonly _id: string;
  readonly title: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly progress?: number;
  readonly priority?: TaskPriority;
  readonly deadline?: string;
  readonly tags: readonly string[];
  readonly order: number;
}
