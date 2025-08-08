export interface User {
  userName: string;
  userId: string;
  groupId: string;
}

export interface Group {
  groupId: string;
  members: string[];
  paired: boolean;
  createdAt: Date;
}
