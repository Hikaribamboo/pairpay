export interface User {
  userName: string;
  userId: string;
  groupId: string;
  pairUserId?: string | null;
  pairUserName?: string | null;
}
