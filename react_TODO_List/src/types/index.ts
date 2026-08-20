export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface Board {
  id: string;
  title: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string;
  assigneeId: "";
  savedBy: string[];
}