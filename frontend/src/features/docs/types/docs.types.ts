import type { ReactNode } from 'react';

export type DocTopicId =
  | 'mvvm'
  | 'folders'
  | 'coding-standards'
  | 'imports'
  | 'state'
  | 'api'
  | 'performance';

export interface DocTopicItem {
  id: DocTopicId;
  title: string;
  icon: ReactNode;
  summary: string;
  content: string;
}
